DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'slack_installations'
      AND policyname = 'slack_installations_no_client_access'
  ) THEN
    CREATE POLICY "slack_installations_no_client_access"
    ON public.slack_installations
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'slack_event_queue'
      AND policyname = 'slack_event_queue_no_client_access'
  ) THEN
    CREATE POLICY "slack_event_queue_no_client_access"
    ON public.slack_event_queue
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;