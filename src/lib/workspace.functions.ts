import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Get first workspace this user is a member of (v1 = one workspace per user)
    const { data: membership, error: memErr } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, owner_id)")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (memErr) throw memErr;
    if (!membership || !membership.workspaces) {
      return { workspace: null, installation: null };
    }

    const workspace = membership.workspaces as unknown as {
      id: string;
      name: string;
      owner_id: string;
    };

    // Get Slack installation (via safe view — bot_token not exposed)
    const { data: installation } = await supabase
      .from("slack_installations_public")
      .select("id, slack_team_id, slack_team_name, bot_user_id, installed_at")
      .eq("workspace_id", workspace.id)
      .maybeSingle();

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        role: membership.role,
        isOwner: workspace.owner_id === userId,
      },
      installation: installation ?? null,
      profile: profile ?? null,
    };
  });
