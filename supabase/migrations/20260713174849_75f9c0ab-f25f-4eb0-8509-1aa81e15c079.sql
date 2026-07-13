CREATE OR REPLACE VIEW public.slack_installations_public AS
SELECT id, workspace_id, slack_team_id, slack_team_name, bot_user_id, installed_at
FROM public.slack_installations
WHERE public.is_workspace_member(workspace_id, auth.uid());

GRANT SELECT ON public.slack_installations_public TO authenticated;