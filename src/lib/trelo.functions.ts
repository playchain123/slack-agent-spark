import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getCallerWorkspace } from "./workspace.server";
import { slackRealtimeSearch } from "./slack-search.server";

// ---------- DASHBOARD METRICS ----------
export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return null;

    const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [m24, m7, openCommit, suggestedCommit, doneCommit, channels, latestDigest, install] = await Promise.all([
      supabase.from("slack_messages").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).gte("created_at", since24),
      supabase.from("slack_messages").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).gte("created_at", since7),
      supabase.from("commitments").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).eq("status", "pending"),
      supabase.from("commitments").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).eq("status", "suggested"),
      supabase.from("commitments").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).eq("status", "done"),
      supabase.from("slack_channels").select("id, name, slack_channel_id")
        .eq("workspace_id", w.workspaceId).order("name", { ascending: true }).limit(12),
      supabase.from("digest_events").select("id, summary, channel_name, occurred_at")
        .eq("workspace_id", w.workspaceId).order("occurred_at", { ascending: false }).limit(3),
      supabase.from("slack_installations").select("slack_team_id")
        .eq("workspace_id", w.workspaceId).maybeSingle(),
    ]);

    const channelRows = channels.data ?? [];
    const channelCounts = await Promise.all(
      channelRows.map(async (channel: any) => {
        const [messages, latest] = await Promise.all([
          supabase.from("slack_messages").select("id", { count: "exact", head: true })
            .eq("workspace_id", w.workspaceId).eq("slack_channel_id", channel.slack_channel_id),
          supabase.from("slack_messages").select("text, slack_user_name, created_at, permalink")
            .eq("workspace_id", w.workspaceId).eq("slack_channel_id", channel.slack_channel_id)
            .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        return {
          ...channel,
          messageCount: messages.count ?? 0,
          latestMessage: latest.data ?? null,
        };
      }),
    );

    return {
      messages24h: m24.count ?? 0,
      messages7d: m7.count ?? 0,
      openCommitments: openCommit.count ?? 0,
      suggestedCommitments: suggestedCommit.count ?? 0,
      doneCommitments: doneCommit.count ?? 0,
      channels: channelCounts,
      latestDigest: latestDigest.data ?? [],
      slackTeamId: (install.data as { slack_team_id?: string } | null)?.slack_team_id ?? null,
    };
  });

export const listSlackChannels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];

    const { data: channels } = await supabase
      .from("slack_channels")
      .select("id, name, slack_channel_id, is_private, created_at")
      .eq("workspace_id", w.workspaceId)
      .order("name", { ascending: true });

    const rows = channels ?? [];
    const withCounts = await Promise.all(
      rows.map(async (channel: any) => {
        const [count, latest] = await Promise.all([
          supabase.from("slack_messages").select("id", { count: "exact", head: true })
            .eq("workspace_id", w.workspaceId).eq("slack_channel_id", channel.slack_channel_id),
          supabase.from("slack_messages").select("text, slack_user_name, created_at, permalink")
            .eq("workspace_id", w.workspaceId).eq("slack_channel_id", channel.slack_channel_id)
            .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        return {
          ...channel,
          messageCount: count.count ?? 0,
          latestMessage: latest.data ?? null,
        };
      }),
    );

    return withCounts.sort((a: any, b: any) => (b.messageCount ?? 0) - (a.messageCount ?? 0));
  });

export const listChannelMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ channelId: z.string().min(1), limit: z.number().int().min(1).max(100).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];

    const { data: messages } = await supabase
      .from("slack_messages")
      .select("id, slack_channel_id, slack_user_name, text, ts, permalink, created_at")
      .eq("workspace_id", w.workspaceId)
      .eq("slack_channel_id", data.channelId)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 40);

    return messages ?? [];
  });


// ---------- COMMITMENTS ----------
export const listCommitments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];
    const { data } = await supabase
      .from("commitments")
      .select("*")
      .eq("workspace_id", w.workspaceId)
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const toggleCommitment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), done: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const status = data.done ? "done" : "pending";
    const completed_at = data.done ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("commitments")
      .update({ status, completed_at })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCommitment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("commitments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createCommitment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(1),
      due_date: z.string().nullable().optional(),
      priority: z.enum(["low", "normal", "high"]).optional(),
      channel_name: z.string().nullable().optional(),
      source_permalink: z.string().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) throw new Error("No workspace");
    const { data: row, error } = await supabase.from("commitments").insert({
      workspace_id: w.workspaceId,
      title: data.title,
      due_date: data.due_date ?? null,
      priority: data.priority ?? "normal",
      status: "pending",
      channel_name: data.channel_name ?? null,
      source_permalink: data.source_permalink ?? null,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const acceptCommitmentSuggestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("commitments")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("status", "suggested");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateCommitmentSuggestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ channelId: z.string().min(1).optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) throw new Error("No workspace");

    const channelQuery = supabase
      .from("slack_channels")
      .select("slack_channel_id, name")
      .eq("workspace_id", w.workspaceId)
      .order("name", { ascending: true });
    const { data: channelRows } = data.channelId
      ? await channelQuery.eq("slack_channel_id", data.channelId).limit(1)
      : await channelQuery.limit(6);

    const channels = channelRows ?? [];
    if (channels.length === 0) return { generated: 0, message: "No channels are indexed yet." };

    const { aiJSON } = await import("./ai.server");
    let created = 0;

    for (const channel of channels as Array<{ slack_channel_id: string; name: string | null }>) {
      const { data: messages } = await supabase
        .from("slack_messages")
        .select("slack_user_name, text, permalink, created_at")
        .eq("workspace_id", w.workspaceId)
        .eq("slack_channel_id", channel.slack_channel_id)
        .order("created_at", { ascending: false })
        .limit(80);

      if (!messages || messages.length === 0) continue;

      const transcript = messages
        .slice()
        .reverse()
        .map((m: any, index: number) => `[${index + 1}] ${m.slack_user_name ?? "user"}: ${m.text}`)
        .join("\n");

      const extracted = await aiJSON<{ tasks?: Array<{ title: string; owner?: string | null; due?: string | null; source?: number | null }> }>(
        "You suggest actionable tasks from Slack channel messages. Return JSON only: {\"tasks\":[{\"title\":string,\"owner\":string|null,\"due\":string|null,\"source\":number|null}]}. Suggest only useful tasks grounded in the messages. Do not invent owners or dates. Limit to 5 tasks.",
        `Channel: #${channel.name ?? channel.slack_channel_id}\n\nMessages:\n${transcript}`,
      );

      const tasks = Array.isArray(extracted?.tasks) ? extracted.tasks.slice(0, 5) : [];
      if (tasks.length === 0) continue;

      const titles = tasks.map((task) => task.title?.trim()).filter(Boolean);
      if (titles.length === 0) continue;
      const { data: existing } = await supabase
        .from("commitments")
        .select("title")
        .eq("workspace_id", w.workspaceId)
        .in("title", titles);
      const existingTitles = new Set((existing ?? []).map((row: any) => String(row.title).toLowerCase()));

      const rows = tasks
        .filter((task) => task.title?.trim() && !existingTitles.has(task.title.trim().toLowerCase()))
        .map((task) => {
          const sourceIndex = typeof task.source === "number" ? task.source - 1 : 0;
          const source = messages.slice().reverse()[sourceIndex] ?? messages[0];
          return {
            workspace_id: w.workspaceId,
            title: task.title.trim(),
            owner_name: task.owner ?? null,
            due_date: task.due && /^\d{4}-\d{2}-\d{2}/.test(task.due) ? task.due.slice(0, 10) : null,
            priority: "normal",
            status: "suggested",
            channel_name: channel.name ?? null,
            source_permalink: source?.permalink ?? null,
          };
        });

      if (rows.length > 0) {
        const { error } = await supabase.from("commitments").insert(rows);
        if (error) throw new Error(error.message);
        created += rows.length;
      }
    }

    return {
      generated: created,
      message: created > 0 ? `Suggested ${created} task${created === 1 ? "" : "s"}. Review and add the ones you want.` : "No new task suggestions found.",
    };
  });

// ---------- DIGEST ----------
export const listDigestEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];
    const { data } = await supabase
      .from("digest_events")
      .select("*")
      .eq("workspace_id", w.workspaceId)
      .order("occurred_at", { ascending: false })
      .limit(50);
    return data ?? [];
  });

export const generateDigest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) throw new Error("No workspace");

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: messages } = await supabase
      .from("slack_messages")
      .select("slack_channel_id, slack_user_name, text, ts, permalink")
      .eq("workspace_id", w.workspaceId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(300);

    if (!messages || messages.length === 0) {
      return { generated: 0, message: "No Slack activity in the last 24 hours." };
    }

    const { data: channels } = await supabase
      .from("slack_channels")
      .select("slack_channel_id, name")
      .eq("workspace_id", w.workspaceId);
    const chanMap = new Map((channels ?? []).map((c: any) => [c.slack_channel_id, c.name]));

    // Group by channel
    const byChannel = new Map<string, any[]>();
    for (const m of messages) {
      const arr = byChannel.get(m.slack_channel_id) ?? [];
      arr.push(m);
      byChannel.set(m.slack_channel_id, arr);
    }

    const { aiText } = await import("./ai.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let count = 0;

    for (const [chanId, msgs] of byChannel) {
      const channelName = chanMap.get(chanId) ?? "unknown";
      const transcript = msgs
        .slice(0, 60)
        .reverse()
        .map((m: any) => `${m.slack_user_name ?? "user"}: ${m.text}`)
        .join("\n");

      const summary = await aiText(
        "You summarize Slack channel activity into 3-5 tight bullets. Be specific: decisions made, blockers surfaced, and open questions. No fluff.",
        `Channel: #${channelName}\n\nMessages:\n${transcript}`,
      );

      await supabaseAdmin.from("digest_events").insert({
        workspace_id: w.workspaceId,
        slack_channel_id: chanId,
        channel_name: channelName,
        event_type: "summary",
        summary,
        occurred_at: new Date().toISOString(),
      });
      count++;
    }

    return { generated: count, message: `Summarized ${count} channel(s).` };
  });

// ---------- ASK TRELO ----------
export const listRecentAnswers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ channelId: z.string().min(1).optional() }).parse(d ?? {}))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];
    const { data } = await supabase
      .from("answers")
      .select("id, question, answer_md, sources, created_at")
      .eq("workspace_id", w.workspaceId)
      .order("created_at", { ascending: false })
      .limit(30);
    const rows = data ?? [];
    const channelId = input.channelId;
    if (!channelId) return rows;
    return rows.filter((row: any) =>
      Array.isArray(row.sources) && row.sources.some((source: any) => source.channelId === channelId),
    );
  });

export const askTrelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ question: z.string().min(2).max(2000), channelId: z.string().min(1).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) throw new Error("No workspace");

    const q = data.question;
    const selectedChannelId = data.channelId;

    const { data: channels } = await supabase
      .from("slack_channels")
      .select("slack_channel_id, name")
      .eq("workspace_id", w.workspaceId);
    const chanMap = new Map((channels ?? []).map((c: any) => [c.slack_channel_id, c.name]));
    const selectedChannelName = selectedChannelId ? chanMap.get(selectedChannelId) ?? selectedChannelId : null;

    // 1. Slack Real-Time Search API — live Slack results (semantic on AI-enabled workspaces)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: install } = await supabaseAdmin
      .from("slack_installations")
      .select("bot_token")
      .eq("workspace_id", w.workspaceId)
      .maybeSingle();
    const botToken = (install?.bot_token as string | undefined) ?? null;
    const liveHits = botToken && !selectedChannelId ? await slackRealtimeSearch(botToken, q) : [];

    // 2. Indexed DB retrieval as augmentation / fallback
    let indexed: any[] = [];
    const terms = q.split(/\s+/).filter((t) => t.length > 3).slice(0, 5);
    if (terms.length > 0) {
      const orExpr = terms.map((t) => `text.ilike.%${t.replace(/[%,]/g, "")}%`).join(",");
      let dbQuery = supabase
        .from("slack_messages")
        .select("slack_channel_id, slack_user_name, text, ts, permalink, created_at")
        .eq("workspace_id", w.workspaceId)
        .or(orExpr);
      if (selectedChannelId) dbQuery = dbQuery.eq("slack_channel_id", selectedChannelId);
      const { data: hits } = await dbQuery.order("created_at", { ascending: false }).limit(20);
      indexed = hits ?? [];
    }
    if (indexed.length === 0 && liveHits.length === 0) {
      let recentQuery = supabase
        .from("slack_messages")
        .select("slack_channel_id, slack_user_name, text, ts, permalink, created_at")
        .eq("workspace_id", w.workspaceId);
      if (selectedChannelId) recentQuery = recentQuery.eq("slack_channel_id", selectedChannelId);
      const { data: recent } = await recentQuery.order("created_at", { ascending: false }).limit(30);
      indexed = recent ?? [];
    }

    const merged = [
      ...liveHits.map((h) => ({
        channel: h.channel_name ?? "channel",
        user: h.user_name ?? "user",
        text: h.text,
        permalink: h.permalink ?? null,
        source: "slack_realtime" as const,
      })),
      ...indexed.map((m: any) => ({
        channelId: m.slack_channel_id,
        channel: chanMap.get(m.slack_channel_id) ?? "channel",
        user: m.slack_user_name ?? "user",
        text: m.text,
        permalink: m.permalink,
        source: "indexed" as const,
      })),
    ].slice(0, 25);

    if (merged.length === 0) {
      return {
        answer:
          selectedChannelName
            ? `I don't have indexed messages for #${selectedChannelName} yet. Sync Slack, then ask again.`
            : "I don't have any Slack messages to search yet. Once your team posts in Slack (or reconnects with search scopes), I'll be able to answer.",
        sources: [],
      };
    }

    const contextBlock = merged
      .map((m, i) => `[${i + 1}] #${m.channel} — ${m.user}: ${m.text}`)
      .join("\n");

    const { aiText } = await import("./ai.server");
    const answer = await aiText(
      "You are Trelo, an AI assistant that answers questions strictly from the provided Slack messages. Cite sources inline with [n]. If the messages don't contain the answer, say so honestly — do not invent facts. Keep channel context separate; do not blend other channels unless they are explicitly included.",
      `${selectedChannelName ? `Selected channel: #${selectedChannelName}\n` : "Selected scope: all indexed channels\n"}Question: ${data.question}\n\nSlack messages:\n${contextBlock}`,
    );

    const sources = merged.map((m, i) => ({
      index: i + 1,
      channelId: (m as any).channelId ?? null,
      channel: m.channel,
      user: m.user,
      text: m.text?.slice(0, 200),
      permalink: m.permalink,
      source: m.source,
    }));

    await supabase.from("answers").insert({
      workspace_id: w.workspaceId,
      asked_by: userId,
      question: data.question,
      answer_md: answer,
      sources,
    });

    return { answer, sources, usedRealtimeSearch: liveHits.length > 0, channelId: selectedChannelId ?? null, channelName: selectedChannelName };
  });

// ---------- SEARCH ----------
export const searchMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ q: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];
    const term = data.q.replace(/[%,]/g, "");
    const { data: hits } = await supabase
      .from("slack_messages")
      .select("id, slack_channel_id, slack_user_name, text, permalink, created_at")
      .eq("workspace_id", w.workspaceId)
      .ilike("text", `%${term}%`)
      .order("created_at", { ascending: false })
      .limit(15);
    return hits ?? [];
  });
