import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { useLogout } from "@/lib/use-logout";
import { LogOut, Slack } from "lucide-react";

import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Newspaper,
  Search,
  Bell,
  HelpCircle,
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
  ListTodo,
  Check,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
} from "lucide-react";

export const workspaceQuery = queryOptions({
  queryKey: ["workspace"],
  queryFn: () => getMyWorkspace(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Trelo — Command Center" },
      {
        name: "description",
        content:
          "Trelo workspace: dashboard, Ask Trelo, commitments and activity digest from your Slack conversations.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(workspaceQuery);
  },
  component: Dashboard,
});


/* ---------- Design tokens ---------- */
const c = {
  bg: "#fdf8f9",
  surface: "#fdf8f9",
  surfaceLow: "#f7f2f3",
  surfaceMid: "#f1edee",
  surfaceHigh: "#ebe7e8",
  outline: "#d2c2cd",
  primary: "#000000",
  primaryDeep: "#000000",
  primaryContainer: "#ececec",
  onPrimaryContainer: "#000000",
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

type View = "dashboard" | "ask" | "commitments" | "digest";

/* Trelo logo mark — bold "T" on black rounded square */
function TreloLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-lg grid place-items-center text-white font-black"
      style={{
        width: size,
        height: size,
        background: "#000",
        fontSize: Math.round(size * 0.58),
        fontFamily: "'Inter', ui-sans-serif, system-ui",
        letterSpacing: "-0.05em",
        lineHeight: 1,
      }}
    >
      T
    </div>
  );
}

function Dashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const logout = useLogout();
  const { data } = useSuspenseQuery(workspaceQuery);
  const workspaceName = data.workspace?.name ?? "Your workspace";
  const isConnected = Boolean(data.installation);

  const width = collapsed ? 64 : 240;

  return (
    <div
      className="min-h-screen"
      style={{ background: c.bg, color: c.onSurface, fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <Sidebar
        view={view}
        setView={setView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        workspaceName={workspaceName}
        onLogout={logout}
      />
      <main
        className="min-h-screen flex flex-col transition-[margin-left] duration-200"
        style={{ marginLeft: width }}
      >
        <TopBar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1">
          {!isConnected && <ConnectSlackBanner />}
          {view === "dashboard" && <DashboardView setView={setView} />}
          {view === "ask" && <AskTreloView />}
          {view === "commitments" && <CommitmentsView />}
          {view === "digest" && <ActivityDigestView />}
        </div>
      </main>
    </div>
  );
}

function ConnectSlackBanner() {
  return (
    <div className="mx-6 mt-4 rounded-xl border p-4 flex items-center gap-4" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
      <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "#fef3c7" }}>
        <Slack size={20} strokeWidth={2.2} color="#92400e" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold" style={{ color: "#78350f" }}>
          Connect your Slack workspace to start using Trelo
        </div>
        <div className="text-[11.5px] mt-0.5" style={{ color: "#92400e" }}>
          You're seeing sample data. Install the Trelo Slack app to unlock real answers, commitments, and daily digests from your team's conversations.
        </div>
      </div>
      <button
        disabled
        title="Available once your Slack app credentials are added"
        className="h-9 px-3.5 rounded-md text-[12px] font-semibold text-white disabled:opacity-60"
        style={{ background: "#000" }}
      >
        Connect Slack
      </button>
    </div>
  );
}


/* ---------- Sidebar ---------- */

function Sidebar({
  view,
  setView,
  collapsed,
  setCollapsed,
  workspaceName,
  onLogout,
}: {
  view: View;
  setView: (v: View) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  workspaceName: string;
  onLogout: () => void | Promise<void>;
}) {

  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "ask", label: "Ask Trelo", icon: <MessageSquare size={16} /> },
    { id: "commitments", label: "Commitments", icon: <CheckSquare size={16} /> },
    { id: "digest", label: "Activity Digest", icon: <Newspaper size={16} /> },
  ];
  const width = collapsed ? 64 : 240;
  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col p-3 z-50 border-r transition-[width] duration-200"
      style={{ background: c.surfaceLow, borderColor: c.outline, width }}
    >
      <Link
        to="/"
        className={`flex items-center gap-2.5 mb-5 ${collapsed ? "justify-center px-0" : "px-2"}`}
      >
        <TreloLogo size={collapsed ? 32 : 32} />
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="text-[13px] font-bold truncate" style={{ color: c.primaryDeep }}>
              Trelo
            </div>
            <div
              className="text-[9px] uppercase tracking-widest truncate"
              style={{ color: c.onSurfaceVariant }}
              title={workspaceName}
            >
              {workspaceName}
            </div>
          </div>
        )}
      </Link>


      <button
        className={`flex items-center ${collapsed ? "justify-center" : "justify-center gap-1.5"} rounded-lg py-2 mb-4 text-[11px] font-semibold text-white hover:opacity-90`}
        style={{ background: "#000" }}
        title="New Request"
      >
        <Plus size={13} strokeWidth={2.4} />
        {!collapsed && "New Request"}
      </button>

      <nav className="flex-1 space-y-0.5">
        {items.map((it) => {
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              title={it.label}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2"} px-2.5 py-2 rounded-md text-[11.5px] font-medium transition-colors`}
              style={
                active
                  ? { background: c.primaryContainer, color: "#000" }
                  : { color: "#000" }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget.style.background = c.surfaceHigh);
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget.style.background = "transparent");
              }}
            >
              {it.icon}
              {!collapsed && <span>{it.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`mt-3 pt-3 border-t flex items-center ${collapsed ? "justify-center" : "gap-2 px-2.5"} py-2 rounded-md text-[11px] font-medium hover:bg-[#ebe7e8]`}
        style={{ borderColor: c.outline, color: "#000" }}
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        {!collapsed && <span>Close sidebar</span>}
      </button>
    </aside>
  );
}

/* ---------- TopBar ---------- */

function TopBar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return (
    <header
      className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b"
      style={{ background: c.surface, borderColor: c.outline }}
    >
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-md hover:bg-[#f1edee]"
            style={{ color: "#000" }}
            title="Open sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#000" }}
          />
          <input
            placeholder="Search threads, documents, or insights…"
            className="w-full rounded-full pl-9 pr-4 py-1.5 text-[12px] outline-none focus:ring-2"
            style={{ background: c.surfaceLow, color: c.onSurface }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          className="p-1.5 rounded-full hover:bg-[#f1edee] relative"
          style={{ color: "#000" }}
        >
          <Bell size={15} />
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: c.error }}
          />
        </button>
        <button className="p-1.5 rounded-full hover:bg-[#f1edee]" style={{ color: "#000" }}>
          <HelpCircle size={15} />
        </button>
        <div
          className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white"
          style={{ background: "#000" }}
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
      <section className="mb-6">
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: "#000" }}>
          Good morning, Sarah
        </h2>
        <p className="mt-1 text-[12.5px] max-w-2xl" style={{ color: c.onSurfaceVariant }}>
          Trelo has analyzed 14 new Slack threads since you last checked. Your primary focus today is{" "}
          <span className="font-semibold" style={{ color: "#000" }}>
            reviewing the Q3 Product Roadmap
          </span>{" "}
          and resolving 3 engineering bottlenecks.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Metric icon={<Database size={16} />} label="Threads Indexed" value="1,240" />
        <Metric icon={<ClipboardCheck size={16} />} label="Active Commitments" value="12" />
        <Metric icon={<MessagesSquare size={16} />} label="Answers Provided" value="85" />
        <div
          className="p-3.5 rounded-xl flex items-center gap-3"
          style={{ background: "#000", color: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                onClick={() => setView("digest")}
                className="text-[11px] font-semibold flex items-center gap-1 hover:underline"
                style={{ color: "#000" }}
              >
                View all threads <ExternalLink size={11} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <DigestItem
                initials="PD"
                chip="#product-design"
                chipBg={c.primaryContainer}
                chipFg="#000"
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

        <aside className="lg:col-span-4 space-y-4">
          <div
            className="p-5 rounded-xl relative overflow-hidden text-white"
            style={{ background: "#000", boxShadow: "0 8px 24px rgba(0,0,0,.22)" }}
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
                style={{ background: "#fff", color: "#000" }}
              >
                <Send size={12} />
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip>Roadmap status?</Chip>
              <Chip>Budget update?</Chip>
            </div>
          </div>

          <div className="rounded-xl border" style={{ background: "#fff", borderColor: c.outline }}>
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: c.outline }}
            >
              <h3
                className="text-[12px] font-semibold flex items-center gap-1.5"
                style={{ color: c.onSurface }}
              >
                <Flag size={13} style={{ color: "#000" }} /> Priority Commitments
              </h3>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                style={{ background: c.error }}
              >
                3 NEW
              </span>
            </div>
            <div className="p-4 space-y-3">
              <PriorityTask title="Audit navigation UI patterns" due="Due Friday" channel="#product-design" />
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
                style={{ borderColor: c.outline, color: "#000" }}
              >
                View all Commitments (12)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl text-white" style={{ background: "#000" }}>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="p-3.5 rounded-xl border flex items-center gap-3"
      style={{ background: "#fff", borderColor: c.outline }}
    >
      <div
        className="w-10 h-10 rounded-lg grid place-items-center"
        style={{ background: c.surfaceMid, color: "#000" }}
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
            <Sparkles size={13} style={{ color: "#000", marginTop: 2 }} />
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
        <div className="mt-0.5 w-3.5 h-3.5 rounded border-2" style={{ borderColor: "#000" }} />
        <div className="flex-1">
          <p className="text-[12px] font-medium leading-tight" style={{ color: c.onSurface }}>
            {title}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="text-[10.5px] flex items-center gap-0.5"
              style={{
                color: dueUrgent ? c.error : c.onSurfaceVariant,
                fontWeight: dueUrgent ? 600 : 400,
              }}
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

type Answer = {
  id: string;
  tag: string;
  tagBg: string;
  tagFg: string;
  time: string;
  title: string;
  snippet: string;
  channel: string;
  sources: number;
};

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
    tagBg: "#ececec",
    tagFg: "#000",
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
        tagFg: "#000",
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
          <h2 className="text-[26px] font-bold" style={{ color: "#000" }}>
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
            <Sparkles size={18} style={{ color: "#000", marginLeft: 12, marginRight: 8 }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask anything your team has discussed in Slack…"
              className="flex-1 bg-transparent outline-none py-3 text-[13.5px]"
            />
            <button
              className="px-4 py-2.5 rounded-xl text-white font-semibold text-[12px] flex items-center gap-1.5"
              style={{ background: "#000" }}
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
            <h3
              className="text-[15px] font-semibold flex items-center gap-1.5"
              style={{ color: "#000" }}
            >
              <History size={16} style={{ color: "#000" }} /> Recent Answers
            </h3>
            <button className="text-[11px] font-semibold hover:underline" style={{ color: "#000" }}>
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
                  style={{ borderColor: c.surfaceMid, color: "#000" }}
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
            <TrendingUp size={15} style={{ color: "#000" }} />
            <h3 className="text-[13px] font-semibold" style={{ color: "#000" }}>
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
            style={{ background: c.primaryContainer, color: "#000" }}
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-bold" style={{ color: "#000" }}>
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
                  ? { background: "#fff", color: "#000", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }
                  : { color: c.onSurfaceVariant }
              }
            >
              <ListTodo size={12} />
              {m === "list" ? "List" : "Kanban"}
            </button>
          ))}
        </div>
      </div>

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

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2" style={{ color: "#000" }}>
            <ClipboardCheck size={15} style={{ color: "#000" }} />
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Pending Commitments</h2>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: c.primaryContainer, color: "#000" }}
            >
              {todo.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-[#ebe7e8]" style={{ color: "#000" }}>
              <Filter size={13} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-[#ebe7e8]" style={{ color: "#000" }}>
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

      <section>
        <button
          onClick={() => setShowDone((s) => !s)}
          className="flex items-center gap-2 mb-3 hover:opacity-80"
          style={{ color: "#000" }}
        >
          <ChevronDown
            size={15}
            style={{
              transform: showDone ? "rotate(0)" : "rotate(-90deg)",
              transition: "transform .15s",
            }}
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
          style={{ borderColor: c.outline, color: "#000" }}
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
            borderColor: done ? c.secondary : "#000",
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
          <button className="p-1 rounded hover:bg-[#f1edee]" style={{ color: "#000" }}>
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
        background: "#000",
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initials}
    </div>
  );
}

/* ---------- Activity Digest view ---------- */

type DigestEntry = {
  id: string;
  chip: string;
  chipBg: string;
  chipFg: string;
  time: string;
  title: string;
  bullets: string[];
  participants: { initials: string; bg: string }[];
  extra?: number;
  participantsLabel: string;
  accent?: "primary" | "error";
};

const digestSeed: DigestEntry[] = [
  {
    id: "d1",
    chip: "#product-design",
    chipBg: "#c8f5dd",
    chipFg: "#00522f",
    time: "Today at 10:24 AM",
    title: "UI/UX Audit Feedback",
    bullets: [
      "The team agreed to migrate the design system from Material 2 to Material 3 tokens.",
      "Sarah pointed out consistency issues in the mobile navigation bar layout.",
      "Final decision: Design freeze on Friday to prepare for the v2.4 sprint.",
    ],
    participants: [
      { initials: "SC", bg: "#4a154b" },
      { initials: "JM", bg: "#006c46" },
      { initials: "RP", bg: "#5d4200" },
    ],
    extra: 5,
    participantsLabel: "8 participants active in this thread",
    accent: "primary",
  },
  {
    id: "d2",
    chip: "#engineering-sync",
    chipBg: "#ececec",
    chipFg: "#000",
    time: "Today at 8:45 AM",
    title: "Database Migration Update",
    bullets: [
      "Primary migration finished successfully without downtime.",
      "Indexing issues discovered in the activity_log table were resolved by Marcus.",
      "Query performance improved by 40% across the main dashboard components.",
    ],
    participants: [
      { initials: "MK", bg: "#000" },
      { initials: "AL", bg: "#4a154b" },
    ],
    participantsLabel: "4 engineers discussing performance",
    accent: "primary",
  },
  {
    id: "d3",
    chip: "#incident-room",
    chipBg: "#ffdad6",
    chipFg: "#93000a",
    time: "Yesterday at 11:15 PM",
    title: "Latency Spike in API v2",
    bullets: [
      "Reported latency of >2s for all authenticated requests.",
      "Root cause: API rate limiter misconfiguration during deployment.",
      "Resolution: Config rolled back to stable within 12 minutes.",
    ],
    participants: [{ initials: "DR", bg: "#ba1a1a" }],
    participantsLabel: "Emergency thread with 12 participants",
    accent: "error",
  },
];

function ActivityDigestView() {
  const [range, setRange] = useState<"today" | "yesterday" | "week">("today");
  const [channel, setChannel] = useState("all");

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[26px] font-bold" style={{ color: "#000" }}>
          Activity Digest
        </h2>
        <p className="text-[12.5px] mt-1" style={{ color: c.onSurfaceVariant }}>
          Intelligent summary of team coordination and Slack threads from the last 24 hours.
        </p>
      </div>

      {/* Filters bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-xl border"
        style={{ background: "#fff", borderColor: c.outline, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}
      >
        <div className="flex items-center gap-1">
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "week", label: "Last 7 Days" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id as typeof range)}
              className="px-3.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors"
              style={
                range === r.id
                  ? { background: "#000", color: "#fff" }
                  : { color: c.onSurfaceVariant }
              }
              onMouseEnter={(e) => {
                if (range !== r.id) e.currentTarget.style.background = c.surfaceHigh;
              }}
              onMouseLeave={(e) => {
                if (range !== r.id) e.currentTarget.style.background = "transparent";
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-1.5 text-[11.5px] border outline-none"
            style={{ background: c.surfaceLow, borderColor: c.outline, color: "#000" }}
          >
            <option value="all">All Channels</option>
            <option value="pd">#product-design</option>
            <option value="es">#engineering-sync</option>
            <option value="mo">#marketing-ops</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#000" }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        <div
          className="absolute left-2 top-2 bottom-2 w-px"
          style={{ background: c.outline }}
        />
        <div className="space-y-5">
          {digestSeed.map((e) => (
            <DigestCard key={e.id} entry={e} />
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full text-white grid place-items-center hover:scale-105 active:scale-95 transition-transform z-40"
        style={{ background: "#000", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}
        title="New digest entry"
      >
        <FileText size={18} />
      </button>
    </div>
  );
}

function DigestCard({ entry }: { entry: DigestEntry }) {
  const accentColor = entry.accent === "error" ? c.error : "#000";
  return (
    <div className="relative">
      {/* timeline dot */}
      <div
        className="absolute -left-[18px] top-4 w-2.5 h-2.5 rounded-full ring-4"
        style={{ background: accentColor, boxShadow: `0 0 0 3px ${c.bg}` }}
      />
      <div
        className="rounded-xl p-4 border"
        style={{
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(6px)",
          borderColor: c.outline,
          borderLeft: entry.accent === "error" ? `4px solid ${c.error}` : `1px solid ${c.outline}`,
          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
              style={{ background: entry.chipBg, color: entry.chipFg }}
            >
              {entry.chip}
            </span>
            <span className="text-[10.5px]" style={{ color: c.onSurfaceVariant }}>
              {entry.time}
            </span>
          </div>
          <button
            className="text-[11px] font-semibold flex items-center gap-1 hover:underline"
            style={{ color: "#000" }}
          >
            View in Slack <ExternalLink size={11} />
          </button>
        </div>

        <h4 className="text-[14px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "#000" }}>
          {entry.accent === "error" ? (
            <AlertCircle size={14} style={{ color: c.error }} />
          ) : (
            <Sparkles size={14} style={{ color: "#000" }} />
          )}
          {entry.title}
        </h4>

        <ul className="space-y-1.5 mb-4 pl-1">
          {entry.bullets.map((b, i) => (
            <li
              key={i}
              className="text-[12px] leading-relaxed flex gap-2"
              style={{ color: c.onSurface }}
            >
              <span
                className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                style={{ background: accentColor }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div
          className="flex items-center gap-3 pt-3 border-t"
          style={{ borderColor: c.surfaceMid }}
        >
          <div className="flex -space-x-2">
            {entry.participants.map((p, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full grid place-items-center text-[8.5px] font-bold text-white ring-2 ring-white"
                style={{ background: p.bg }}
              >
                {p.initials}
              </div>
            ))}
            {entry.extra && (
              <div
                className="w-6 h-6 rounded-full grid place-items-center text-[8.5px] font-bold ring-2 ring-white"
                style={{ background: c.surfaceHigh, color: c.onSurfaceVariant }}
              >
                +{entry.extra}
              </div>
            )}
          </div>
          <span className="text-[10.5px]" style={{ color: c.onSurfaceVariant }}>
            {entry.participantsLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
