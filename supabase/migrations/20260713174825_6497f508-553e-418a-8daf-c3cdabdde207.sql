DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'slack_installations'
      AND policyname = 'slack_installations_select_member'
  ) THEN
    CREATE POLICY "slack_installations_select_member"
    ON public.slack_installations
    FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()));
  END IF;
END $$;