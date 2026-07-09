# MemoryOps — Slack Agent Build Plan

A Slack agent that (1) answers questions by searching past Slack threads and (2) extracts action items and creates tasks in Notion with reminders.

## Tech choice

Use **Slack Custom App + Bolt for JavaScript (Node.js)** hosted as a small server. Reasoning:
- Needed to receive Slack events (mentions, messages) — Lovable's managed Slack connector can't receive events, only send.
- Bolt is the officially recommended path for the hackathon's "Agents & AI Apps" track.
- Uses Slack's newest APIs: `assistant.search.context`, Assistant/Agent UI, Block Kit.

Stack:
- **Slack Bolt JS** (`@slack/bolt`) — event handling, Assistant class
- **OpenAI or Anthropic API** — intent detection + action item extraction (via Lovable AI Gateway)
- **Notion API** — task creation
- **Supabase (Lovable Cloud)** — store reminders, thread → task mappings, scheduled DMs
- **Node cron / Supabase pg_cron** — reminder DMs
- Host: Railway / Render / Fly.io (Slack needs a public HTTPS URL); ngrok during dev

## Architecture

```
Slack workspace
   │  (events: app_mention, assistant_thread_started, message)
   ▼
Bolt app  ──►  Intent router (LLM)
                   │
      ┌────────────┼─────────────┐
      ▼            ▼             ▼
  ANSWER MODE   ACTION MODE   FALLBACK
  search.context extract task   help msg
      │            │
      ▼            ▼
  LLM summarize  Notion API
  + Block Kit    + Supabase (reminder row)
  reply w/ links + DM confirmation
                   │
                   ▼
              Cron worker → DM owner before due date
```

## 5-Day Build Plan

**Day 0 (today, 2h)** — Setup
- Register at Devpost, create free Slack workspace + dev sandbox
- Create Slack app from manifest (scopes: `app_mentions:read`, `chat:write`, `assistant:write`, `channels:history`, `im:write`, `search:read.public`, `users:read`)
- Get Notion internal integration token; create target database with Task/Owner/Due/Source fields
- Init repo, deploy hello-world Bolt app to Railway, verify Events URL

**Day 1** — Core event loop + Answer mode
- Handle `app_mention` and Assistant thread events
- Call `assistant.search.context` with the user's question
- LLM prompt: summarize top results into 2–3 sentence answer with citations
- Reply with Block Kit: answer + linked source threads

**Day 2** — Action mode
- Add intent classifier (LLM structured output: `answer` | `action` | `both`)
- Action extractor prompt returns `{title, owner_slack_id, due_date, context}`
- Create Notion page via API; store `{task_id, owner, due, thread_ts}` in Supabase
- Post Block Kit confirmation in thread with Notion link + "Edit" / "Cancel" buttons

**Day 3** — Reminders + polish
- pg_cron job every hour: find reminders due within 24h, DM owner with task + original thread link
- Handle Block Kit button interactions (mark done, snooze)
- Error states, rate limits, empty search results

**Day 4** — Demo prep
- Seed demo workspace with realistic conversations (product decisions, bug reports, commitments)
- Write 90s demo script:
  1. Ask "how did we handle the Stripe webhook issue?" → agent replies with answer + 2 linked threads
  2. In new thread: "I'll ship the pricing page redesign by Friday" → agent extracts task, creates Notion entry, confirms
  3. Fast-forward: show DM reminder
- Record video (Loom), edit under 3 minutes

**Day 5** — Submission
- Write Devpost description: problem, solution, Slack APIs used, tech stack, what's next
- Screenshots, video, GitHub repo (public)
- Submit before deadline

## Technical details

**Intent detection prompt (structured output):**
```json
{
  "mode": "answer | action | both",
  "question": "...",
  "action": { "title": "...", "owner": "U123", "due": "2026-07-15" }
}
```

**Key Slack APIs:**
- `assistant.search.context` — semantic search across history (the marquee 2026 API)
- `assistant.threads.setStatus` — show "thinking..." while processing
- `chat.postMessage` with Block Kit — rich formatted responses
- `views.open` — modal for editing extracted tasks before creating

**Notion schema:**
- Title (title), Owner (person/text), Due date (date), Source (URL to Slack thread), Status (select)

**Supabase tables:**
- `reminders(id, slack_user_id, notion_page_id, thread_permalink, due_at, sent_at, status)`
- `agent_events(id, event_type, payload, created_at)` for debugging

## What Lovable builds vs external

The Slack bot itself runs outside Lovable (Bolt needs a persistent Node server, not edge functions). Use this Lovable project as:
- Landing page / demo site for the submission
- Admin dashboard (optional): view reminders, Notion links, agent activity from Supabase
- Docs page explaining setup

Do you want me to (a) scaffold the Bolt bot repo structure with the event handlers + Notion + search stubs now, or (b) start with the Lovable landing/dashboard page first?