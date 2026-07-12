import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, getWorkspace, notAuthed, noWorkspace } from "../supabase";

export default defineTool({
  name: "list_channels",
  title: "List channels",
  description: "List Slack channels indexed in the signed-in user's Trelo workspace.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const w = await getWorkspace(sb, ctx.getUserId()!);
    if (!w) return noWorkspace();
    const { data, error } = await sb.from("slack_channels")
      .select("name, slack_channel_id")
      .eq("workspace_id", w.workspaceId)
      .order("name");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: (data ?? []).map((c: any) => `#${c.name}`).join("\n") || "No channels indexed yet." }],
      structuredContent: { channels: data ?? [] },
    };
  },
});
