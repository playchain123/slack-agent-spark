import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- helper: get caller's workspace ----------
async function getCallerWorkspace(
  supabase: any,
  userId: string,
): Promise<{ workspaceId: string; role: string } | null> {
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { workspaceId: data.workspace_id, role: data.role };
}

// ---------- DASHBOARD METRICS ----------
export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return null;

    const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [m24, m7, openCommit, doneCommit, channels, latestDigest] = await Promise.all([
      supabase.from("slack_messages").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).gte("created_at", since24),
      supabase.from("slack_messages").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).gte("created_at", since7),
      supabase.from("commitments").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).eq("status", "open"),
      supabase.from("commitments").select("id", { count: "exact", head: true })
        .eq("workspace_id", w.workspaceId).eq("status", "done"),
      supabase.from("slack_channels").select("id, name, slack_channel_id")
        .eq("workspace_id", w.workspaceId).limit(6),
      supabase.from("digest_events").select("id, summary, channel_name, occurred_at")
        .eq("workspace_id", w.workspaceId).order("occurred_at", { ascending: false }).limit(3),
    ]);

    return {
      messages24h: m24.count ?? 0,
      messages7d: m7.count ?? 0,
      openCommitments: openCommit.count ?? 0,
      doneCommitments: doneCommit.count ?? 0,
      channels: channels.data ?? [],
      latestDigest: latestDigest.data ?? [],
    };
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
    const status = data.done ? "done" : "open";
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
      priority: z.enum(["low", "medium", "high"]).optional(),
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
      priority: data.priority ?? "medium",
      status: "open",
    }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
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
        event_type: "daily_summary",
        summary,
        occurred_at: new Date().toISOString(),
      });
      count++;
    }

    return { generated: count, message: `Summarized ${count} channel(s).` };
  });

// ---------- ASK TRELO ----------
export const listRecentAnswers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) return [];
    const { data } = await supabase
      .from("answers")
      .select("id, question, answer_md, sources, created_at")
      .eq("workspace_id", w.workspaceId)
      .order("created_at", { ascending: false })
      .limit(30);
    return data ?? [];
  });

export const askTrelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ question: z.string().min(2).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const w = await getCallerWorkspace(supabase, userId);
    if (!w) throw new Error("No workspace");

    // Retrieve context: trigram-similar messages (fallback to recent if no match)
    const q = data.question;
    let messages: any[] = [];
    const { data: simRows } = await supabase.rpc("similarity", { text: q, text: q }).limit(1); // may not exist; fallback
    void simRows;

    // Use ilike as a simple retrieval fallback
    const terms = q.split(/\s+/).filter((t) => t.length > 3).slice(0, 5);
    let query = supabase
      .from("slack_messages")
      .select("slack_channel_id, slack_user_name, text, ts, permalink, created_at")
      .eq("workspace_id", w.workspaceId)
      .order("created_at", { ascending: false })
      .limit(40);

    if (terms.length > 0) {
      const orExpr = terms.map((t) => `text.ilike.%${t.replace(/[%,]/g, "")}%`).join(",");
      const { data: hits } = await supabase
        .from("slack_messages")
        .select("slack_channel_id, slack_user_name, text, ts, permalink, created_at")
        .eq("workspace_id", w.workspaceId)
        .or(orExpr)
        .order("created_at", { ascending: false })
        .limit(20);
      messages = hits ?? [];
    }
    if (messages.length === 0) {
      const { data: recent } = await query;
      messages = recent ?? [];
    }

    if (messages.length === 0) {
      const emptyAnswer =
        "I don't have any Slack messages indexed yet for your workspace. Once your team posts in Slack, I'll be able to answer questions about it.";
      return { answer: emptyAnswer, sources: [] };
    }

    const { data: channels } = await supabase
      .from("slack_channels")
      .select("slack_channel_id, name")
      .eq("workspace_id", w.workspaceId);
    const chanMap = new Map((channels ?? []).map((c: any) => [c.slack_channel_id, c.name]));

    const contextBlock = messages
      .slice(0, 25)
      .map(
        (m: any, i: number) =>
          `[${i + 1}] #${chanMap.get(m.slack_channel_id) ?? "channel"} — ${m.slack_user_name ?? "user"}: ${m.text}`,
      )
      .join("\n");

    const { aiText } = await import("./ai.server");
    const answer = await aiText(
      "You are Trelo, an AI assistant that answers questions about a team's Slack conversations. Use only the provided messages. Cite sources with [n] where n is the message number. If the messages don't contain an answer, say so honestly.",
      `Question: ${data.question}\n\nSlack messages:\n${contextBlock}`,
    );

    const sources = messages.slice(0, 25).map((m: any, i: number) => ({
      index: i + 1,
      channel: chanMap.get(m.slack_channel_id) ?? null,
      user: m.slack_user_name,
      text: m.text?.slice(0, 200),
      permalink: m.permalink,
    }));

    // Persist
    await supabase.from("answers").insert({
      workspace_id: w.workspaceId,
      asked_by: userId,
      question: data.question,
      answer_md: answer,
      sources,
    });

    return { answer, sources };
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
