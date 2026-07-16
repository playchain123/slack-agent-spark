import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Prefer the Slack-connected workspace when a user belongs to more than one workspace.
    const { data: memberships, error: memErr } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, owner_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (memErr) throw memErr;
    if (!memberships || memberships.length === 0) {
      return { workspace: null, installation: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const workspaceIds = memberships.map((membership: any) => membership.workspace_id);
    const { data: installations } = await supabaseAdmin
      .from("slack_installations")
      .select("id, workspace_id, slack_team_id, slack_team_name, bot_user_id, installed_at")
      .in("workspace_id", workspaceIds);

    const installByWorkspace = new Map(
      (installations ?? []).map((install: any) => [install.workspace_id, install]),
    );
    const membership =
      memberships.find((row: any) => installByWorkspace.has(row.workspace_id)) ??
      memberships.find((row: any) => row.role === "owner") ??
      memberships[0];

    if (!membership.workspaces) {
      return { workspace: null, installation: null };
    }

    const workspace = membership.workspaces as unknown as {
      id: string;
      name: string;
      owner_id: string;
    };

    const installation = installByWorkspace.get(workspace.id) ?? null;

    let slackStats: { channels: number; messages: number } | null = null;
    if (installation) {
      const [channelsCount, messagesCount] = await Promise.all([
        supabaseAdmin
          .from("slack_channels")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id),
        supabaseAdmin
          .from("slack_messages")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id),
      ]);
      slackStats = {
        channels: channelsCount.count ?? 0,
        messages: messagesCount.count ?? 0,
      };
    }

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
      slackStats,
      profile: profile ?? null,
    };
  });
