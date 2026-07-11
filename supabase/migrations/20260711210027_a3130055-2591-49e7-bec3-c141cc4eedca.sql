
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- WORKSPACES + MEMBERSHIP
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = _workspace_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspaces WHERE id = _workspace_id AND owner_id = _user_id)
$$;

CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT TO authenticated USING (public.is_workspace_member(id, auth.uid()));
CREATE POLICY "workspaces_update_owner" ON public.workspaces FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete_owner" ON public.workspaces FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "wm_select_own" ON public.workspace_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_workspace_member(workspace_id, auth.uid()));

-- SLACK INSTALLATIONS (bot_token private; auth users read via view)
CREATE TABLE public.slack_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slack_team_id TEXT NOT NULL UNIQUE,
  slack_team_name TEXT,
  bot_user_id TEXT,
  bot_token TEXT NOT NULL,
  authed_user_id TEXT,
  scope TEXT,
  user_cache JSONB NOT NULL DEFAULT '{}'::jsonb,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.slack_installations TO service_role;
ALTER TABLE public.slack_installations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE VIEW public.slack_installations_public
WITH (security_invoker = true) AS
SELECT id, workspace_id, slack_team_id, slack_team_name, bot_user_id, installed_at
FROM public.slack_installations
WHERE public.is_workspace_member(workspace_id, auth.uid());
GRANT SELECT ON public.slack_installations_public TO authenticated;

-- SLACK CHANNELS
CREATE TABLE public.slack_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slack_channel_id TEXT NOT NULL,
  name TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, slack_channel_id)
);
GRANT SELECT ON public.slack_channels TO authenticated;
GRANT ALL ON public.slack_channels TO service_role;
ALTER TABLE public.slack_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channels_select_member" ON public.slack_channels FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

-- SLACK THREADS
CREATE TABLE public.slack_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.slack_channels(id) ON DELETE SET NULL,
  slack_channel_id TEXT NOT NULL,
  channel_name TEXT,
  thread_ts TEXT NOT NULL,
  permalink TEXT,
  message_count INT NOT NULL DEFAULT 0,
  last_indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, slack_channel_id, thread_ts)
);
GRANT SELECT ON public.slack_threads TO authenticated;
GRANT ALL ON public.slack_threads TO service_role;
ALTER TABLE public.slack_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads_select_member" ON public.slack_threads FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

-- SLACK MESSAGES
CREATE TABLE public.slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.slack_threads(id) ON DELETE CASCADE,
  slack_channel_id TEXT NOT NULL,
  slack_user_id TEXT,
  slack_user_name TEXT,
  text TEXT NOT NULL,
  ts TEXT NOT NULL,
  permalink TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, slack_channel_id, ts)
);
CREATE INDEX slack_messages_ws_ts_idx ON public.slack_messages (workspace_id, ts DESC);
CREATE INDEX slack_messages_text_trgm_idx ON public.slack_messages USING gin (text gin_trgm_ops);
GRANT SELECT ON public.slack_messages TO authenticated;
GRANT ALL ON public.slack_messages TO service_role;
ALTER TABLE public.slack_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_member" ON public.slack_messages FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

-- ANSWERS
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  asked_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer_md TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX answers_ws_created_idx ON public.answers (workspace_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_select_member" ON public.answers FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "answers_insert_member" ON public.answers FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()) AND asked_by = auth.uid());
CREATE POLICY "answers_delete_own" ON public.answers FOR DELETE TO authenticated USING (asked_by = auth.uid());

-- COMMITMENTS
CREATE TABLE public.commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner_slack_id TEXT,
  owner_name TEXT,
  owner_avatar TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','snoozed','cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  source_thread_id UUID REFERENCES public.slack_threads(id) ON DELETE SET NULL,
  source_permalink TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX commitments_ws_status_due_idx ON public.commitments (workspace_id, status, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commitments TO authenticated;
GRANT ALL ON public.commitments TO service_role;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commitments_select_member" ON public.commitments FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "commitments_insert_member" ON public.commitments FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "commitments_update_member" ON public.commitments FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "commitments_delete_member" ON public.commitments FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

-- DIGEST EVENTS
CREATE TABLE public.digest_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slack_channel_id TEXT,
  channel_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('decision','question','commitment','update','summary')),
  summary TEXT NOT NULL,
  thread_permalink TEXT,
  actor_name TEXT,
  actor_avatar TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX digest_ws_occurred_idx ON public.digest_events (workspace_id, occurred_at DESC);
CREATE INDEX digest_summary_trgm_idx ON public.digest_events USING gin (summary gin_trgm_ops);
GRANT SELECT ON public.digest_events TO authenticated;
GRANT ALL ON public.digest_events TO service_role;
ALTER TABLE public.digest_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "digest_select_member" ON public.digest_events FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

-- SLACK EVENT QUEUE (service_role only)
CREATE TABLE public.slack_event_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_team_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX seq_unprocessed_idx ON public.slack_event_queue (created_at) WHERE processed_at IS NULL;
GRANT ALL ON public.slack_event_queue TO service_role;
ALTER TABLE public.slack_event_queue ENABLE ROW LEVEL SECURITY;

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_workspace_id UUID;
  display_name TEXT;
BEGIN
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'You');
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, display_name, NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.workspaces (name, owner_id) VALUES (display_name || '''s workspace', NEW.id) RETURNING id INTO new_workspace_id;
  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (new_workspace_id, NEW.id, 'owner');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER commitments_updated_at BEFORE UPDATE ON public.commitments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
