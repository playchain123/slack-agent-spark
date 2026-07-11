import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Newspaper,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Plus,
  Sparkles,
  ArrowRight,
  Link as LinkIcon,
  History,
  TrendingUp,
  Lightbulb,
  Send,
  Flag,
  Calendar,
  Hash,
  Clock,
  AlertCircle,
  Filter,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
  Database,
  MessagesSquare,
  Zap,
  Bot,
  ListTodo,
  Check,
  ClipboardCheck,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Trelo — Command Center" },
      {
        name: "description",
        content:
          "Trelo workspace: dashboard, Ask Trelo, and commitments extracted from your Slack conversations.",
      },
    ],
  }),
  component: Dashboard,
});

/* ---------- Design tokens (from Trelo Stitch spec) ---------- */
const c = {
  bg: "#fdf8f9",
  surface: "#fdf8f9",
  surfaceLow: "#f7f2f3",
  surfaceMid: "#f1edee",
  surfaceHigh: "#ebe7e8",
  outline: "#d2c2cd",
  primary: "#4a154b",
  primaryDeep: "#300033",
  primaryContainer: "#f6dcf3",
  onPrimaryContainer: "#4a154b",
  onSurface: "#1c1b1c",
  onSurfaceVariant: "#4f434c",
  secondary: "#006c46",
  secondaryContainer: "#c8f5dd",
  onSecondaryContainer: "#00522f",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  tertiaryFixed: "#ffdea4",
  onTertiaryFixed: "#5d4200",
};

type View = "dashboard" | "ask" | "commitments" | "digest" | "analytics";

function Dashboard() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ background: c.bg, color: c.onSurface, fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      {/* Sidebar */}
      <Sidebar view={view} setView={setView} />

      {/* Main */}
      <main className="ml-[240px] min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1">
          {view === "dashboard" && <DashboardView setView={setView} />}
          {view === "ask" && <AskTreloView />}
          {view === "commitments" && <CommitmentsView />}
          {view === "digest" && <DigestPlaceholder title="Activity Digest" />}
          {view === "analytics" && <DigestPlaceholder title="Analytics" />}
        </div>
      </main>
    </div>
  );
}

/* ---------- Sidebar ---------- */

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "ask", label: "Ask Trelo", icon: <MessageSquare size={16} /> },
    { id: "commitments", label: "Commitments", icon: <CheckSquare size={16} /> },
    { id: "digest", label: "Activity Digest", icon: <Newspaper size={16} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  ];
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] flex flex-col p-3 z-50 border-r"
      style={{ background: c.surfaceLow, borderColor: c.outline }}
    >
      <Link to="/" className="flex items-center gap-2.5 px-2 mb-5">
        <div
          className="w-8 h-8 rounded-lg grid place-items-center text-white"
          style={{ background: c.primary }}
        >
          <Bot size={16} strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold" style={{ color: c.primaryDeep }}>
            Trelo
          </div>
          <div
            className="text-[9px] uppercase tracking-widest"
            style={{ color: c.onSurfaceVariant }}
          >
            Active in Slack
          </div>
        </div>
      </Link>

      <button
        className="flex items-center justify-center gap-1.5 rounded-lg py-2 mb-4 text-[11px] font-semibold text-white hover:opacity-90"
        style={{ background: c.primary }}
      >
        <Plus size={13} strokeWidth={2.4} />
        New Request
      </button>

      <nav className="flex-1 space-y-0.5">
        {items.map((it) => {
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[11.5px] font-medium transition-colors"
              style={
                active
                  ? { background: c.primaryContainer, color: c.onPrimaryContainer }
                  : { color: c.onSurfaceVariant }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget.style.background = c.surfaceHigh);
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget.style.background = "transparent");
              }}
            >
              {it.icon}
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-3 space-y-0.5 border-t" style={{ borderColor: c.outline }}>
        <SidebarSub icon={<HelpCircle size={15} />}>Support</SidebarSub>
        <SidebarSub icon={<Settings size={15} />}>Settings</SidebarSub>
      </div>
    </aside>
  );
}

function SidebarSub({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] hover:bg-[#ebe7e8]"
      style={{ color: c.onSurfaceVariant }}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

/* ---------- TopBar ---------- */

function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b"
      style={{ background: c.surface, borderColor: c.outline }}
    >
      <div className="flex-1 max-w-xl relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: c.onSurfaceVariant }}
        />
        <input
          placeholder="Search threads, documents, or insights…"
          className="w-full rounded-full pl-9 pr-4 py-1.5 text-[12px] outline-none focus:ring-2"
          style={{ background: c.surfaceLow, color: c.onSurface }}
        />
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          className="p-1.5 rounded-full hover:bg-[#f1edee] relative"
          style={{ color: c.onSurfaceVariant }}
        >
          <Bell size={15} />
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: c.error }}
          />
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-[#f1edee]"
          style={{ color: c.onSurfaceVariant }}
        >
          <HelpCircle size={15} />
        </button>
        <div
          className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white"
          style={{ background: c.primary }}
        >
          SC
        </div>
      </div>
    </header>
  );
}

/* ---------- Dashboard View ---------- */

function DashboardView({ setView }: { setView: (v: View) => void }) {
  const [ask, setAsk] = useState("");
  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Greeting */}
      <section className="mb-6">
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: c.primaryDeep }}>
          Good morning, Sarah
        </h2>
        <p className="mt-1 text-[12.5px] max-w-2xl" style={{ color: c.onSurfaceVariant }}>
          Trelo has analyzed 14 new Slack threads since you last checked. Your primary focus today is{" "}
          <span className="font-semibold" style={{ color: c.primaryDeep }}>
            reviewing the Q3 Product Roadmap
          </span>{" "}
          and resolving 3 engineering bottlenecks.
        </p>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Metric icon={<Database size={16} />} label="Threads Indexed" value="1,240" tint={c.surfaceMid} iconTint={c.primary} />
        <Metric
          icon={<ClipboardCheck size={16} />}
          label="Active Commitments"
          value="12"
          tint={c.secondaryContainer}
          iconTint={c.onSecondaryContainer}
        />
        <Metric
          icon={<MessagesSquare size={16} />}
          label="Answers Provided"
          value="85"
          tint={c.tertiaryFixed}
          iconTint={c.onTertiaryFixed}
        />
        <div
          className="p-3.5 rounded-xl flex items-center gap-3"
          style={{ background: c.primary, color: "#fff", boxShadow: "0 4px 14px rgba(48,0,51,.18)" }}
        >
          <div
            className="w-10 h-10 rounded-lg grid place-items-center"
            style={{ background: "rgba(255,255,255,.15)" }}
          >
            <Zap size={16} />
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-widest opacity-70">Time Saved</div>
            <div className="text-[18px] font-bold">14.5 hrs</div>
          </div>
        </div>
      </section>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Digest */}
        <section className="lg:col-span-8">
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "#fff", borderColor: c.outline }}
          >
            <div
              className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: c.outline, background: c.surfaceLow }}
            >
              <h3 className="text-[13px] font-semibold" style={{ color: c.onSurface }}>
                Daily Activity Digest
              </h3>
              <button
                className="text-[11px] font-semibold flex items-center gap-1 hover:underline"
                style={{ color: c.primary }}
              >
                View all threads <ExternalLink size={11} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <DigestItem
                initials="PD"
                chip="#product-design"
                chipBg={c.primaryContainer}
                chipFg={c.onPrimaryContainer}
                time="12:30 PM Today"
                status={{ label: "Resolved", bg: c.secondaryContainer, fg: c.onSecondaryContainer }}
                title="User Feedback Synthesis: Q3 Roadmap Update"
                bullets={[
                  <>
                    Team decided to prioritize <b>Offline Mode</b> over the Dark Mode refresh for the
                    July release.
                  </>,
                  <>Design debt in navigation identified as a blocker; Sarah to audit by Friday.</>,
                  <>
                    New feedback loop with Support via <b>#customer-voice</b>.
                  </>,
                ]}
              />
              <DigestItem
                initials="ES"
                chip="#engineering-sync"
                chipBg="#c8f5dd"
                chipFg="#00522f"
                time="9:45 AM Today"
                status={{ label: "High Priority", bg: c.tertiaryFixed, fg: c.onTertiaryFixed }}
                title="API Migration Strategy & Security Patching"
                bullets={[
                  <>Migration to v2 endpoints starts Monday; no downtime expected.</>,
                  <>
                    <b>Security vulnerability</b> in the legacy auth module patched and deployed at 10 AM.
                  </>,
                  <>David to provide the final documentation link by EOD.</>,
                ]}
              />
              <DigestItem
                initials="GA"
                chip="#general-announcements"
                chipBg={c.surfaceHigh}
                chipFg={c.onSurfaceVariant}
                time="Yesterday"
                title="Quarterly All-Hands Logistics"
                bullets={[
                  <>All-Hands scheduled Thursday 11:00 AM, Main Hall + Zoom.</>,
                  <>
                    CEO will announce the <b>Employee Recognition Awards</b>.
                  </>,
                ]}
              />
            </div>
          </div>
        </section>

        {/* Right widgets */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Quick Ask */}
          <div
            className="p-5 rounded-xl relative overflow-hidden text-white"
            style={{ background: c.primary, boxShadow: "0 8px 24px rgba(48,0,51,.22)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} />
              <h3 className="text-[13px] font-semibold">Quick Ask</h3>
            </div>
            <p className="text-[11.5px] opacity-80 mb-3">
              Ask anything about your team's conversations or project status.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAsk("");
                setView("ask");
              }}
              className="relative"
            >
              <input
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                placeholder="e.g. What did we decide on the UI?"
                className="w-full rounded-lg py-2 pl-3 pr-9 text-[11.5px] outline-none placeholder:text-white/50"
                style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}
              />
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded grid place-items-center"
                style={{ background: "#fff", color: c.primary }}
              >
                <Send size={12} />
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip>Roadmap status?</Chip>
              <Chip>Budget update?</Chip>
            </div>
          </div>

          {/* Priority commitments */}
          <div
            className="rounded-xl border"
            style={{ background: "#fff", borderColor: c.outline }}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: c.outline }}
            >
              <h3 className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: c.onSurface }}>
                <Flag size={13} style={{ color: c.primary }} /> Priority Commitments
              </h3>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                style={{ background: c.error }}
              >
                3 NEW
              </span>
            </div>
            <div className="p-4 space-y-3">
              <PriorityTask
                title="Audit navigation UI patterns"
                due="Due Friday"
                channel="#product-design"
              />
              <hr style={{ borderColor: c.surfaceMid }} />
              <PriorityTask
                title="Sign off on Security Patch v2.4"
                due="Today, 4 PM"
                dueUrgent
                channel="#engineering-sync"
              />
              <hr style={{ borderColor: c.surfaceMid }} />
              <PriorityTask
                title="Approve hiring budget for Q3 designers"
                due="Next Mon"
                channel="#mgmt-leads"
              />
              <button
                onClick={() => setView("commitments")}
                className="w-full mt-1 py-1.5 rounded-lg text-[11px] border hover:bg-[#f7f2f3]"
                style={{ borderColor: c.outline, color: c.onSurfaceVariant }}
              >
                View all Commitments (12)
              </button>
            </div>
          </div>

          {/* Insight */}
          <div
            className="p-4 rounded-xl"
            style={{ background: "linear-gradient(135deg,#4a154b,#7a3d7a)", color: "#fff" }}
          >
            <h4 className="text-[13px] font-semibold leading-tight">Intelligent Insight</h4>
            <p className="text-[11px] opacity-80 mt-1">
              Communication efficiency is up 12% this week across all engineering channels.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  tint,
  iconTint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
  iconTint: string;
}) {
  return (
    <div
      className="p-3.5 rounded-xl border flex items-center gap-3"
      style={{ background: "#fff", borderColor: c.outline }}
    >
      <div
        className="w-10 h-10 rounded-lg grid place-items-center"
        style={{ background: tint, color: iconTint }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[9.5px] uppercase tracking-widest" style={{ color: c.onSurfaceVariant }}>
          {label}
        </div>
        <div className="text-[18px] font-bold">{value}</div>
      </div>
    </div>
  );
}

function DigestItem({
  initials,
  chip,
  chipBg,
  chipFg,
  time,
  status,
  title,
  bullets,
}: {
  initials: string;
  chip: string;
  chipBg: string;
  chipFg: string;
  time: string;
  status?: { label: string; bg: string; fg: string };
  title: string;
  bullets: React.ReactNode[];
}) {
  return (
    <div className="flex gap-3">
      <div
        className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-bold shrink-0"
        style={{ background: chipBg, color: chipFg }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: chipBg, color: chipFg }}
            >
              {chip}
            </span>
            <span className="text-[10.5px]" style={{ color: c.onSurfaceVariant }}>
              {time}
            </span>
          </div>
          {status && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.fg }}
            >
              {status.label}
            </span>
          )}
        </div>
        <h4 className="text-[12.5px] font-semibold mb-1.5" style={{ color: c.onSurface }}>
          {title}
        </h4>
        <div className="rounded-lg p-3" style={{ background: c.surfaceLow }}>
          <div className="flex items-start gap-2">
            <Sparkles size={13} style={{ color: c.primary, marginTop: 2 }} />
            <ul className="text-[11.5px] space-y-1" style={{ color: c.onSurfaceVariant }}>
              {bullets.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityTask({
  title,
  due,
  dueUrgent,
  channel,
}: {
  title: string;
  due: string;
  dueUrgent?: boolean;
  channel: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 w-3.5 h-3.5 rounded border-2"
          style={{ borderColor: c.primary }}
        />
        <div className="flex-1">
          <p className="text-[12px] font-medium leading-tight" style={{ color: c.onSurface }}>
            {title}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="text-[10.5px] flex items-center gap-0.5"
              style={{ color: dueUrgent ? c.error : c.onSurfaceVariant, fontWeight: dueUrgent ? 600 : 400 }}
            >
              {dueUrgent ? <Clock size={11} /> : <Calendar size={11} />}
              {due}
            </span>
            <span
              className="text-[10.5px] flex items-center gap-0.5"
              style={{ color: c.onSurfaceVariant }}
            >
              <Hash size={11} />
              {channel.replace("#", "")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="text-[10px] px-2 py-0.5 rounded"
      style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}
    >
      {children}
    </button>
  );
}

/* ---------- Ask Trelo view ---------- */

type Answer = { id: string; tag: string; tagBg: string; tagFg: string; time: string; title: string; snippet: string; channel: string; sources: number };

const seedAnswers: Answer[] = [
  {
    id: "a1",
    tag: "Policy Update",
    tagBg: "#c8f5dd",
    tagFg: "#00522f",
    time: "2h ago",
    title: "Remote Work Expenses",
    snippet:
      '"Team leads confirmed yesterday that ergonomic equipment up to $500 is reimbursable. This applies to all full-time employees…"',
    channel: "#announcements",
    sources: 3,
  },
  {
    id: "a2",
    tag: "Engineering",
    tagBg: "#f6dcf3",
    tagFg: "#4a154b",
    time: "Yesterday",
    title: "Deployment Freeze",
    snippet:
      '"The freeze starts tomorrow at 5 PM PST. Only critical hotfixes are allowed until the new release window on Monday morning."',
    channel: "#eng-ops",
    sources: 1,
  },
  {
    id: "a3",
    tag: "Project Apollo",
    tagBg: "#ffdea4",
    tagFg: "#5d4200",
    time: "2 days ago",
    title: "Design Specs Link",
    snippet:
      '"The final Figma specs for the mobile dashboard were shared by Sarah in the thread. They include the new dark mode tokens."',
    channel: "#project-apollo",
    sources: 2,
  },
];

function AskTreloView() {
  const [q, setQ] = useState("");
  const [answers, setAnswers] = useState(seedAnswers);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setAnswers((prev) => [
      {
        id: `a${Date.now()}`,
        tag: "New Answer",
        tagBg: c.primaryContainer,
        tagFg: c.onPrimaryContainer,
        time: "just now",
        title: q.trim(),
        snippet:
          "Trelo scanned 1,240 threads. Closest match across #general, #product, and #engineering.",
        channel: "#general",
        sources: 4,
      },
      ...prev,
    ]);
    setQ("");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-6">
      <div className="flex-1">
        <div className="text-center mt-6 mb-8">
          <h2 className="text-[26px] font-bold" style={{ color: c.primaryDeep }}>
            How can I help you today?
          </h2>
          <p className="text-[12.5px] max-w-lg mx-auto mt-2" style={{ color: c.onSurfaceVariant }}>
            Access your team's collective intelligence instantly across every Slack conversation.
          </p>
        </div>

        <form onSubmit={submit} className="relative mb-10">
          <div
            className="relative flex items-center rounded-2xl p-1.5 border"
            style={{ background: "#fff", borderColor: c.outline, boxShadow: "0 6px 24px rgba(0,0,0,.05)" }}
          >
            <Sparkles size={18} style={{ color: c.primary, marginLeft: 12, marginRight: 8 }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask anything your team has discussed in Slack…"
              className="flex-1 bg-transparent outline-none py-3 text-[13.5px]"
            />
            <button
              className="px-4 py-2.5 rounded-xl text-white font-semibold text-[12px] flex items-center gap-1.5"
              style={{ background: c.primary }}
            >
              Search <ArrowRight size={13} />
            </button>
          </div>
          <div className="mt-3 flex gap-1.5 flex-wrap justify-center">
            <span className="text-[10.5px]" style={{ color: c.onSurfaceVariant }}>
              Try asking:
            </span>
            {['"What\'s the status of the Apollo project?"', '"When is the next QBR?"'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setQ(t.replace(/["]/g, ""))}
                className="text-[10.5px] px-2.5 py-0.5 rounded-full"
                style={{ background: c.surfaceMid, color: c.onSurfaceVariant }}
              >
                {t}
              </button>
            ))}
          </div>
        </form>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold flex items-center gap-1.5" style={{ color: c.primaryDeep }}>
              <History size={16} style={{ color: c.primary }} /> Recent Answers
            </h3>
            <button className="text-[11px] font-semibold hover:underline" style={{ color: c.primary }}>
              View All History
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {answers.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border flex flex-col transition-transform hover:-translate-y-0.5"
                style={{ background: "#fff", borderColor: c.outline }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-semibold"
                    style={{ background: a.tagBg, color: a.tagFg }}
                  >
                    {a.tag}
                  </span>
                  <span className="text-[10.5px]" style={{ color: c.onSurfaceVariant }}>
                    {a.time}
                  </span>
                </div>
                <h4 className="text-[13px] font-semibold mb-1" style={{ color: c.onSurface }}>
                  {a.title}
                </h4>
                <p className="text-[11.5px] mb-3 leading-relaxed" style={{ color: c.onSurfaceVariant }}>
                  {a.snippet}
                </p>
                <div
                  className="mt-auto pt-2.5 border-t flex items-center gap-1.5 text-[10.5px]"
                  style={{ borderColor: c.surfaceMid, color: c.primary }}
                >
                  <LinkIcon size={11} />
                  <span>{a.channel}</span>
                  <span style={{ color: c.onSurfaceVariant }}>•</span>
                  <span>{a.sources} sources</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="w-72 hidden lg:block">
        <div
          className="rounded-2xl p-4 border sticky top-4"
          style={{ background: "rgba(255,255,255,.75)", backdropFilter: "blur(8px)", borderColor: c.outline }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={15} style={{ color: c.primary }} />
            <h3 className="text-[13px] font-semibold" style={{ color: c.primaryDeep }}>
              Trending Now
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { tag: "Onboarding", q: "How do I set up my VPN access for the first time?", n: 12 },
              { tag: "Company Culture", q: "What is the policy for 'Work from Anywhere' month?", n: 8 },
              { tag: "Internal Tools", q: "Where can I find the credentials for the staging env?", n: 5 },
            ].map((t, i) => (
              <div key={i}>
                <p className="text-[10px] mb-0.5" style={{ color: c.onSurfaceVariant }}>
                  {t.tag}
                </p>
                <p className="text-[11.5px] font-semibold leading-snug" style={{ color: c.onSurface }}>
                  {t.q}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: c.onSurfaceVariant, opacity: 0.7 }}>
                  {t.n} searches this week
                </p>
                {i < 2 && <hr className="mt-3" style={{ borderColor: c.outline }} />}
              </div>
            ))}
          </div>
          <div
            className="mt-4 p-3 rounded-lg"
            style={{ background: c.primaryContainer, color: c.onPrimaryContainer }}
          >
            <h4 className="text-[11.5px] font-semibold mb-1 flex items-center gap-1.5">
              <Lightbulb size={13} /> Power Tip
            </h4>
            <p className="text-[10.5px]">
              Use <code className="bg-black/10 px-1 rounded">@trelo</code> in any Slack channel to get
              answers directly in the thread!
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Commitments view ---------- */

type Commitment = {
  id: string;
  title: string;
  channel: string;
  date: string;
  owner: string;
  ownerInitials: string;
  status: "overdue" | "todo" | "done";
  priority?: "High Priority" | "Slack Promise" | "Draft Sent" | "Slack Extraction";
  overdueLabel?: string;
};

const seedCommitments: Commitment[] = [
  { id: "o1", title: "Finalize Q4 roadmap presentation", channel: "#product-internal", date: "", owner: "Sarah Chen", ownerInitials: "SC", status: "overdue", priority: "High Priority", overdueLabel: "2 days ago" },
  { id: "o2", title: "Reply to API integration feedback", channel: "#dev-ops", date: "", owner: "Alex Rivera", ownerInitials: "AR", status: "overdue", priority: "Slack Promise", overdueLabel: "Yesterday" },
  { id: "o3", title: "Send client onboarding docs", channel: "#customer-success", date: "", owner: "Jordan Smith", ownerInitials: "JS", status: "overdue", priority: "Draft Sent", overdueLabel: "3 days ago" },
  { id: "t1", title: "Update vendor contract for security audit", channel: "#legal-ops", date: "Oct 28", owner: "Liam Wilson", ownerInitials: "LW", status: "todo", priority: "Slack Extraction" },
  { id: "t2", title: "Schedule sync with Marketing about rebranding", channel: "#marketing-general", date: "Oct 30", owner: "Maya Patel", ownerInitials: "MP", status: "todo" },
  { id: "t3", title: "Prepare data export for annual review", channel: "#data-science", date: "Nov 02", owner: "David Chen", ownerInitials: "DC", status: "todo" },
];

function CommitmentsView() {
  const [items, setItems] = useState(seedCommitments);
  const [mode, setMode] = useState<"list" | "kanban">("list");
  const [showDone, setShowDone] = useState(false);

  const overdue = useMemo(() => items.filter((i) => i.status === "overdue"), [items]);
  const todo = useMemo(() => items.filter((i) => i.status === "todo"), [items]);
  const done = useMemo(() => items.filter((i) => i.status === "done"), [items]);

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "done" ? "todo" : "done" } : i)),
    );

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-bold" style={{ color: c.primaryDeep }}>
            Commitments
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: c.onSurfaceVariant }}>
            Action items extracted from your Slack conversations by Trelo AI.
          </p>
        </div>
        <div
          className="flex items-center rounded-full p-1 border"
          style={{ background: c.surfaceMid, borderColor: c.outline }}
        >
          {(["list", "kanban"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5"
              style={
                mode === m
                  ? { background: "#fff", color: c.primaryDeep, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }
                  : { color: c.onSurfaceVariant }
              }
            >
              <ListTodo size={12} />
              {m === "list" ? "List" : "Kanban"}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3" style={{ color: c.error }}>
          <AlertCircle size={15} />
          <h2 className="text-[11px] font-bold uppercase tracking-widest">Overdue Actions</h2>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: c.errorContainer, color: c.onErrorContainer }}
          >
            {overdue.length}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {overdue.map((t) => (
            <OverdueCard key={t.id} item={t} />
          ))}
        </div>
      </section>

      {/* Pending */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2" style={{ color: c.primaryDeep }}>
            <ClipboardCheck size={15} style={{ color: c.primary }} />
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Pending Commitments</h2>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: c.primaryContainer, color: c.onPrimaryContainer }}
            >
              {todo.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-[#ebe7e8]" style={{ color: c.onSurfaceVariant }}>
              <Filter size={13} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-[#ebe7e8]" style={{ color: c.onSurfaceVariant }}>
              <ArrowUpDown size={13} />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {todo.map((t) => (
            <TaskRow key={t.id} item={t} onToggle={() => toggle(t.id)} />
          ))}
        </div>
      </section>

      {/* Done */}
      <section>
        <button
          onClick={() => setShowDone((s) => !s)}
          className="flex items-center gap-2 mb-3 hover:opacity-80"
          style={{ color: c.onSurfaceVariant }}
        >
          <ChevronDown
            size={15}
            style={{ transform: showDone ? "rotate(0)" : "rotate(-90deg)", transition: "transform .15s" }}
          />
          <h2 className="text-[11px] font-bold uppercase tracking-widest">
            Completed Tasks ({done.length})
          </h2>
        </button>
        {showDone && (
          <div className="space-y-2 opacity-60">
            {done.length === 0 && (
              <div
                className="text-[11.5px] p-3 rounded-lg border"
                style={{ background: c.surfaceLow, borderColor: c.outline, color: c.onSurfaceVariant }}
              >
                Mark a task done to see it here.
              </div>
            )}
            {done.map((t) => (
              <TaskRow key={t.id} item={t} onToggle={() => toggle(t.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OverdueCard({ item }: { item: Commitment }) {
  return (
    <div
      className="p-4 rounded-xl flex flex-col justify-between border-l-4 transition-transform hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,.75)",
        backdropFilter: "blur(6px)",
        border: `1px solid ${c.outline}`,
        borderLeft: `4px solid ${c.error}`,
      }}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <span
            className="text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded"
            style={
              item.priority === "High Priority"
                ? { background: c.errorContainer, color: c.onErrorContainer }
                : { background: c.surfaceHigh, color: c.onSurfaceVariant }
            }
          >
            {item.priority}
          </span>
          <span className="text-[10.5px] font-bold" style={{ color: c.error }}>
            {item.overdueLabel}
          </span>
        </div>
        <h3 className="text-[13px] font-semibold mb-1" style={{ color: c.onSurface }}>
          {item.title}
        </h3>
        <div
          className="flex items-center gap-1 text-[10.5px] mb-3"
          style={{ color: c.onSurfaceVariant }}
        >
          <Hash size={11} />
          <span>{item.channel.replace("#", "")}</span>
        </div>
      </div>
      <div
        className="flex justify-between items-center pt-2.5 border-t"
        style={{ borderColor: c.outline }}
      >
        <div className="flex items-center gap-1.5">
          <Avatar initials={item.ownerInitials} size={22} />
          <span className="text-[10.5px]">{item.owner}</span>
        </div>
        <button
          className="w-6 h-6 rounded-full grid place-items-center hover:bg-[#ebe7e8] border"
          style={{ borderColor: c.outline, color: c.onSurfaceVariant }}
        >
          <MoreHorizontal size={13} />
        </button>
      </div>
    </div>
  );
}

function TaskRow({ item, onToggle }: { item: Commitment; onToggle: () => void }) {
  const done = item.status === "done";
  return (
    <div
      className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:-translate-y-0.5 transition-transform"
      style={{ background: done ? c.surfaceLow : "#fff", borderColor: c.outline }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggle}
          className="w-5 h-5 rounded border-2 grid place-items-center shrink-0"
          style={{
            borderColor: done ? c.secondary : c.outline,
            background: done ? c.secondary : "transparent",
          }}
        >
          {done && <Check size={11} color="#fff" strokeWidth={3} />}
        </button>
        <div className="min-w-0">
          <h4
            className="text-[12.5px] font-semibold truncate"
            style={{ color: c.onSurface, textDecoration: done ? "line-through" : "none" }}
          >
            {item.title}
          </h4>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[10.5px]"
            style={{ color: c.onSurfaceVariant }}
          >
            <span className="flex items-center gap-0.5">
              <Hash size={11} /> {item.channel.replace("#", "")}
            </span>
            {item.date && (
              <span className="flex items-center gap-0.5">
                <Calendar size={11} /> {item.date}
              </span>
            )}
            {item.priority === "Slack Extraction" && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                style={{ background: c.surfaceMid }}
              >
                Slack Extraction
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <Avatar initials={item.ownerInitials} size={26} />
          <div className="text-right hidden xl:block">
            <p className="text-[10.5px] font-semibold">{item.owner}</p>
            <p className="text-[9px]" style={{ color: c.onSurfaceVariant }}>
              Assigned
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
            style={
              done
                ? { background: c.surfaceHigh, color: c.onSurfaceVariant }
                : { background: c.secondaryContainer, color: c.onSecondaryContainer }
            }
          >
            {done ? "Done" : "To Do"}
          </span>
          <button
            className="p-1 rounded hover:bg-[#f1edee]"
            style={{ color: c.onSurfaceVariant }}
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ initials, size = 24 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full grid place-items-center text-white font-bold"
      style={{
        width: size,
        height: size,
        background: c.primary,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initials}
    </div>
  );
}

/* ---------- Placeholder for Digest / Analytics ---------- */
function DigestPlaceholder({ title }: { title: string }) {
  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <h1 className="text-[22px] font-bold mb-1" style={{ color: c.primaryDeep }}>
        {title}
      </h1>
      <p className="text-[12px]" style={{ color: c.onSurfaceVariant }}>
        Coming soon.
      </p>
    </div>
  );
}
