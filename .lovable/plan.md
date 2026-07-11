
# Trelo — Real backend + Slack integration

Big picture: turn the current mock dashboard into a real multi-tenant Slack product. Users sign in, connect their Slack workspace once, and every panel (Ask Trelo, Commitments, Activity Digest) reads/writes real data.

---

## Part A — What you need on Slack (walkthrough)

You already have a Slack developer account. Here's exactly what to configure. I'll generate the manifest with the correct URLs after Cloud is enabled so you can paste it in.

### 1. Create the Slack app
- api.slack.com/apps → **Create New App → From an app manifest** → pick your dev workspace → paste the manifest I'll generate.

### 2. Manifest will include:
- **Bot scopes**: `app_mentions:read`, `chat:write`, `channels:history`, `channels:read`, `groups:history`, `groups:read`, `im:history`, `im:read`, `im:write`, `users:read`, `users:read.email`, `reactions:read`, `assistant:write`, `search:read.public`
- **User scopes** (for Sign in with Slack): `openid`, `email`, `profile`
- **Event subscriptions** → Request URL: `https://slack-agent-spark.lovable.app/api/public/slack/events`
  - Bot events: `app_mention`, `message.channels`, `message.groups`, `message.im`, `assistant_thread_started`
- **Interactivity** → Request URL: same `/api/public/slack/events`
- **OAuth redirect URL**: `https://slack-agent-spark.lovable.app/api/public/slack/oauth/callback`
- **App-level tokens**: not needed (we use HTTP events, not Socket Mode)
- **Distribution**: enable **Public Distribution** so any workspace can install (multi-tenant).

### 3. Secrets you paste into Lovable
Once the app is created, I'll open the secure secret form for:
- `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` (Basic Info → App Credentials)
- `SLACK_SIGNING_SECRET` (Basic Info → App Credentials — used to verify events)
- `SLACK_STATE_SECRET` (I'll auto-generate — signs the OAuth state param)

### 4. How teams connect
On the dashboard, "Connect Slack" → OAuth v2 install flow → callback stores their `bot_token` + `team_id` + `bot_user_id` in `slack_installations` table, scoped to the signed-in user's `workspace_id`. From that point on, events for their team flow into `/api/public/slack/events` and Trelo can call Slack APIs as their bot.

---

## Part B — What I'll build in Lovable

### B1. Enable Lovable Cloud
Provisions Postgres, Auth, and secret storage.

### B2. Auth
- Email + password (default).
- **Sign in with Slack** via `supabase--configure_social_auth` (uses your same Slack app's OpenID scopes).
- Managed `_authenticated/` route gate; move `dashboard` under `src/routes/_authenticated/dashboard.tsx`.
- Public `/auth` page with tabs (Sign in / Sign up / Continue with Slack).
- Root `onAuthStateChange` → router.invalidate.
- Logout button in the sidebar footer with proper hygiene (cancelQueries → clear → signOut → replace to `/auth`).

### B3. Database (migration with GRANTs + RLS)
- `workspaces` (id, name, owner_id) — one per user account initially, extendable to teams later
- `workspace_members` (workspace_id, user_id, role)
- `slack_installations` (workspace_id, slack_team_id, team_name, bot_token, bot_user_id, authed_user_id, installed_at)
- `slack_threads` (id, workspace_id, channel_id, channel_name, thread_ts, permalink, last_indexed_at, message_count)
- `slack_messages` (id, thread_id, slack_user_id, slack_user_name, text, ts, embedding vector(1536) *if pgvector, else skip for v1*)
- `answers` (id, workspace_id, asked_by, question, answer_md, sources jsonb, created_at) — Ask Trelo history
- `commitments` (id, workspace_id, title, owner_slack_id, owner_name, due_date, source_thread_id, status ['pending'|'done'|'snoozed'], channel_name, created_at, completed_at)
- `digest_events` (id, workspace_id, channel_id, channel_name, event_type ['decision'|'question'|'commitment'|'update'], summary, thread_permalink, occurred_at)
- All tables: RLS scoped to `workspace_members`; explicit GRANTs to `authenticated` + `service_role`; `bot_token` never selectable by anon.

### B4. Server routes & functions

**Public routes (no auth) — external callers:**
- `POST /api/public/slack/oauth/callback` — Slack OAuth v2 exchange; verifies signed state; upserts `slack_installations`.
- `GET /api/public/slack/install` — kicks off OAuth (redirects to slack.com/oauth/v2/authorize with signed state).
- `POST /api/public/slack/events` — verifies Slack signing secret + timestamp (5-min window, timing-safe compare), responds to `url_verification`, then dispatches:
  - `message.*` / `app_mention` → enqueue ingestion
  - `assistant_thread_started` → prime assistant thread
  - interactivity payloads → handle button clicks (mark commitment done, snooze)

**Authenticated server fns (`.middleware([requireSupabaseAuth])`):**
- `getWorkspace`, `getInstallation`, `disconnectSlack`
- `askTrelo({question})` — searches `slack_messages` (SQL ILIKE for v1; upgrade to `assistant.search.context` when the team's Slack has AI Search, else pgvector) → Lovable AI Gateway (`google/gemini-2.5-flash`) → returns `{answer_md, sources[]}` and persists to `answers`.
- `listAnswers`, `listCommitments({filter})`, `updateCommitment({id, status})`, `listDigest({range, channel})`
- `runIngestion()` — manual "Re-index" button; pulls `conversations.list` + `conversations.history` for accessible channels.

### B5. Ingestion + extraction
- On every incoming `message` event: store in `slack_messages`, then run a lightweight LLM classifier (Lovable AI Gateway, Gemini Flash) that returns `{is_commitment, title?, owner?, due?, digest_type?}`. Commitments get inserted; digest events get inserted for the Activity Digest view.
- Owner resolution: Slack user IDs → names via `users.info` (cached in `slack_installations.user_cache jsonb`).

### B6. Wire the dashboard UI
- **Sidebar**: logout button; workspace name from `getWorkspace`.
- **Dashboard home**: metric cards from real counts; "Priority Commitments" from `commitments` where `status='pending'` ordered by due date; "Daily Digest" preview from `digest_events` today.
- **Ask Trelo**: input calls `askTrelo` server fn (useMutation → invalidate `answers`); recent answers list from `listAnswers`; each source is a real Slack permalink.
- **Commitments**: checkboxes call `updateCommitment`; overdue = `due_date < now AND status='pending'`; completed section from `status='done'`.
- **Activity Digest**: real timeline from `digest_events`; Today/Yesterday/Week filters + channel filter both drive `loaderDeps` and the query key; search box does full-text search on `summary`.

### B7. Empty state
If no `slack_installations` row for the workspace → dashboard shows a big "Connect your Slack workspace" card with the OAuth install button. Everything else is hidden until connected.

---

## Technical details

- **Runtime**: server routes for OAuth + events (they need raw `Request`), server functions for everything else. Slack signature verification uses `crypto.createHmac('sha256', SLACK_SIGNING_SECRET)` over `v0:{timestamp}:{rawBody}`, timing-safe compare — never `JSON.parse` before verify.
- **Long ingestion**: `/api/public/slack/events` MUST respond 200 within 3s or Slack retries. Handler acks immediately, then does `waitUntil`-style background work by invoking an internal server fn without awaiting (Workers-safe pattern) or by dropping the job into a `slack_event_queue` table and processing on the next request. I'll use the queue approach — simpler and durable.
- **Token storage**: `bot_token` stored in `slack_installations` (private schema, no anon GRANT). Loaded only inside server fn handlers via `supabaseAdmin`.
- **AI**: Lovable AI Gateway (`google/gemini-2.5-flash` for classification, `google/gemini-2.5-pro` for Ask Trelo answers with citations). Auto-provisions `LOVABLE_API_KEY`.
- **Search v1**: Postgres `ILIKE` + rank by recency. v2 (fast follow, not this turn): pgvector embeddings on ingest, cosine similarity in `askTrelo`.
- **Logout hygiene**: `queryClient.cancelQueries()` → `queryClient.clear()` → `supabase.auth.signOut()` → `navigate({to:'/auth', replace:true})`.

---

## Order of operations (one turn each)

1. **This turn (after approval)**: enable Cloud, configure Slack social auth, create schema migration, build `/auth` page, move dashboard under `_authenticated/`, add logout, add empty "Connect Slack" state.
2. **Next turn**: implement `/api/public/slack/install` + `/oauth/callback` + `/events` (signature verify + queue), then I give you the exact manifest JSON with your Cloud URLs pre-filled.
3. **Then**: ingestion worker + `askTrelo` + `listCommitments`/`updateCommitment` + digest queries; wire all three views to real data.
4. **Then**: seed a demo workspace + polish empty states.

---

## Open decisions (I'll assume these unless you object)

- **Workspaces = 1 per user** for v1 (a user's account maps to one workspace they own). Multi-user teams / invites = later.
- **Skip pgvector for v1** — ILIKE + recency is enough for a demo; embeddings later.
- **No Notion export yet** — the plan.md had Notion as the task destination, but you've since built the Commitments UI inside Trelo. I'll keep tasks native to Trelo and add a "Push to Notion" toggle later if you want.

Approve this and I'll ship step 1.
