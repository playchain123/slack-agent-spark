import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, getWorkspace, notAuthed, noWorkspace } from "../supabase";

export default defineTool({
  name: "ask_trelo",
  title: "Ask Trelo",
  description:
    "Answer a question using the signed-in user's Slack workspace history indexed in Trelo. Returns an AI answer with citations.",
  inputSchema: {
    question: z.string().min(2).max(2000).describe("The question to answer from Slack context."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ question }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const w = await getWorkspace(sb, ctx.getUserId()!);
    if (!w) return noWorkspace();

    const terms = question
      .split(/\s+/)
      .filter((t) => t.length > 3)
      .slice(0, 5);
    let hits: any[] = [];
    if (terms.length) {
      const orExpr = terms.map((t) => `text.ilike.%${t.replace(/[%,]/g, "")}%`).join(",");
      const { data } = await sb
        .from("slack_messages")
        .select("slack_channel_id, slack_user_name, text, permalink, created_at")
        .eq("workspace_id", w.workspaceId)
        .or(orExpr)
        .order("created_at", { ascending: false })
        .limit(20);
      hits = data ?? [];
    }
    if (hits.length === 0) {
      const { data } = await sb
        .from("slack_messages")
        .select("slack_channel_id, slack_user_name, text, permalink, created_at")
        .eq("workspace_id", w.workspaceId)
        .order("created_at", { ascending: false })
        .limit(30);
      hits = data ?? [];
    }

    if (hits.length === 0) {
      return {
        content: [{ type: "text", text: "No Slack messages indexed yet for this workspace." }],
        structuredContent: { answer: null, sources: [] },
      };
    }

    const contextBlock = hits
      .map((m: any, i: number) => `[${i + 1}] ${m.slack_user_name ?? "user"}: ${m.text}`)
      .join("\n");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        content: [{ type: "text", text: "AI unavailable (missing LOVABLE_API_KEY)" }],
        isError: true,
      };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are Trelo. Answer strictly from the provided Slack messages. Cite with [n]. If the messages don't contain the answer, say so.",
          },
          { role: "user", content: `Question: ${question}\n\nSlack messages:\n${contextBlock}` },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        content: [{ type: "text", text: `AI error ${res.status}: ${body.slice(0, 200)}` }],
        isError: true,
      };
    }
    const data = (await res.json()) as any;
    const answer = data.choices?.[0]?.message?.content ?? "";
    const sources = hits.map((m: any, i: number) => ({
      index: i + 1,
      user: m.slack_user_name,
      text: (m.text as string)?.slice(0, 200),
      permalink: m.permalink,
    }));

    return {
      content: [{ type: "text", text: answer }],
      structuredContent: { answer, sources },
    };
  },
});
