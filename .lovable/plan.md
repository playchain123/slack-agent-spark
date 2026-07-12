
# Trelo Dashboard — Full Functionality Plan

Goal: every screen shows **real data from your Slack workspace** (no mocks), the AI works, and every button does something.

---

## 1. Logout (quick win)
- Add a **Log out** button in the sidebar footer + a user menu with avatar in the TopBar.
- Wire to existing `useLogout()` (already in the codebase).

## 2. Ask Trelo — real AI chat over your Slack data
- New route `/_authenticated/ask` (or keep view-switch, but persistent).
- Chat UI: input box + streaming responses + message history.
- Server function `askTrelo` that:
  1. Takes the user's question.
  2. Retrieves the most relevant recent `slack_messages` for the workspace (keyword + trigram similarity — `pg_trgm` is already installed).
  3. Feeds them as context to **Lovable AI** (`google/gemini-3-flash-preview`).
  4. Streams the answer back with citations (channel + timestamp link to Slack).
- Persist Q&A in existing `answers` table.

## 3. Commitments — auto-extracted action items
- Background: when a new `slack_messages` row is inserted (already happening via events), run an AI extraction pass to detect commitments ("I'll send the doc by Friday", "@sam can you review…") and insert into `commitments` table.
- UI: real list from `commitments` table, checkbox to mark done, filter by mine/all/open/done, links back to source Slack thread.
- Server functions: `listCommitments`, `toggleCommitment`, `extractCommitmentsFromMessage`.

## 4. Activity Digest — daily rollup
- Server function `getTodayDigest` that:
  - Reads today's `slack_messages` grouped by channel.
  - Uses Lovable AI to summarize into 3–6 bullets per channel + surface top decisions/blockers.
  - Caches result in `digest_events` for the day.
- UI: date picker, channel filter, "Regenerate" button.

## 5. Dashboard home — real metrics
- Replace welcome placeholder with live tiles:
  - Messages indexed (24h / 7d)
  - Open commitments count
  - Top active channels
  - Latest digest preview + jump link
- All from real Supabase queries via server fns.

## 6. Search (TopBar)
- Wire the search input to a real server fn that trigram-searches `slack_messages` and returns a dropdown of hits.

## 7. Slack event pipeline sanity pass
- Verify `slack_event_queue` → `slack_messages` flow is actually populating on new Slack messages (I'll query the DB and spot-check).
- Fix any gaps so #2–#5 have data to work on.

---

## Technical notes

- All AI calls use **Lovable AI Gateway** (`LOVABLE_API_KEY`, already set) — no extra keys.
- All DB access via `createServerFn` + `requireSupabaseAuth` (already wired). Nothing bypasses RLS.
- Commitment extraction runs synchronously per new message inside the Slack events handler (already at `/api/public/slack/events`) — no cron needed for v1.
- Digest generated on demand + cached; add cron later if you want auto-daily.
- Frontend: existing dashboard shell stays, views become real routes/components. Empty states remain for zero-data scenarios.

---

## Suggested execution order (I can do all in this turn)

1. Logout + user menu (5 min)
2. Slack pipeline sanity check + fixes
3. Ask Trelo (chat UI + server fn + retrieval)
4. Commitments (extractor + list UI + toggle)
5. Digest (generator + view)
6. Dashboard home tiles
7. TopBar search

**Estimated:** one large turn covers 1–5 solidly; 6–7 can be a follow-up if credits are tight.

---

**Confirm and I'll execute in order.** Or tell me to skip/reprioritize any section (e.g. "skip digest for now, focus on Ask Trelo + Commitments").
