import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, getWorkspace, notAuthed, noWorkspace } from "../supabase";

export default defineTool({
  name: "list_commitments",
  title: "List commitments",
  description: "List commitments (auto-extracted tasks) for the signed-in user's Trelo workspace.",
  inputSchema: {
    status: z.enum(["open", "done", "all"]).default("open").describe("Filter by status."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const w = await getWorkspace(sb, ctx.getUserId()!);
    if (!w) return noWorkspace();
    let q = sb.from("commitments").select("*").eq("workspace_id", w.workspaceId)
      .order("created_at", { ascending: false }).limit(limit);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { commitments: data ?? [] },
    };
  },
});
