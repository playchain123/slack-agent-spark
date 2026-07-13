import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { getSlackInstallUrl, syncSlackMessages } from "@/lib/slack.functions";
import {
  getDashboardMetrics,
  listSlackChannels,
  listChannelMessages,
  listCommitments,
  toggleCommitment,
  deleteCommitment,
  createCommitment,
  acceptCommitmentSuggestion,
  generateCommitmentSuggestions,
  listDigestEvents,
  generateDigest,
  askTrelo,
  listRecentAnswers,
  searchMessages,
} from "@/lib/trelo.functions";
import { useLogout } from "@/lib/use-logout";
import {
  LogOut, Slack, LayoutDashboard, MessageSquare, CheckSquare, Newspaper,
  Search, Bell, HelpCircle, Plus, Sparkles, PanelLeftClose, PanelLeftOpen,
  Inbox, Send, ExternalLink, Trash2, Loader2, RefreshCw, MessageCircle,
  Hash, ChevronDown, ChevronRight, ListPlus, Check, Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const workspaceQuery = queryOptions({
  queryKey: ["workspace"],
  queryFn: () => getMyWorkspace(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Trelo — Command Center" },
      { name: "description", content: "Trelo: AI answers, commitments, and daily digests from your team's Slack." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(workspaceQuery); },
  component: Dashboard,
});

const c = {
  bg: "#fdf8f9", surface: "#fdf8f9", surfaceLow: "#f7f2f3", surfaceMid: "#f1edee",
  surfaceHigh: "#ebe7e8", outline: "#d2c2cd", primaryContainer: "#ececec",
  onSurface: "#1c1b1c", onSurfaceVariant: "#4f434c",
};

type View = "dashboard" | "ask" | "commitments" | "digest";

type SlackChannelRow = {
  id: string;
  name: string | null;
  slack_channel_id: string;
  messageCount?: number;
  latestMessage?: { text?: string; slack_user_name?: string | null; created_at?: string; permalink?: string | null } | null;
};

function TreloLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-lg grid place-items-center text-white font-black"
      style={{ width: size, height: size, background: "#000",
        fontSize: Math.round(size * 0.58), fontFamily: "'Inter', ui-sans-serif, system-ui",
        letterSpacing: "-0.05em", lineHeight: 1 }}>T</div>
  );
}

function Dashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);
  const logout = useLogout();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(workspaceQuery);
  const syncFn = useServerFn(syncSlackMessages);
  const syncMutation = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace"] });
      qc.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      qc.invalidateQueries({ queryKey: ["answers"] });
    },
  });
  const workspaceName = data.workspace?.name ?? "Your workspace";
  const isConnected = Boolean(data.installation);
  const messageCount = data.slackStats?.messages ?? 0;
  const width = collapsed ? 64 : 240;

  useEffect(() => {
    if (!isConnected || autoSyncAttempted || messageCount > 0) return;
    setAutoSyncAttempted(true);
    syncMutation.mutate();
  }, [autoSyncAttempted, isConnected, messageCount, syncMutation]);

  return (
    <div className="min-h-screen" style={{ background: c.bg, color: c.onSurface, fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <Sidebar view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed}
        workspaceName={workspaceName} onLogout={logout} />
      <main className="min-h-screen flex flex-col transition-[margin-left] duration-200" style={{ marginLeft: width }}>
        <TopBar collapsed={collapsed} setCollapsed={setCollapsed} onLogout={logout}
          userEmail={data.profile?.email ?? undefined} userName={data.profile?.full_name ?? undefined} />
        <div className="flex-1">
          {!isConnected && <ConnectSlackBanner />}
          {isConnected && (
            <SlackSyncBanner
              channels={data.slackStats?.channels ?? 0}
              messages={messageCount}
              syncing={syncMutation.isPending}
              error={syncMutation.error instanceof Error ? syncMutation.error.message : null}
              result={syncMutation.data}
              onSync={() => syncMutation.mutate()}
            />
          )}
          {view === "dashboard" && <DashboardView isConnected={isConnected} setView={setView} />}
          {view === "ask" && <AskView isConnected={isConnected} />}
          {view === "commitments" && <CommitmentsView isConnected={isConnected} />}
          {view === "digest" && <DigestView isConnected={isConnected} />}
        </div>
      </main>
    </div>
  );
}

function SlackSyncBanner({ channels, messages, syncing, error, result, onSync }: {
  channels: number;
  messages: number;
  syncing: boolean;
  error: string | null;
  result?: { messagesSynced?: number; channelsSynced?: number; errors?: string[] };
  onSync: () => void;
}) {
  const needsSync = messages === 0;
  const text = error
    ? error
    : syncing
      ? "Syncing recent Slack channels and messages into Trelo…"
      : result
        ? `Slack synced: ${result.messagesSynced ?? 0} recent messages across ${result.channelsSynced ?? channels} channels.`
        : `${messages.toLocaleString()} Slack messages indexed across ${channels.toLocaleString()} channels. Re-sync to refresh message links.`;

  void needsSync;


  return (
    <div className="mx-6 mt-4 rounded-xl border p-4 flex items-center gap-4" style={{ background: error ? "#fef2f2" : "#eff6ff", borderColor: error ? "#fecaca" : "#bfdbfe" }}>
      <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: error ? "#fee2e2" : "#dbeafe" }}>
        {syncing ? <Loader2 size={19} className="animate-spin" color={error ? "#991b1b" : "#1d4ed8"} /> : <Slack size={19} color={error ? "#991b1b" : "#1d4ed8"} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold" style={{ color: error ? "#991b1b" : "#1e3a8a" }}>Slack is connected</div>
        <div className="text-[11.5px] mt-0.5" style={{ color: error ? "#991b1b" : "#1d4ed8" }}>{text}</div>
        {result?.errors && result.errors.length > 0 && (
          <div className="text-[10.5px] mt-1" style={{ color: "#1d4ed8" }}>{result.errors.slice(0, 2).join(" • ")}</div>
        )}
      </div>
      <button onClick={onSync} disabled={syncing}
        className="h-9 px-3.5 rounded-md text-[12px] font-semibold text-white disabled:opacity-60" style={{ background: "#000" }}>
        {syncing ? "Syncing…" : "Sync now"}
      </button>
    </div>
  );
}

/* ---------- Connect Slack ---------- */
function ConnectSlackBanner() {
  const installFn = useServerFn(getSlackInstallUrl);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function onConnect() {
    setErr(null); setLoading(true);
    try { const { url } = await installFn(); window.location.href = url; }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setLoading(false); }
  }
  return (
    <div className="mx-6 mt-4 rounded-xl border p-4 flex items-center gap-4" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
      <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "#fef3c7" }}>
        <Slack size={20} color="#92400e" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold" style={{ color: "#78350f" }}>Connect your Slack workspace to start using Trelo</div>
        <div className="text-[11.5px] mt-0.5" style={{ color: "#92400e" }}>
          {err ?? "Install the Trelo Slack app to unlock real answers, commitments, and daily digests."}
        </div>
      </div>
      <button onClick={onConnect} disabled={loading}
        className="h-9 px-3.5 rounded-md text-[12px] font-semibold text-white disabled:opacity-60" style={{ background: "#000" }}>
        {loading ? "Redirecting…" : "Connect Slack"}
      </button>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({ view, setView, collapsed, setCollapsed, workspaceName, onLogout }: {
  view: View; setView: (v: View) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
  workspaceName: string; onLogout: () => void | Promise<void>;
}) {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "ask", label: "Ask Trelo", icon: <MessageSquare size={16} /> },
    { id: "commitments", label: "Commitments", icon: <CheckSquare size={16} /> },
    { id: "digest", label: "Activity Digest", icon: <Newspaper size={16} /> },
  ];
  const width = collapsed ? 64 : 240;
  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col p-3 z-50 border-r transition-[width] duration-200"
      style={{ background: c.surfaceLow, borderColor: c.outline, width }}>
      <Link to="/" className={`flex items-center gap-2.5 mb-5 ${collapsed ? "justify-center px-0" : "px-2"}`}>
        <TreloLogo size={32} />
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="text-[13px] font-bold truncate">Trelo</div>
            <div className="text-[9px] uppercase tracking-widest truncate" style={{ color: c.onSurfaceVariant }} title={workspaceName}>{workspaceName}</div>
          </div>
        )}
      </Link>
      <button onClick={() => setView("ask")}
        className={`flex items-center ${collapsed ? "justify-center" : "justify-center gap-1.5"} rounded-lg py-2 mb-4 text-[11px] font-semibold text-white hover:opacity-90`}
        style={{ background: "#000" }} title="Ask Trelo">
        <Plus size={13} strokeWidth={2.4} />
        {!collapsed && "New Question"}
      </button>
      <nav className="flex-1 space-y-0.5">
        {items.map((it) => {
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => setView(it.id)} title={it.label}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2"} px-2.5 py-2 rounded-md text-[11.5px] font-medium transition-colors`}
              style={active ? { background: c.primaryContainer, color: "#000" } : { color: "#000" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = c.surfaceHigh; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              {it.icon}
              {!collapsed && <span>{it.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="mt-3 pt-3 border-t space-y-0.5" style={{ borderColor: c.outline }}>
        <button onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2 px-2.5"} py-2 rounded-md text-[11px] font-medium hover:bg-[#ebe7e8]`}
          title={collapsed ? "Open sidebar" : "Close sidebar"}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span>Close sidebar</span>}
        </button>
        <button onClick={() => { void onLogout(); }}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2 px-2.5"} py-2 rounded-md text-[11px] font-medium hover:bg-[#ebe7e8]`}
          title="Log out">
          <LogOut size={16} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ---------- TopBar ---------- */
function TopBar({ collapsed, setCollapsed, onLogout, userEmail, userName }: {
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  onLogout: () => void | Promise<void>; userEmail?: string; userName?: string;
}) {
  const [q, setQ] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const search = useServerFn(searchMessages);
  const searchQuery = useQuery({
    queryKey: ["search", q],
    queryFn: () => search({ data: { q } }),
    enabled: q.trim().length >= 2,
  });

  const initials = (userName || userEmail || "U").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b"
      style={{ background: c.surface, borderColor: c.outline }}>
      <div className="flex items-center gap-2 flex-1 max-w-xl relative">
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="p-1.5 rounded-md hover:bg-[#f1edee]" title="Open sidebar">
            <PanelLeftOpen size={16} />
          </button>
        )}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search Slack messages…"
            className="w-full rounded-full pl-9 pr-4 py-1.5 text-[12px] outline-none focus:ring-2"
            style={{ background: c.surfaceLow, color: c.onSurface }} />
          {q.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-white shadow-lg max-h-96 overflow-auto z-50" style={{ borderColor: c.outline }}>
              {searchQuery.isLoading && <div className="p-3 text-[11px] text-gray-500">Searching…</div>}
              {searchQuery.data && searchQuery.data.length === 0 && <div className="p-3 text-[11px] text-gray-500">No matches.</div>}
              {searchQuery.data?.map((m: any) => (
                <a key={m.id} href={m.permalink ?? "#"} target="_blank" rel="noreferrer"
                  className="block px-3 py-2 hover:bg-gray-50 border-b last:border-0" style={{ borderColor: c.surfaceMid }}>
                  <div className="text-[11px] font-semibold">{m.slack_user_name ?? "user"}</div>
                  <div className="text-[11.5px] text-gray-700 line-clamp-2">{m.text}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4 relative">
        <button className="p-1.5 rounded-full hover:bg-[#f1edee]"><Bell size={15} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#f1edee]"><HelpCircle size={15} /></button>
        <button onClick={() => setOpenMenu(!openMenu)}
          className="ml-1 w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold text-white"
          style={{ background: "#000" }} title={userEmail}>{initials}</button>
        {openMenu && (
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-white shadow-lg py-1 z-50" style={{ borderColor: c.outline }}>
            <div className="px-3 py-2 border-b" style={{ borderColor: c.surfaceMid }}>
              <div className="text-[12px] font-semibold truncate">{userName ?? "Signed in"}</div>
              <div className="text-[10.5px] text-gray-500 truncate">{userEmail}</div>
            </div>
            <button onClick={() => { setOpenMenu(false); void onLogout(); }}
              className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 flex items-center gap-2">
              <LogOut size={13} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- Dashboard View ---------- */
function DashboardView({ isConnected, setView }: { isConnected: boolean; setView: (v: View) => void }) {
  const metricsQuery = useQuery({ queryKey: ["dashboardMetrics"], queryFn: () => getDashboardMetrics(), enabled: isConnected });
  const digestQuery = useQuery({ queryKey: ["digest"], queryFn: () => listDigestEvents(), enabled: isConnected });
  const commitmentsQuery = useQuery({ queryKey: ["commitments"], queryFn: () => listCommitments(), enabled: isConnected });
  const [openDigest, setOpenDigest] = useState<any | null>(null);
  const [openCommit, setOpenCommit] = useState<any | null>(null);
  const m = metricsQuery.data;
  const digests = digestQuery.data ?? [];
  const priority = (commitmentsQuery.data ?? []).filter((c: any) => c.status === "pending").slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const threadsIndexed = (m?.messages7d ?? 0);
  const activeCommit = (m?.openCommitments ?? 0);
  const answersProvided = m?.channels?.length ?? 0;
  const timeSaved = Math.max(0, Math.round(threadsIndexed * 0.15));

  if (!isConnected) {
    return (
      <div className="p-6 max-w-[1440px] mx-auto">
        <div className="rounded-xl border p-10 flex flex-col items-center text-center" style={{ background: "#fff", borderColor: c.outline }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center mb-3" style={{ background: c.surfaceMid }}><Sparkles size={20} /></div>
          <h3 className="text-[15px] font-semibold">Nothing to show yet</h3>
          <p className="text-[12px] mt-1 max-w-md" style={{ color: c.onSurfaceVariant }}>Connect Slack above to fill this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <section className="mb-6">
        <h2 className="text-[26px] font-black leading-tight tracking-tight">{greeting}</h2>
        <p className="mt-1 text-[13px] max-w-3xl" style={{ color: c.onSurfaceVariant }}>
          Trelo has analyzed <b>{m?.messages24h ?? 0} new Slack threads</b> since you last checked. Review the daily digest below and act on your priority commitments.
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <BigTile label="Threads Indexed" value={threadsIndexed.toLocaleString()} icon={<Hash size={14} />} />
        <BigTile label="Active Commitments" value={activeCommit} icon={<CheckSquare size={14} />} onClick={() => setView("commitments")} />
        <BigTile label="Answers Provided" value={answersProvided} icon={<MessageCircle size={14} />} onClick={() => setView("ask")} />
        <BigTile label="Time Saved" value={`${timeSaved} hrs`} highlight icon={<Sparkles size={14} />} />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <section className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold">Daily Activity Digest</h3>
            <button onClick={() => setView("digest")} className="text-[11px] font-semibold underline">View all threads ↗</button>
          </div>
          {digests.length === 0 ? (
            <EmptyLine text="No digest yet. Open Activity Digest to generate one." />
          ) : (
            <div className="space-y-3">
              {digests.slice(0, 4).map((d: any) => (
                <button key={d.id} onClick={() => setOpenDigest(d)}
                  className="w-full text-left rounded-lg border p-3 hover:shadow-sm transition-shadow" style={{ borderColor: c.surfaceMid, background: "#fafafa" }}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded" style={{ background: "#000", color: "#fff" }}>#{d.channel_name ?? "channel"}</span>
                    <span className="text-[10.5px] text-gray-500">{formatDistanceToNow(new Date(d.occurred_at), { addSuffix: true })}</span>
                  </div>
                  <div className="text-[12.5px] whitespace-pre-wrap leading-relaxed line-clamp-4">{d.summary}</div>
                  <div className="text-[10.5px] text-gray-500 mt-2 font-semibold">Click to read full digest →</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} />
              <h3 className="text-[13px] font-bold">Quick Ask</h3>
            </div>
            <p className="text-[11.5px] mb-3" style={{ color: c.onSurfaceVariant }}>Ask anything about your team's conversations.</p>
            <button onClick={() => setView("ask")} className="w-full h-9 rounded-lg text-[12px] font-semibold text-white" style={{ background: "#000" }}>
              Ask Trelo →
            </button>
          </div>
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold flex items-center gap-2"><CheckSquare size={14} /> Priority Commitments</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#000", color: "#fff" }}>{priority.length}</span>
            </div>
            {priority.length === 0 ? (
              <EmptyLine text="No pending commitments." />
            ) : (
              <ul className="space-y-2">
                {priority.map((p: any) => (
                  <li key={p.id}>
                    <button onClick={() => setOpenCommit(p)} className="w-full text-left flex items-start gap-2 text-[12px] hover:bg-gray-50 rounded p-1 -m-1">
                      <div className="mt-1 w-3.5 h-3.5 rounded border shrink-0" style={{ borderColor: c.outline }} />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{p.title}</div>
                        <div className="text-[10.5px] text-gray-500 flex gap-2 mt-0.5">
                          {p.due_date && <span>📅 {p.due_date}</span>}
                          {p.channel_name && <span>#{p.channel_name}</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setView("commitments")} className="mt-3 w-full h-8 rounded-md text-[11px] font-semibold border" style={{ borderColor: c.outline }}>
              View all commitments
            </button>
          </div>
        </aside>
      </div>
      <DigestDetailModal digest={openDigest} onClose={() => setOpenDigest(null)} />
      <CommitmentDetailModal item={openCommit} onClose={() => setOpenCommit(null)} />
    </div>
  );
}




function BigTile({ label, value, icon, onClick, highlight }: { label: string; value: number | string; icon?: React.ReactNode; onClick?: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className="text-left rounded-lg border px-3 py-2.5 disabled:cursor-default hover:shadow-sm transition-shadow"
      style={{ borderColor: c.outline, background: highlight ? "#000" : "#fff", color: highlight ? "#fff" : c.onSurface }}>
      <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wider font-semibold" style={{ opacity: highlight ? 0.8 : 0.6 }}>
        {icon} {label}
      </div>
      <div className="text-[18px] font-black mt-1 leading-none">{value}</div>
    </button>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="text-[11.5px]" style={{ color: c.onSurfaceVariant }}>{text}</div>;
}

/* ---------- Detail Modal ---------- */
function DetailModal({ open, onClose, title, subtitle, children, footer }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] rounded-xl bg-white flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-5 border-b" style={{ borderColor: c.surfaceMid }}>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold break-words">{title}</div>
            {subtitle && <div className="text-[11.5px] text-gray-500 mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-[20px] leading-none px-1">×</button>
        </div>
        <div className="flex-1 overflow-auto p-5 text-[13px] leading-relaxed">{children}</div>
        {footer && <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: c.surfaceMid }}>{footer}</div>}
      </div>
    </div>
  );
}

function DigestDetailModal({ digest, onClose }: { digest: any | null; onClose: () => void }) {
  return (
    <DetailModal
      open={Boolean(digest)}
      onClose={onClose}
      title={digest ? `#${digest.channel_name ?? "channel"}` : ""}
      subtitle={digest ? formatDistanceToNow(new Date(digest.occurred_at), { addSuffix: true }) : ""}
      footer={
        <a href={digest?.permalink ?? "https://slack.com"} target="_blank" rel="noreferrer"
          className="h-9 px-3 rounded-md text-[12px] font-semibold text-white flex items-center gap-1.5" style={{ background: "#000" }}>
          View in Slack <ExternalLink size={12} />
        </a>
      }>
      <div className="whitespace-pre-wrap">{digest?.summary}</div>
    </DetailModal>
  );
}

function AnswerDetailModal({ item, onClose }: { item: any | null; onClose: () => void }) {
  const sources = item?.sources ?? [];
  return (
    <DetailModal
      open={Boolean(item)}
      onClose={onClose}
      title={item?.question ?? ""}
      subtitle={item?.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : undefined}>
      <div className="whitespace-pre-wrap mb-4">{item?.answer_md ?? item?.answer}</div>
      {sources.length > 0 && (
        <div className="pt-3 border-t" style={{ borderColor: c.surfaceMid }}>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">{sources.length} source{sources.length === 1 ? "" : "s"}</div>
          <div className="space-y-2">
            {sources.map((s: any, i: number) => (
              <a key={i} href={s.permalink ?? "#"} target="_blank" rel="noreferrer"
                className="block text-[12px] hover:underline p-2 rounded border" style={{ borderColor: c.surfaceMid }}>
                <span className="text-gray-400">[{s.index ?? i + 1}]</span>{" "}
                <span className="font-semibold">#{s.channel ?? "channel"}</span> — <span className="text-gray-600">{s.text}</span>
                {s.permalink && <ExternalLink size={11} className="inline ml-1" />}
              </a>
            ))}
          </div>
        </div>
      )}
    </DetailModal>
  );
}

function CommitmentDetailModal({ item, onClose, onAccept, onToggle, onDelete }: {
  item: any | null; onClose: () => void;
  onAccept?: (id: string) => void; onToggle?: (id: string, done: boolean) => void; onDelete?: (id: string) => void;
}) {
  if (!item) return null;
  return (
    <DetailModal
      open
      onClose={onClose}
      title={item.title}
      subtitle={`Status: ${item.status}${item.channel_name ? ` • #${item.channel_name}` : ""}`}
      footer={
        <>
          {item.source_permalink && (
            <a href={item.source_permalink} target="_blank" rel="noreferrer"
              className="h-9 px-3 rounded-md text-[12px] font-semibold border flex items-center gap-1.5" style={{ borderColor: c.outline }}>
              Open in Slack <ExternalLink size={12} />
            </a>
          )}
          {item.status === "suggested" && onAccept && (
            <button onClick={() => { onAccept(item.id); onClose(); }}
              className="h-9 px-3 rounded-md text-[12px] font-semibold text-white flex items-center gap-1.5" style={{ background: "#000" }}>
              <Check size={12} /> Add to commitments
            </button>
          )}
          {item.status === "pending" && onToggle && (
            <button onClick={() => { onToggle(item.id, true); onClose(); }}
              className="h-9 px-3 rounded-md text-[12px] font-semibold text-white" style={{ background: "#000" }}>
              Mark done
            </button>
          )}
          {onDelete && (
            <button onClick={() => { onDelete(item.id); onClose(); }}
              className="h-9 px-3 rounded-md text-[12px] font-semibold border text-red-600" style={{ borderColor: c.outline }}>
              Delete
            </button>
          )}
        </>
      }>
      <div className="space-y-3">
        {item.description && <div className="whitespace-pre-wrap">{item.description}</div>}
        {item.source_text && (
          <div className="rounded-lg border p-3 bg-gray-50" style={{ borderColor: c.surfaceMid }}>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Source message</div>
            <div className="text-[12.5px] whitespace-pre-wrap">{item.source_text}</div>
          </div>
        )}
        <dl className="grid grid-cols-2 gap-2 text-[12px]">
          {item.due_date && (<><dt className="text-gray-500">Due</dt><dd>{item.due_date}</dd></>)}
          {item.owner_name && (<><dt className="text-gray-500">Owner</dt><dd>{item.owner_name}</dd></>)}
          {item.channel_name && (<><dt className="text-gray-500">Channel</dt><dd>#{item.channel_name}</dd></>)}
          {item.created_at && (<><dt className="text-gray-500">Created</dt><dd>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</dd></>)}
        </dl>
      </div>
    </DetailModal>
  );
}

/* ---------- Ask Trelo ---------- */
const EXAMPLES = [
  "What's the status of the latest deployment?",
  "Any blockers reported today?",
  "Who is working on the payment integration?",
  "Summarize decisions from this week",
];

function AskView({ isConnected }: { isConnected: boolean }) {
  const qc = useQueryClient();
  const askFn = useServerFn(askTrelo);
  const listAnswersFn = useServerFn(listRecentAnswers);
  const [input, setInput] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [openAnswer, setOpenAnswer] = useState<any | null>(null);

  const historyQuery = useQuery({
    queryKey: ["answers", "all"],
    queryFn: () => listAnswersFn({ data: {} }),
    enabled: isConnected,
  });

  const mutation = useMutation({
    mutationFn: (question: string) => { setLastQuestion(question); return askFn({ data: { question } }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["answers"] }); setInput(""); },
  });

  const answers = historyQuery.data ?? [];
  const trending = answers.slice(0, 3);

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="min-w-0">
          <div className="text-center pt-4 pb-6">
            <h2 className="text-[28px] font-black tracking-tight">How can I help you today?</h2>
            <p className="text-[13px] mt-2" style={{ color: c.onSurfaceVariant }}>
              Access your team's collective intelligence across every Slack conversation.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) mutation.mutate(input.trim()); }}
            className="max-w-2xl mx-auto">
            <div className="flex gap-2 rounded-full border bg-white p-1.5 shadow-sm" style={{ borderColor: c.outline }}>
              <div className="pl-3 grid place-items-center"><Sparkles size={16} /></div>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={isConnected ? "Ask anything your team has discussed in Slack…" : "Connect Slack first…"}
                disabled={!isConnected || mutation.isPending}
                className="flex-1 bg-transparent px-2 py-2 text-[13.5px] outline-none" />
              <button type="submit" disabled={!isConnected || mutation.isPending || !input.trim()}
                className="h-10 px-5 rounded-full text-[12.5px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: "#000" }}>
                {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              <span className="text-[11px] text-gray-500 self-center">Try asking:</span>
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" onClick={() => setInput(ex)}
                  className="text-[11.5px] px-2.5 py-1 rounded-full border hover:bg-gray-50" style={{ borderColor: c.outline }}>
                  "{ex}"
                </button>
              ))}
            </div>
          </form>

          {mutation.isError && (
            <div className="mt-6 rounded-lg border p-3 text-[12px] max-w-2xl mx-auto" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
              {(mutation.error as Error)?.message ?? "Something went wrong."}
            </div>
          )}

          {mutation.data && (
            <div className="mt-6 max-w-3xl mx-auto">
              <AnswerCard question={lastQuestion || "Your question"} answer={mutation.data.answer} sources={mutation.data.sources} />
            </div>
          )}

          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold">Recent Answers</h3>
              <span className="text-[11px] text-gray-500">Across all channels</span>
            </div>
            {historyQuery.isLoading && <div className="text-[12px] text-gray-500">Loading…</div>}
            {!historyQuery.isLoading && answers.length === 0 && (
              <div className="rounded-xl border bg-white p-6 text-[12px] text-center" style={{ color: c.onSurfaceVariant, borderColor: c.outline }}>
                No questions asked yet. Try one of the examples above.
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              {answers.map((a: any) => (
                <button key={a.id} onClick={() => setOpenAnswer(a)} className="text-left">
                  <AnswerCard question={a.question} answer={a.answer_md} sources={a.sources ?? []} timestamp={a.created_at} compact />
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
            <h3 className="text-[13px] font-bold mb-3 flex items-center gap-2">📈 Trending Now</h3>
            {trending.length === 0 ? (
              <div className="text-[11.5px] text-gray-500">No recent questions yet.</div>
            ) : (
              <ul className="space-y-3">
                {trending.map((t: any) => (
                  <li key={t.id}>
                    <button onClick={() => setOpenAnswer(t)} className="w-full text-left hover:bg-gray-50 rounded p-1 -m-1">
                      <div className="text-[10.5px] uppercase tracking-wider font-semibold text-gray-500">Recent</div>
                      <div className="text-[12px] font-semibold line-clamp-2 mt-0.5">{t.question}</div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: c.outline, background: "#000", color: "#fff" }}>
            <div className="flex items-center gap-2 mb-1.5"><Sparkles size={14} /><h3 className="text-[13px] font-bold">Power Tip</h3></div>
            <p className="text-[11.5px] opacity-80">Mention <code className="px-1 rounded" style={{ background: "#333" }}>@trelo</code> in any Slack channel to get answers right in the thread.</p>
          </div>
        </aside>
      </div>
      <AnswerDetailModal item={openAnswer} onClose={() => setOpenAnswer(null)} />
    </div>
  );
}

function AnswerCard({ question, answer, sources, timestamp, compact }: { question: string; answer: string; sources: any[]; timestamp?: string; compact?: boolean }) {
  return (
    <div className="rounded-xl border p-4 bg-white" style={{ borderColor: c.outline }}>
      <div className="flex items-start gap-2 mb-2">
        <MessageCircle size={14} className="mt-0.5 text-gray-500 shrink-0" />
        <div className="text-[12.5px] font-semibold">{question}</div>
      </div>
      <div className={`text-[12.5px] whitespace-pre-wrap leading-relaxed ${compact ? "line-clamp-4" : ""}`} style={{ color: c.onSurface }}>{answer}</div>
      {timestamp && <div className="text-[10px] text-gray-400 mt-2">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</div>}
      {sources?.length > 0 && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: c.surfaceMid }}>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">{sources.length} source{sources.length === 1 ? "" : "s"}</div>
          <div className="space-y-1">
            {sources.slice(0, compact ? 2 : 5).map((s: any) => (
              <a key={s.index} href={s.permalink ?? "#"} target="_blank" rel="noreferrer" className="block text-[11px] hover:underline truncate">
                <span className="text-gray-400">[{s.index}]</span> <span className="font-semibold">#{s.channel ?? "channel"}</span> — <span className="text-gray-600">{s.text}</span>
                {s.permalink && <ExternalLink size={10} className="inline ml-1" />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Commitments ---------- */
function CommitmentsView({ isConnected }: { isConnected: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCommitments);
  const toggleFn = useServerFn(toggleCommitment);
  const deleteFn = useServerFn(deleteCommitment);
  const createFn = useServerFn(createCommitment);
  const acceptFn = useServerFn(acceptCommitmentSuggestion);
  const suggestFn = useServerFn(generateCommitmentSuggestions);
  const [newTitle, setNewTitle] = useState("");
  const [completedOpen, setCompletedOpen] = useState(false);
  const [openItem, setOpenItem] = useState<any | null>(null);

  const listQuery = useQuery({ queryKey: ["commitments"], queryFn: () => listFn() });

  const toggle = useMutation({ mutationFn: (v: { id: string; done: boolean }) => toggleFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["commitments"] }) });
  const del = useMutation({ mutationFn: (id: string) => deleteFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["commitments"] }) });
  const create = useMutation({ mutationFn: (title: string) => createFn({ data: { title } }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["commitments"] }); setNewTitle(""); } });
  const accept = useMutation({ mutationFn: (id: string) => acceptFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["commitments"] }) });
  const suggest = useMutation({ mutationFn: () => suggestFn({ data: {} }), onSuccess: () => qc.invalidateQueries({ queryKey: ["commitments"] }) });

  const all = listQuery.data ?? [];
  const now = Date.now();
  const overdue = all.filter((c: any) => c.status === "pending" && c.due_date && new Date(c.due_date).getTime() < now).slice(0, 3);
  const pending = all.filter((c: any) => c.status === "pending" && !overdue.some((o: any) => o.id === c.id));
  const suggested = all.filter((c: any) => c.status === "suggested");
  const done = all.filter((c: any) => c.status === "done");

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-black">Commitments</h2>
          <p className="text-[12.5px]" style={{ color: c.onSurfaceVariant }}>Action items extracted from your Slack conversations by Trelo AI.</p>
        </div>
        <button onClick={() => suggest.mutate()} disabled={!isConnected || suggest.isPending}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: "#000" }}>
          {suggest.isPending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Suggest from Slack
        </button>
      </div>

      {overdue.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full grid place-items-center text-white text-[9px] font-black" style={{ background: "#000" }}>!</span>
            OVERDUE ACTIONS <span className="text-[10px] px-1.5 rounded-full font-bold" style={{ background: "#000", color: "#fff" }}>{overdue.length}</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            {overdue.map((row: any) => (
              <button key={row.id} onClick={() => setOpenItem(row)}
                className="text-left rounded-xl border p-4 bg-white border-l-4 hover:shadow-sm transition-shadow" style={{ borderColor: c.outline, borderLeftColor: "#000" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#000", color: "#fff" }}>OVERDUE</span>
                  <span className="text-[10.5px] text-gray-500">{formatDistanceToNow(new Date(row.due_date), { addSuffix: true })}</span>
                </div>
                <div className="text-[13px] font-bold mb-1">{row.title}</div>
                {row.channel_name && <div className="text-[10.5px] text-gray-500 mb-2">#{row.channel_name}</div>}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: c.surfaceMid }}>
                  <span className="text-[11px] text-gray-600">{row.owner_name ?? "Unassigned"}</span>
                  <span className="text-[10.5px] font-semibold underline">View details</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) create.mutate(newTitle.trim()); }} className="flex gap-2 mb-4">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task manually…"
          className="flex-1 rounded-lg border px-3 py-2 text-[12.5px] outline-none focus:ring-2" style={{ borderColor: c.outline }} />
        <button type="submit" disabled={create.isPending || !newTitle.trim()}
          className="h-10 px-3 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50" style={{ background: "#000" }}>
          <Plus size={14} className="inline" /> Add
        </button>
      </form>

      {suggested.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
            <Sparkles size={12} /> SUGGESTED <span className="text-[10px] px-1.5 rounded-full font-bold border" style={{ borderColor: c.outline }}>{suggested.length}</span>
          </h3>
          <ul className="space-y-2">
            {suggested.map((row: any) => (
              <li key={row.id} className="rounded-lg border p-3 bg-white flex items-start gap-3" style={{ borderColor: c.outline }}>
                <Clock size={13} className="mt-1 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{row.title}</div>
                  <div className="text-[10.5px] text-gray-500 flex flex-wrap gap-x-3 mt-0.5">
                    {row.channel_name && <span>#{row.channel_name}</span>}
                    {row.source_permalink && <a href={row.source_permalink} target="_blank" rel="noreferrer" className="underline">source ↗</a>}
                  </div>
                </div>
                <button onClick={() => accept.mutate(row.id)} className="px-2 py-1 rounded-md text-[11px] font-semibold text-white flex items-center gap-1" style={{ background: "#000" }}>
                  <Check size={12} /> Add
                </button>
                <button onClick={() => del.mutate(row.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
          PENDING COMMITMENTS <span className="text-[10px] px-1.5 rounded-full font-bold border" style={{ borderColor: c.outline }}>{pending.length}</span>
        </h3>
        {listQuery.isLoading && <div className="text-[12px] text-gray-500">Loading…</div>}
        {pending.length === 0 && !listQuery.isLoading && (
          <div className="rounded-xl border p-8 bg-white text-center" style={{ borderColor: c.outline }}>
            <CheckSquare size={24} className="mx-auto text-gray-300 mb-2" />
            <div className="text-[13px] font-semibold">No pending commitments</div>
          </div>
        )}
        <ul className="space-y-2">
          {pending.map((row: any) => (
            <li key={row.id} className="rounded-lg border p-3 bg-white flex items-center gap-3" style={{ borderColor: c.outline }}>
              <input type="checkbox" checked={false} onChange={(e) => toggle.mutate({ id: row.id, done: e.target.checked })} className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{row.title}</div>
                <div className="text-[10.5px] text-gray-500 flex flex-wrap gap-x-3 mt-0.5">
                  {row.channel_name && <span>#{row.channel_name}</span>}
                  {row.due_date && <span>📅 {row.due_date}</span>}
                  {row.owner_name && <span>👤 {row.owner_name}</span>}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded border" style={{ borderColor: c.outline }}>To Do</span>
              {row.source_permalink && (
                <a href={row.source_permalink} target="_blank" rel="noreferrer" className="p-1 text-gray-400 hover:text-black" title="Open in Slack">
                  <ExternalLink size={13} />
                </a>
              )}
              <button onClick={() => del.mutate(row.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <button onClick={() => setCompletedOpen(!completedOpen)} className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
          {completedOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          COMPLETED TASKS ({done.length})
        </button>
        {completedOpen && (
          <ul className="space-y-2">
            {done.map((row: any) => (
              <li key={row.id} className="rounded-lg border p-3 bg-white flex items-center gap-3 opacity-60" style={{ borderColor: c.outline }}>
                <input type="checkbox" checked onChange={(e) => toggle.mutate({ id: row.id, done: e.target.checked })} className="h-4 w-4" />
                <div className="flex-1 min-w-0 text-[12.5px] line-through truncate">{row.title}</div>
                <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: c.surfaceMid }}>Done</span>
                <button onClick={() => del.mutate(row.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------- Digest ---------- */
function DigestView({ isConnected }: { isConnected: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listDigestEvents);
  const genFn = useServerFn(generateDigest);
  const [range, setRange] = useState<"today" | "yesterday" | "week">("today");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const listQuery = useQuery({ queryKey: ["digest"], queryFn: () => listFn() });
  const gen = useMutation({ mutationFn: () => genFn(), onSuccess: () => qc.invalidateQueries({ queryKey: ["digest"] }) });

  const all = listQuery.data ?? [];
  const now = Date.now();
  const filtered = all.filter((d: any) => {
    const t = new Date(d.occurred_at).getTime();
    if (range === "today" && now - t > 24 * 3600 * 1000) return false;
    if (range === "yesterday") {
      const age = now - t;
      if (age < 24 * 3600 * 1000 || age > 48 * 3600 * 1000) return false;
    }
    if (range === "week" && now - t > 7 * 24 * 3600 * 1000) return false;
    if (channelFilter !== "all" && d.channel_name !== channelFilter) return false;
    return true;
  });

  const channelSet = Array.from(new Set(all.map((d: any) => d.channel_name).filter(Boolean))) as string[];
  const participantCount = new Set(all.flatMap((d: any) => (d.summary?.match(/@\w+/g) ?? []))).size;
  const topChannels = channelSet.slice(0, 4).map((name) => ({
    name,
    count: all.filter((d: any) => d.channel_name === name).length,
  }));

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="min-w-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-black">Activity Digest</h2>
              <p className="text-[12.5px]" style={{ color: c.onSurfaceVariant }}>Intelligent summaries of your team's Slack activity.</p>
            </div>
            <button onClick={() => gen.mutate()} disabled={!isConnected || gen.isPending}
              className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: "#000" }}>
              {gen.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Generate now
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex gap-1 rounded-lg border p-0.5 bg-white text-[11px]" style={{ borderColor: c.outline }}>
              {([["today", "Today"], ["yesterday", "Yesterday"], ["week", "Last 7 Days"]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setRange(id)}
                  className="px-3 py-1 rounded-md font-semibold"
                  style={range === id ? { background: "#000", color: "#fff" } : { color: c.onSurface }}>
                  {label}
                </button>
              ))}
            </div>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
              className="h-8 rounded-lg border bg-white px-2 text-[11.5px] outline-none" style={{ borderColor: c.outline }}>
              <option value="all">All Channels</option>
              {channelSet.map((n) => <option key={n} value={n}>#{n}</option>)}
            </select>
          </div>

          {gen.isError && (
            <div className="mb-4 rounded-lg border p-3 text-[12px]" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
              {(gen.error as Error)?.message}
            </div>
          )}

          {listQuery.isLoading && <div className="text-[12px] text-gray-500">Loading…</div>}
          {filtered.length === 0 && !listQuery.isLoading && (
            <div className="rounded-xl border p-8 bg-white text-center" style={{ borderColor: c.outline }}>
              <Newspaper size={24} className="mx-auto text-gray-300 mb-2" />
              <div className="text-[13px] font-semibold">No digests in this range</div>
              <div className="text-[11.5px] text-gray-500 mt-1">
                {isConnected ? "Try 'Last 7 Days' or click Generate now." : "Connect Slack first."}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((d: any) => (
              <article key={d.id} className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded" style={{ background: "#000", color: "#fff" }}>#{d.channel_name}</span>
                    <span className="text-[10.5px] text-gray-500">{formatDistanceToNow(new Date(d.occurred_at), { addSuffix: true })}</span>
                  </div>
                  <a href="https://slack.com" target="_blank" rel="noreferrer" className="text-[11px] font-semibold underline flex items-center gap-1">
                    View in Slack <ExternalLink size={10} />
                  </a>
                </div>
                <div className="text-[12.5px] whitespace-pre-wrap leading-relaxed">{d.summary}</div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
            <h3 className="text-[13px] font-bold mb-3">Key Statistics</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-3" style={{ background: c.surfaceLow }}>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Summarized</div>
                <div className="text-[22px] font-black leading-none mt-1">{all.length}</div>
                <div className="text-[10.5px] text-gray-500 mt-0.5">Threads</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: c.surfaceLow }}>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Participants</div>
                <div className="text-[22px] font-black leading-none mt-1">{Math.max(participantCount, channelSet.length)}</div>
                <div className="text-[10.5px] text-gray-500 mt-0.5">Team Members</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: c.outline }}>
            <h3 className="text-[13px] font-bold mb-3">Team Pulse</h3>
            <div className="text-[10.5px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Top Active Channels</div>
            <ul className="space-y-2">
              {topChannels.map((ch) => (
                <li key={ch.name} className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold">#{ch.name}</span>
                  <span className="text-gray-500 text-[10.5px]">{ch.count} digest{ch.count === 1 ? "" : "s"}</span>
                </li>
              ))}
              {topChannels.length === 0 && <li className="text-[11.5px] text-gray-500">No data yet.</li>}
            </ul>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: c.outline, background: "#000", color: "#fff" }}>
            <h3 className="text-[13px] font-bold mb-1.5">Trelo Insight</h3>
            <p className="text-[11.5px] opacity-80">
              {all.length > 0
                ? `Your team is most active in #${topChannels[0]?.name ?? "your workspace"}. Consider generating a digest to surface decisions and blockers.`
                : "Generate your first digest to see insights."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
