export async function getCallerWorkspace(
  _supabase: any,
  userId: string,
): Promise<{ workspaceId: string; role: string } | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: memberships } = await supabaseAdmin
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) return null;

  const workspaceIds = memberships.map((membership: any) => membership.workspace_id);
  const { data: installations } = await supabaseAdmin
    .from("slack_installations")
    .select("workspace_id")
    .in("workspace_id", workspaceIds);

  const installedWorkspaceIds = new Set((installations ?? []).map((row: any) => row.workspace_id));
  const selected =
    memberships.find((membership: any) => installedWorkspaceIds.has(membership.workspace_id)) ??
    memberships.find((membership: any) => membership.role === "owner") ??
    memberships[0];

  return { workspaceId: selected.workspace_id, role: selected.role };
}
