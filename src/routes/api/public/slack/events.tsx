import { createFileRoute } from "@tanstack/react-router";
import { getSlackEnv, verifySlackRequest } from "@/lib/slack.server";

export const Route = createFileRoute("/api/public/slack/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { signingSecret } = getSlackEnv();
        const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
        const signature = request.headers.get("x-slack-signature") ?? "";
        const rawBody = await request.text();

        if (!verifySlackRequest(signingSecret, timestamp, rawBody, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(rawBody) as {
          type?: string;
          challenge?: string;
          team_id?: string;
          event?: {
            type?: string;
            team?: string;
            team_id?: string;
            channel?: string;
            user?: string;
            text?: string;
            ts?: string;
            thread_ts?: string;
            subtype?: string;
            [key: string]: unknown;
          };
        };

        if (payload.type === "url_verification") {
          return new Response(payload.challenge ?? "", {
            headers: { "Content-Type": "text/plain" },
          });
        }

        const event = payload.event;
        const teamId = event?.team ?? event?.team_id ?? payload.team_id;

        if (event && teamId) {
          await processEvent(teamId, event);
        }

        return new Response("ok");
      },
    },
  },
});

async function processEvent(teamId: string, event: any) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Always queue for audit
  await supabaseAdmin.from("slack_event_queue").insert({
    slack_team_id: teamId,
    event_type: event.type ?? "unknown",
    payload: event,
  });

  // Find workspace + bot token
  const { data: installation } = await supabaseAdmin
    .from("slack_installations")
    .select("workspace_id, bot_token")
    .eq("slack_team_id", teamId)
    .maybeSingle();

  if (!installation?.workspace_id) return;
  const workspaceId = installation.workspace_id as string;
  const botToken = installation.bot_token as string | null;

  if (event.type === "app_home_opened" && botToken && event.user) {
    await publishAppHome(botToken, event.user).catch((err) => console.error("views.publish failed", err));
    return;
  }

  if (event.type === "assistant_thread_started" && botToken) {
    const channel = event.channel ?? event.channel_id ?? event.assistant_thread?.channel_id;
    const threadTs = event.thread_ts ?? event.assistant_thread?.thread_ts ?? event.ts;
    if (channel) {
      await postSlackMessage(botToken, channel, "Ask me anything about this workspace’s indexed Slack history. For best results, ask inside Trelo’s dashboard by channel.", threadTs);
    }
    return;
  }

  // Only process real user messages / app mentions (skip bot messages, edits, joins, etc.)
  const isMessageLike = event.type === "message" || event.type === "app_mention";
  if (!isMessageLike || event.subtype || !event.text || !event.channel || event.bot_id) return;

  // Upsert channel (fetch name lazily)
  let channelName: string | null = null;
  if (botToken) {
    try {
      const chanRes = await fetch(
        `https://slack.com/api/conversations.info?channel=${event.channel}`,
        { headers: { Authorization: `Bearer ${botToken}` } },
      );
      const chanData = (await chanRes.json()) as any;
      if (chanData.ok) channelName = chanData.channel?.name ?? null;
    } catch (err) {
      console.error("conversations.info failed", err);
    }
  }

  await supabaseAdmin.from("slack_channels").upsert(
    {
      workspace_id: workspaceId,
      slack_channel_id: event.channel,
      name: channelName,
      is_private: false,
    },
    { onConflict: "workspace_id,slack_channel_id" },
  );

  // Fetch user profile (best effort)
  let userName: string | null = null;
  if (botToken && event.user) {
    try {
      const userRes = await fetch(`https://slack.com/api/users.info?user=${event.user}`, {
        headers: { Authorization: `Bearer ${botToken}` },
      });
      const userData = (await userRes.json()) as any;
      if (userData.ok) {
        userName =
          userData.user?.profile?.display_name ||
          userData.user?.real_name ||
          userData.user?.name ||
          null;
      }
    } catch (err) {
      console.error("users.info failed", err);
    }
  }

  // Fetch permalink (best effort)
  let permalink: string | null = null;
  if (botToken && event.ts) {
    try {
      const linkRes = await fetch(
        `https://slack.com/api/chat.getPermalink?channel=${event.channel}&message_ts=${event.ts}`,
        { headers: { Authorization: `Bearer ${botToken}` } },
      );
      const linkData = (await linkRes.json()) as any;
      if (linkData.ok) permalink = linkData.permalink ?? null;
    } catch (err) {
      console.error("chat.getPermalink failed", err);
    }
  }

  // Insert message
  const { data: msgRow, error: messageError } = await supabaseAdmin
    .from("slack_messages")
    .upsert(
      {
        workspace_id: workspaceId,
        slack_channel_id: event.channel,
        slack_user_id: event.user ?? null,
        slack_user_name: userName,
        text: event.text,
        ts: event.ts ?? null,
        permalink,
        created_at: event.ts ? new Date(Math.floor(Number.parseFloat(event.ts) * 1000)).toISOString() : undefined,
      },
      { onConflict: "workspace_id,slack_channel_id,ts" },
    )
    .select("id")
    .single();

  if (messageError) {
    console.error("Failed to save Slack message", messageError);
    return;
  }

  void extractCommitments({ workspaceId, event, userName, channelName, permalink }).catch((err) => {
    console.error("commitment extraction failed", err);
  });

  const shouldReply = botToken && (event.type === "app_mention" || event.channel_type === "im");
  if (shouldReply) {
    void answerSlackQuestion({ workspaceId, botToken, event, channelName }).catch((err) => {
      console.error("Slack answer failed", err);
    });
  }

  void msgRow;
}

async function slackApi(botToken: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as any;
  if (!res.ok || data.ok === false) {
    throw new Error(`${method} failed: ${data.error ?? res.statusText}`);
  }
  return data;
}

async function postSlackMessage(botToken: string, channel: string, text: string, threadTs?: string | null) {
  await slackApi(botToken, "chat.postMessage", {
    channel,
    text,
    ...(threadTs ? { thread_ts: threadTs } : {}),
  });
}

async function publishAppHome(botToken: string, userId: string) {
  await slackApi(botToken, "views.publish", {
    user_id: userId,
    view: {
      type: "home",
      blocks: [
        { type: "header", text: { type: "plain_text", text: "Trelo" } },
        { type: "section", text: { type: "mrkdwn", text: "Ask Trelo about indexed Slack channels, review suggested tasks, and open channel digests in the Trelo dashboard." } },
        { type: "section", text: { type: "mrkdwn", text: "If Slack shows messages are turned off, enable the App Home Messages tab in your Slack app settings, then reinstall the app." } },
      ],
    },
  });
}

async function answerSlackQuestion({ workspaceId, botToken, event, channelName }: {
  workspaceId: string;
  botToken: string;
  event: any;
  channelName: string | null;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { aiText } = await import("@/lib/ai.server");
  const { data: recent } = await supabaseAdmin
    .from("slack_messages")
    .select("slack_user_name, text")
    .eq("workspace_id", workspaceId)
    .eq("slack_channel_id", event.channel)
    .order("created_at", { ascending: false })
    .limit(30);

  const transcript = (recent ?? [])
    .slice()
    .reverse()
    .map((m: any, i: number) => `[${i + 1}] ${m.slack_user_name ?? "user"}: ${m.text}`)
    .join("\n");

  const answer = transcript
    ? await aiText(
      "You are Trelo inside Slack. Answer from the provided channel messages only. Keep it concise and cite [n]. If the answer is not in the messages, say so.",
      `Channel: #${channelName ?? event.channel}\nQuestion: ${event.text}\n\nMessages:\n${transcript}`,
    )
    : "I do not have indexed messages for this channel yet. Open Trelo and sync Slack first.";

  await postSlackMessage(botToken, event.channel, answer.slice(0, 2800), event.thread_ts ?? event.ts);
}

async function extractCommitments({ workspaceId, event, userName, channelName, permalink }: {
  workspaceId: string;
  event: any;
  userName: string | null;
  channelName: string | null;
  permalink: string | null;
}) {
  const { aiJSON } = await import("@/lib/ai.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const extracted = await aiJSON<{ commitments: Array<{ title: string; owner?: string; due?: string | null }> }>(
    "You are an assistant that extracts ACTION ITEMS or COMMITMENTS from a single Slack message. Return JSON: { \"commitments\": [{ \"title\": string, \"owner\": string|null, \"due\": string|null }] }. Only extract explicit commitments like 'I will do X by Friday' or 'Can you review this by tomorrow'. If none, return an empty array. Do not invent tasks.",
    `Message from ${userName ?? "user"} in #${channelName ?? "channel"}:\n${event.text}`,
  );

  const list = Array.isArray(extracted?.commitments) ? extracted.commitments : [];
  for (const c of list.slice(0, 3)) {
    if (!c?.title) continue;
    await supabaseAdmin.from("commitments").insert({
      workspace_id: workspaceId,
      title: c.title,
      owner_name: c.owner ?? userName ?? null,
      owner_slack_id: event.user ?? null,
      due_date: c.due && /^\d{4}-\d{2}-\d{2}/.test(c.due) ? c.due.slice(0, 10) : null,
      status: "suggested",
      priority: "normal",
      source_permalink: permalink,
      channel_name: channelName,
    });
  }
}
