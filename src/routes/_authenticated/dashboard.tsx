import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { getSlackInstallUrl } from "@/lib/slack.functions";
import { useLogout } from "@/lib/use-logout";
import {
  LogOut,
  Slack,
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Newspaper,
  Search,
  Bell,
  HelpCircle,
  Plus,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Inbox,
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
  onSurface: "#1c1b1c",
  onSurfaceVariant: "#4f434c",
  error: "#ba1a1a",
};

type View = "dashboard" | "ask" | "commitments" | "digest";

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
          {view === "dashboard" && <DashboardView isConnected={isConnected} />}
          {view === "ask" && <EmptyState
            icon={<MessageSquare size={22} />}
            title="Ask Trelo"
            body={isConnected
              ? "Ask questions about your team's Slack conversations. Answers will appear here once Trelo has indexed activity."
              : "Connect your Slack workspace to start asking questions about your team's conversations."}
          />}
          {view === "commitments" && <EmptyState
            icon={<CheckSquare size={22} />}
            title="Commitments"
            body={isConnected
              ? "Trelo will surface commitments and action items detected in Slack threads here."
              : "Connect Slack to automatically extract commitments from your team's conversations."}
          />}
          {view === "digest" && <EmptyState
            icon={<Newspaper size={22} />}
            title="Activity Digest"
            body={isConnected
              ? "Your daily digest of key Slack activity will show up here."
              : "Connect Slack to receive a daily digest of the conversations that matter."}
          />}
        </div>
      </main>
    </div>
  );
}

function ConnectSlackBanner() {
  const installFn = useServerFn(getSlackInstallUrl);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function onConnect() {
    setErr(null);
    setLoading(true);
    try {
      const { url } = await installFn();
      window.location.href = url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to start Slack install");
      setLoading(false);
    }
  }
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
          {err ?? "Install the Trelo Slack app to unlock real answers, commitments, and daily digests from your team's conversations."}
        </div>
      </div>
      <button
        onClick={onConnect}
        disabled={loading}
        className="h-9 px-3.5 rounded-md text-[12px] font-semibold text-white disabled:opacity-60"
        style={{ background: "#000" }}
      >
        {loading ? "Redirecting…" : "Connect Slack"}
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
        <TreloLogo size={32} />
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

      <div className="mt-3 pt-3 border-t space-y-0.5" style={{ borderColor: c.outline }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2 px-2.5"} py-2 rounded-md text-[11px] font-medium hover:bg-[#ebe7e8]`}
          style={{ color: "#000" }}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span>Close sidebar</span>}
        </button>
        <button
          onClick={() => { void onLogout(); }}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2 px-2.5"} py-2 rounded-md text-[11px] font-medium hover:bg-[#ebe7e8]`}
          style={{ color: "#000" }}
          title="Log out"
        >
          <LogOut size={16} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
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
          className="p-1.5 rounded-full hover:bg-[#f1edee]"
          style={{ color: "#000" }}
        >
          <Bell size={15} />
        </button>
        <button className="p-1.5 rounded-full hover:bg-[#f1edee]" style={{ color: "#000" }}>
          <HelpCircle size={15} />
        </button>
      </div>
    </header>
  );
}

/* ---------- Dashboard View ---------- */

function DashboardView({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <section className="mb-6">
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: "#000" }}>
          Welcome to Trelo
        </h2>
        <p className="mt-1 text-[12.5px] max-w-2xl" style={{ color: c.onSurfaceVariant }}>
          {isConnected
            ? "Your workspace is connected. Trelo is indexing your Slack conversations — insights, commitments, and daily digests will start appearing here shortly."
            : "Connect your Slack workspace to unlock answers, commitments, and daily digests from your team's conversations."}
        </p>
      </section>

      <div
        className="rounded-xl border p-10 flex flex-col items-center text-center"
        style={{ background: "#fff", borderColor: c.outline }}
      >
        <div
          className="w-12 h-12 rounded-xl grid place-items-center mb-3"
          style={{ background: c.surfaceMid, color: "#000" }}
        >
          <Sparkles size={20} />
        </div>
        <h3 className="text-[15px] font-semibold" style={{ color: c.onSurface }}>
          {isConnected ? "Nothing to show yet" : "No data yet"}
        </h3>
        <p className="text-[12px] mt-1 max-w-md" style={{ color: c.onSurfaceVariant }}>
          {isConnected
            ? "As your team keeps talking in Slack, Trelo will surface threads, commitments, and daily digests right here."
            : "Once you connect Slack, this dashboard will fill up with your team's live activity."}
        </p>
      </div>
    </div>
  );
}

/* ---------- Empty state for the other views ---------- */

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div
        className="rounded-xl border p-12 flex flex-col items-center text-center"
        style={{ background: "#fff", borderColor: c.outline }}
      >
        <div
          className="w-12 h-12 rounded-xl grid place-items-center mb-3"
          style={{ background: c.surfaceMid, color: "#000" }}
        >
          {icon ?? <Inbox size={20} />}
        </div>
        <h3 className="text-[16px] font-semibold" style={{ color: c.onSurface }}>
          {title}
        </h3>
        <p className="text-[12.5px] mt-1.5 max-w-md" style={{ color: c.onSurfaceVariant }}>
          {body}
        </p>
      </div>
    </div>
  );
}
