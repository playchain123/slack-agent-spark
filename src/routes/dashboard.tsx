import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Trelo — Workspace" },
      {
        name: "description",
        content:
          "Trelo workspace: ask questions, track commitments, and read daily digests from your Slack conversations.",
      },
    ],
  }),
  component: Dashboard,
});

type Channel = { id: string; name: string; unread?: number; dot?: boolean };
type Thread = {
  id: string;
  channel: string;
  author: string;
  time: string;
  preview: string;
  answered?: boolean;
};
type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  channel: string;
  done: boolean;
};
type Answer = { id: string; q: string; a: string; sources: string };

const channelsSidebar: Channel[] = [
  { id: "c1", name: "general" },
  { id: "c2", name: "product", unread: 3, dot: true },
  { id: "c3", name: "engineering", unread: 12 },
  { id: "c4", name: "marketing" },
  { id: "c5", name: "customers", dot: true },
  { id: "c6", name: "design-crit" },
  { id: "c7", name: "hiring" },
  { id: "c8", name: "random" },
];

const dms: Channel[] = [
  { id: "d1", name: "Maya Chen", dot: true },
  { id: "d2", name: "Diego Alvarez" },
  { id: "d3", name: "Priya Nair", unread: 2 },
  { id: "d4", name: "Sam Okafor" },
];

const seedTasks: Task[] = [
  { id: "t1", title: "Ship pricing v2 copy", owner: "Maya", due: "Fri", channel: "marketing", done: false },
  { id: "t2", title: "Review Q3 hiring plan", owner: "Diego", due: "Mon", channel: "hiring", done: false },
  { id: "t3", title: "Send Ravel onboarding doc", owner: "Priya", due: "Today", channel: "customers", done: false },
  { id: "t4", title: "Publish security whitepaper", owner: "Sam", due: "Wed", channel: "trust", done: true },
  { id: "t5", title: "DNS cutover for Vercel migration", owner: "Diego", due: "Thu", channel: "engineering", done: false },
];

const threads: Thread[] = [
  { id: "th1", channel: "product", author: "Kai", time: "2m", preview: "Should the trial be 14 or 30 days?", answered: true },
  { id: "th2", channel: "engineering", author: "Diego", time: "18m", preview: "Anyone remember why we chose pg over planetscale?", answered: true },
  { id: "th3", channel: "customers", author: "Priya", time: "1h", preview: "Ravel wants SSO by Q4 — is that on the roadmap?" },
  { id: "th4", channel: "marketing", author: "Maya", time: "3h", preview: "Pricing page copy draft — pls review before Fri.", answered: true },
  { id: "th5", channel: "hiring", author: "Sam", time: "Yesterday", preview: "3 offers out. 1 accepted. Waiting on 2." },
];

const seedAnswers: Answer[] = [
  {
    id: "a1",
    q: "What's our refund policy for annual plans?",
    a: "Pro-rated within 30 days. Referenced in #ops from Apr 2.",
    sources: "3 threads · #ops #cs",
  },
  {
    id: "a2",
    q: "Who owns the Vercel migration?",
    a: "Diego is lead, Priya covers DNS. Kickoff was in #engineering May 14.",
    sources: "5 threads · #engineering #infra",
  },
];

function Dashboard() {
  const [tasks, setTasks] = useState(seedTasks);
  const [answers, setAnswers] = useState(seedAnswers);
  const [query, setQuery] = useState("");
  const [activeChannel, setActiveChannel] = useState("product");
  const [tab, setTab] = useState<"threads" | "tasks" | "digest">("threads");

  const openTasks = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAnswers((prev) => [
      {
        id: `a${Date.now()}`,
        q: query.trim(),
        a: "Trelo scanned 1,204 messages across 12 channels. No exact answer yet — showing closest threads.",
        sources: "4 threads · #general #product",
      },
      ...prev,
    ]);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1c1d]">
      {/* Top bar */}
      <header className="flex h-11 items-center justify-between border-b border-[#e8e8e8] px-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="grid h-5 w-5 place-items-center rounded bg-black">
              <span className="text-[10px] font-black text-white">T</span>
            </div>
            <span className="text-[13px] font-bold tracking-tight">trelo</span>
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md items-center gap-1.5 rounded-md border border-[#e8e8e8] bg-[#f8f8f8] px-2 py-1">
          <SearchIcon />
          <input
            className="w-full bg-transparent text-[11px] text-[#1d1c1d] outline-none placeholder:text-[#a0a0a0]"
            placeholder="Search Ravel"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded p-1 hover:bg-[#f2f2f2]"><BellIcon /></button>
          <button className="rounded p-1 hover:bg-[#f2f2f2]"><HelpIcon /></button>
          <div className="grid h-6 w-6 place-items-center rounded bg-[#611f69] text-[10px] font-bold text-white">MC</div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-44px)]">
        {/* Left sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-[#e8e8e8] bg-[#f8f8f8] md:block">
          <nav className="px-2 py-3 text-[12px] text-[#1d1c1d]">
            <SidebarItem icon={<InboxIcon />} label="Threads" badge="4" />
            <SidebarItem icon={<BoltIcon />} label="Trelo agent" active />
            <SidebarItem icon={<CheckIcon />} label="Commitments" badge={String(openTasks)} />
            <SidebarItem icon={<DocIcon />} label="Digests" />
            <SidebarItem icon={<StarIcon />} label="Saved" />
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Channel header */}
          <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-[13px] font-bold">#{activeChannel}</h1>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded p-1 hover:bg-[#f2f2f2]"><PinIcon /></button>
              <button className="rounded p-1 hover:bg-[#f2f2f2]"><UsersIcon /></button>
              <button className="rounded p-1 hover:bg-[#f2f2f2]"><MoreIcon /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-[#e8e8e8] px-5">
            {(["threads", "tasks", "digest"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative py-2 text-[11px] font-medium capitalize ${
                  tab === t ? "text-[#1d1c1d]" : "text-[#616061] hover:text-[#1d1c1d]"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#1d1c1d]" />
                )}
              </button>
            ))}
          </div>

          {/* Ask Trelo */}
          <div className="border-b border-[#e8e8e8] px-5 py-3">
            <form onSubmit={handleAsk} className="flex items-center gap-2 rounded-md border border-[#e8e8e8] bg-white px-2 py-1.5 focus-within:border-black">
              <BoltIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Trelo anything your team has said…"
                className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#a0a0a0]"
              />
              <button className="rounded bg-black px-2 py-1 text-[10px] font-medium text-white">
                Ask
              </button>
            </form>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {tab === "threads" && <ThreadsView threads={threads} />}
            {tab === "tasks" && (
              <TasksView
                tasks={tasks}
                onToggle={(id) =>
                  setTasks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
                  )
                }
              />
            )}
            {tab === "digest" && <DigestView />}
          </div>
        </main>

        {/* Right rail */}
        <aside className="hidden w-72 shrink-0 overflow-auto border-l border-[#e8e8e8] bg-white lg:block">
          <div className="border-b border-[#e8e8e8] px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#616061]">
              Today
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label="Answers" value="27" />
              <Stat label="Open tasks" value={String(openTasks)} />
              <Stat label="Threads" value="1,204" />
              <Stat label="Time saved" value="3h 42m" />
            </div>
          </div>

          <div className="border-b border-[#e8e8e8] px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#616061]">
              Recent answers
            </div>
            <ul className="mt-2 space-y-2">
              {answers.map((a) => (
                <li key={a.id} className="rounded-md border border-[#eee] p-2">
                  <div className="text-[11px] font-semibold text-[#1d1c1d]">{a.q}</div>
                  <p className="mt-1 text-[11px] leading-snug text-[#616061]">{a.a}</p>
                  <div className="mt-1 text-[10px] text-[#a0a0a0]">{a.sources}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Views ---------- */

function ThreadsView({ threads }: { threads: Thread[] }) {
  return (
    <ul className="divide-y divide-[#f0f0f0]">
      {threads.map((t) => (
        <li key={t.id} className="flex items-start gap-3 py-2.5">
          <div className="mt-0.5 grid h-6 w-6 place-items-center rounded bg-[#f2f2f2] text-[10px] font-bold text-[#616061]">
            {t.author[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-[#1d1c1d]">{t.author}</span>
              <span className="text-[#a0a0a0]">#{t.channel}</span>
              <span className="text-[#a0a0a0]">· {t.time}</span>
              {t.answered && (
                <span className="rounded bg-[#eafaf1] px-1.5 py-0.5 text-[9px] font-medium text-[#1e8a5f]">
                  Trelo replied
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-[#1d1c1d]">{t.preview}</p>
          </div>
          <button className="rounded p-1 text-[#616061] hover:bg-[#f2f2f2]">
            <MoreIcon />
          </button>
        </li>
      ))}
    </ul>
  );
}

function TasksView({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-[#f0f0f0]">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={t.done}
            onChange={() => onToggle(t.id)}
            className="h-3.5 w-3.5 accent-black"
          />
          <div className="min-w-0 flex-1">
            <div
              className={`truncate text-[12px] ${
                t.done ? "text-[#a0a0a0] line-through" : "text-[#1d1c1d]"
              }`}
            >
              {t.title}
            </div>
            <div className="text-[10px] text-[#616061]">
              #{t.channel} · @{t.owner.toLowerCase()}
            </div>
          </div>
          <span className="rounded border border-[#e8e8e8] px-1.5 py-0.5 text-[10px] text-[#616061]">
            {t.due}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DigestView() {
  const bullets = [
    "Pricing v2 launches Friday — copy in review.",
    "Ravel signed — kickoff Tuesday 10am.",
    "Vercel migration on track, DNS cutover Thu.",
    "2 overdue commitments need a nudge.",
    "Hiring: 3 offers out, 1 accepted.",
  ];
  return (
    <div className="max-w-xl rounded-md border border-[#e8e8e8] p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#616061]">
        Daily digest · Friday
      </div>
      <h2 className="mt-1 text-[13px] font-bold">Five-line briefing</h2>
      <ul className="mt-3 space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-[12px] text-[#1d1c1d]">
            <span className="text-[#a0a0a0]">{i + 1}.</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <button className="rounded bg-black px-2.5 py-1 text-[10px] font-medium text-white">
          Post to #general
        </button>
        <button className="rounded border border-[#e8e8e8] px-2.5 py-1 text-[10px] font-medium text-[#1d1c1d] hover:bg-[#f8f8f8]">
          Email me
        </button>
      </div>
    </div>
  );
}

/* ---------- Bits ---------- */

function SidebarItem({
  icon,
  label,
  badge,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[12px] ${
        active ? "bg-[#e8e8e8] font-semibold text-[#1d1c1d]" : "text-[#1d1c1d] hover:bg-[#eeeeee]"
      }`}
    >
      <span className="text-[#616061]">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded bg-[#1264a3] px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function RowButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[12px] ${
        active ? "bg-[#1264a3] text-white" : "text-[#1d1c1d] hover:bg-[#eeeeee]"
      }`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#616061]">
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#eee] p-2">
      <div className="text-[10px] text-[#616061]">{label}</div>
      <div className="text-[14px] font-bold text-[#1d1c1d]">{value}</div>
    </div>
  );
}

/* ---------- Icons (14px) ---------- */

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SearchIcon() {
  return (
    <svg {...iconProps} width={12} height={12}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" />
      <path d="M12 17h.01" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 13V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 13h5l2 3h4l2-3h5v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg {...iconProps}>
      <path d="m12 3 2.9 6.1 6.6.8-4.8 4.6 1.3 6.6L12 18l-6 3.1 1.3-6.6L2.5 9.9l6.6-.8Z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 17v5" />
      <path d="M9 3h6l-1 6 4 4H6l4-4Z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 20c0-2.5 2-4 4-4s2 1 2 4" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}
