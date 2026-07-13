type SlackChannel = {
  id: string;
  name?: string;
  is_private?: boolean;
  is_member?: boolean;
};

type SlackMessage = {
  user?: string;
  bot_id?: string;
  text?: string;
  ts?: string;
  subtype?: string;
};

type SlackApiResponse<T> = T & {
  ok: boolean;
  error?: string;
  needed?: string;
  response_metadata?: { next_cursor?: string };
};

type SyncOptions = {
  workspaceId: string;
  botToken: string;
  maxChannels?: number;
  messagesPerChannel?: number;
  joinPublicChannels?: boolean;
};

function slackTimestampToIso(ts?: string): string | undefined {
  if (!ts) return undefined;
  const millis = Math.floor(Number.parseFloat(ts) * 1000);
  if (!Number.isFinite(millis)) return undefined;
  return new Date(millis).toISOString();
}

function displayName(user: any): string | null {
  return user?.profile?.display_name || user?.real_name || user?.name || null;
}

async function slackApi<T extends Record<string, any>>(
  botToken: string,
  method: string,
  params: Record<string, string> = {},
): Promise<SlackApiResponse<T>> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: new URLSearchParams(params),
  });

  const body = await res.text();
  let data: SlackApiResponse<T>;
  try {
    data = JSON.parse(body) as SlackApiResponse<T>;
  } catch {
    throw new Error(`${method} returned non-JSON response (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(`${method} failed (${res.status}): ${data.error ?? body.slice(0, 160)}`);
  }

  return data;
}

async function listChannels(botToken: string, maxChannels: number) {
  const channels: SlackChannel[] = [];
  let cursor = "";

  do {
    const data = await slackApi<{ channels?: SlackChannel[] }>(botToken, "conversations.list", {
      limit: "200",
      types: "public_channel,private_channel",
      exclude_archived: "true",
      ...(cursor ? { cursor } : {}),
    });

    if (!data.ok) {
      throw new Error(`Slack channel list failed: ${data.error ?? "unknown"}${data.needed ? ` (${data.needed})` : ""}`);
    }

    channels.push(...(data.channels ?? []));
    cursor = data.response_metadata?.next_cursor ?? "";
  } while (cursor && channels.length < maxChannels);

  return channels.slice(0, maxChannels);
}

async function resolveUsers(botToken: string, workspaceId: string, userIds: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: installation } = await supabaseAdmin
    .from("slack_installations")
    .select("user_cache")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const cache = ((installation?.user_cache as Record<string, string> | null) ?? {}) as Record<string, string>;
  const nextCache = { ...cache };
  const unique = Array.from(new Set(userIds)).filter((id) => id && !nextCache[id]).slice(0, 80);

  for (const user of unique) {
    try {
      const data = await slackApi<{ user?: any }>(botToken, "users.info", { user });
      if (data.ok) nextCache[user] = displayName(data.user) ?? user;
    } catch (err) {
      console.warn("users.info failed during Slack sync", err);
    }
  }

  if (unique.length > 0) {
    await supabaseAdmin.from("slack_installations").update({ user_cache: nextCache }).eq("workspace_id", workspaceId);
  }

  return nextCache;
}

export async function syncWorkspaceSlack(options: SyncOptions) {
  const {
    workspaceId,
    botToken,
    maxChannels = 50,
    messagesPerChannel = 40,
    joinPublicChannels = true,
  } = options;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const errors: string[] = [];

  const channels = await listChannels(botToken, maxChannels);
  if (channels.length === 0) {
    return { channelsFound: 0, channelsSynced: 0, messagesSynced: 0, errors };
  }

  const channelRows = channels.map((channel) => ({
    workspace_id: workspaceId,
    slack_channel_id: channel.id,
    name: channel.name ?? channel.id,
    is_private: Boolean(channel.is_private),
  }));

  const { error: channelError } = await supabaseAdmin
    .from("slack_channels")
    .upsert(channelRows, { onConflict: "workspace_id,slack_channel_id" });
  if (channelError) throw new Error(`Could not save Slack channels: ${channelError.message}`);

  const messages: Array<{
    workspace_id: string;
    slack_channel_id: string;
    slack_user_id: string | null;
    slack_user_name: string | null;
    text: string;
    ts: string;
    permalink: string | null;
    created_at?: string;
  }> = [];
  const userIds: string[] = [];

  for (const channel of channels) {
    let canRead = Boolean(channel.is_member || channel.is_private === false);

    if (joinPublicChannels && !channel.is_private && !channel.is_member) {
      const joined = await slackApi<{ channel?: SlackChannel }>(botToken, "conversations.join", { channel: channel.id });
      if (joined.ok || joined.error === "already_in_channel") {
        canRead = true;
      } else {
        errors.push(`#${channel.name ?? channel.id}: ${joined.error ?? "join failed"}`);
        canRead = false;
      }
    }

    if (!canRead) continue;

    const history = await slackApi<{ messages?: SlackMessage[] }>(botToken, "conversations.history", {
      channel: channel.id,
      limit: String(messagesPerChannel),
    });

    if (!history.ok) {
      errors.push(`#${channel.name ?? channel.id}: ${history.error ?? "history failed"}`);
      continue;
    }

    for (const message of history.messages ?? []) {
      if (!message.ts || !message.text || message.subtype === "message_deleted") continue;
      const userId = message.user ?? message.bot_id ?? null;
      if (message.user) userIds.push(message.user);

      messages.push({
        workspace_id: workspaceId,
        slack_channel_id: channel.id,
        slack_user_id: userId,
        slack_user_name: userId,
        text: message.text,
        ts: message.ts,
        permalink: null,
        created_at: slackTimestampToIso(message.ts),
      });
    }
  }

  if (messages.length === 0) {
    return { channelsFound: channels.length, channelsSynced: channelRows.length, messagesSynced: 0, errors };
  }

  const users = await resolveUsers(botToken, workspaceId, userIds);
  const rows = messages.map((message) => ({
    ...message,
    slack_user_name: message.slack_user_id ? (users[message.slack_user_id] ?? message.slack_user_id) : null,
  }));

  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabaseAdmin
      .from("slack_messages")
      .upsert(chunk, { onConflict: "workspace_id,slack_channel_id,ts" });
    if (error) throw new Error(`Could not save Slack messages: ${error.message}`);
  }

  return {
    channelsFound: channels.length,
    channelsSynced: channelRows.length,
    messagesSynced: rows.length,
    errors: errors.slice(0, 8),
  };
}