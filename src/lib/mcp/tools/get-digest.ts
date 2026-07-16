import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, getWorkspace, notAuthed, noWorkspace } from "../supabase";

export default defineTool({
  name: "get_digest",
  title: "Get activity digest",
  description:
    "Return the most recent Trelo activity digest events (AI summaries of Slack channels).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const w = await getWorkspace(sb, ctx.getUserId()!);
    if (!w) return noWorkspace();
    const { data, error } = await sb
      .from("digest_events")
      .select("channel_name, summary, occurred_at")
      .eq("workspace_id", w.workspaceId)
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const text =
      (data ?? [])
        .map((d: any) => `#${d.channel_name} (${d.occurred_at})\n${d.summary}`)
        .join("\n\n") || "No digest events yet.";
    return { content: [{ type: "text", text }], structuredContent: { digests: data ?? [] } };
  },
});
