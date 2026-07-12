import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, notAuthed } from "../supabase";

export default defineTool({
  name: "toggle_commitment",
  title: "Toggle commitment",
  description: "Mark a commitment as done or reopen it.",
  inputSchema: {
    id: z.string().uuid().describe("Commitment UUID."),
    done: z.boolean().describe("true to mark done, false to reopen."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true },
  handler: async ({ id, done }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const { error } = await sb.from("commitments").update({
      status: done ? "done" : "open",
      completed_at: done ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Commitment ${id} → ${done ? "done" : "open"}` }] };
  },
});
