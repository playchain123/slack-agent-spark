import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Trelo Dashboard — Answers, tasks, and digests from Slack" },
      {
        name: "description",
        content:
          "Your Trelo workspace: search past Slack threads, track commitments as tasks, and read the daily digest.",
      },
    ],
  }),
  component: Dashboard,
});

type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  channel: string;
  status: "open" | "done";
};

const initialTasks: Task[] = [
  { id: "t1", title: "Ship pricing page copy", owner: "Maya", due: "Fri", channel: "#marketing", status: "open" },
  { id: "t2", title: "Review Q3 hiring plan", owner: "Diego", due: "Mon", channel: "#eng-leads", status: "open" },
  { id: "t3", title: "Send Ravel onboarding doc", owner: "Priya", due: "Today", channel: "#customers", status: "open" },
  { id: "t4", title: "Publish security whitepaper", owner: "Sam", due: "Wed", channel: "#trust", status: "done" },
];

const answers = [
  {
    q: "What's our refund policy for annual plans?",
    a: "Pro-rated refunds within 30 days. Referenced in #ops thread from Apr 2.",
    source: "3 threads · #ops, #cs",
  },
  {
    q: "Who owns the Vercel migration?",
    a: "Diego is lead, Priya covers DNS. Kickoff was in #eng on May 14.",
    source: "5 threads · #eng, #infra",
  },
  {
    q: "When is the next all-hands?",
    a: "Thursday 10am PT. Agenda pinned in #general.",
    source: "1 thread · #general",
  },
];

const activity = [
  { t: "2m ago", text: "Answered @kai in #product about pricing tiers" },
  { t: "18m ago", text: "Created task for Maya from #marketing thread" },
  { t: "1h ago", text: "Summarised 42 messages in #eng-standup" },
  { t: "3h ago", text: "Nudged Diego on overdue commitment" },
  { t: "Yesterday", text: "Indexed 1,204 new messages across 12 channels" },
];

function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const openTasks = tasks.filter((t) => t.status === "open").length;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Top bar */}
      <header className="border-b border-[#ebecf0] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-black">
              <span className="text-sm font-black text-white">T</span>
            </div>
            <span className="text-xl font-black tracking-tight text-black">trelo</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-[#42526e] sm:inline">
              Ravel workspace
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0052cc] text-[12px] font-bold text-white">
              MC
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
            Good morning, Maya
          </h1>
          <p className="mt-2 text-[15px] text-[#42526e]">
            Trelo watched {activity.length > 0 ? "12 channels" : "your workspace"} overnight.
            You have {openTasks} open commitments and a fresh daily digest below.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Answers today", value: "27", accent: "#0052cc" },
            { label: "Open tasks", value: String(openTasks), accent: "#ff8b00" },
            { label: "Threads indexed", value: "1,204", accent: "#8777d9" },
            { label: "Time saved", value: "3h 42m", accent: "#2eb67d" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-2xl border border-[#dfe1e6] bg-white p-5 shadow-sm"
            >
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: s.accent }} />
              <div className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-[#6b778c]">
                {s.label}
              </div>
              <div className="mt-1 text-2xl font-black text-black">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Ask Trelo */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl border border-[#dfe1e6] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-black">Ask Trelo</h2>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0052cc]">
                Memory
              </span>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex gap-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything your team has ever said in Slack…"
                className="flex-1 rounded-md border border-[#dfe1e6] bg-white px-4 py-3 text-[14px] text-black outline-none focus:border-black"
              />
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-3 text-[13px] font-medium text-white shadow-sm hover:bg-neutral-800"
              >
                Search
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {answers.map((a, i) => (
                <motion.div
                  key={a.q}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  className="rounded-xl border border-[#ebecf0] p-4 hover:border-black transition"
                >
                  <div className="text-[13px] font-semibold text-black">{a.q}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#42526e]">{a.a}</p>
                  <div className="mt-2 text-[11px] font-medium text-[#6b778c]">{a.source}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Activity */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl border border-[#dfe1e6] bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-black text-black">Recent activity</h2>
            <ul className="mt-4 space-y-4">
              {activity.map((a, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex gap-3"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0052cc]" />
                  <div>
                    <div className="text-[13px] text-black">{a.text}</div>
                    <div className="text-[11px] text-[#6b778c]">{a.t}</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Tasks + digest */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border border-[#dfe1e6] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-black">Tracked commitments</h2>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff8b00]">
                Follow-through
              </span>
            </div>
            <div className="mt-4 divide-y divide-[#ebecf0]">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={t.status === "done"}
                    onChange={() =>
                      setTasks((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? { ...x, status: x.status === "open" ? "done" : "open" }
                            : x
                        )
                      )
                    }
                    className="h-4 w-4 accent-black"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-[14px] ${
                        t.status === "done"
                          ? "text-[#6b778c] line-through"
                          : "font-medium text-black"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[11px] text-[#6b778c]">
                      {t.channel} · @{t.owner.toLowerCase()}
                    </div>
                  </div>
                  <span className="rounded-full border border-[#dfe1e6] px-2 py-0.5 text-[11px] font-medium text-[#42526e]">
                    {t.due}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Daily digest */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="rounded-2xl bg-black p-6 text-white shadow-sm"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8777d9]">
              Daily digest
            </div>
            <h2 className="mt-2 text-lg font-black">Five-line briefing</h2>
            <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-white/85">
              <li>• Pricing v2 launches Friday — copy in review.</li>
              <li>• Ravel signed — kickoff Tuesday 10am.</li>
              <li>• Vercel migration on track, DNS cutover Thu.</li>
              <li>• 2 overdue commitments need a nudge.</li>
              <li>• Hiring: 3 offers out, 1 accepted.</li>
            </ul>
            <button className="mt-6 w-full rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-white/90">
              Open in Slack
            </button>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
