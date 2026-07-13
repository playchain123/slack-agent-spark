export async function getCallerWorkspace(
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