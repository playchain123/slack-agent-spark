import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { getSlackInstallUrl, syncSlackMessages } from "@/lib/slack.functions";
import {
  getDashboardMetrics,
  listCommitments,
  toggleCommitment,
  deleteCommitment,
  createCommitment,
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
  const metricsQuery = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: () => getDashboardMetrics(),
    enabled: isConnected,
  });
  const m = metricsQuery.data;

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <section className="mb-6">
        <h2 className="text-[22px] font-bold leading-tight">Welcome to Trelo</h2>
        <p className="mt-1 text-[12.5px] max-w-2xl" style={{ color: c.onSurfaceVariant }}>
          {isConnected ? "Real-time signal from your Slack workspace." : "Connect your Slack workspace to see live activity."}
        </p>
      </section>

      {!isConnected && (
        <div className="rounded-xl border p-10 flex flex-col items-center text-center" style={{ background: "#fff", borderColor: c.outline }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center mb-3" style={{ background: c.surfaceMid }}><Sparkles size={20} /></div>
          <h3 className="text-[15px] font-semibold">Nothing to show yet</h3>
          <p className="text-[12px] mt-1 max-w-md" style={{ color: c.onSurfaceVariant }}>Connect Slack above to fill this dashboard.</p>
        </div>
      )}

      {isConnected && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Messages (24h)" value={m?.messages24h ?? "—"} />
            <MetricCard label="Messages (7d)" value={m?.messages7d ?? "—"} />
            <MetricCard label="Open commitments" value={m?.openCommitments ?? "—"} onClick={() => setView("commitments")} />
            <MetricCard label="Completed" value={m?.doneCommitments ?? "—"} onClick={() => setView("commitments")} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Active channels">
              {(m?.channels?.length ?? 0) === 0 ? (
                <EmptyLine text="No channels indexed yet. Post in a channel your Trelo bot is in." />
              ) : (
                <ul className="space-y-1.5">
                  {m!.channels.map((ch: any) => (
                    <li key={ch.id} className="text-[12.5px] flex items-center gap-2">
                      <span className="text-gray-400">#</span>{ch.name ?? ch.slack_channel_id}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Latest digest" action={<button onClick={() => setView("digest")} className="text-[11px] font-semibold underline">Open</button>}>
              {(m?.latestDigest?.length ?? 0) === 0 ? (
                <EmptyLine text="No digest generated yet. Open Activity Digest to run one." />
              ) : (
                <ul className="space-y-2">
                  {m!.latestDigest.map((d: any) => (
                    <li key={d.id} className="text-[12px]">
                      <div className="font-semibold text-[11px] uppercase tracking-wide text-gray-500">#{d.channel_name}</div>
                      <div className="line-clamp-3 whitespace-pre-line">{d.summary}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, onClick }: { label: string; value: number | string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className="text-left rounded-xl border p-4 bg-white disabled:cursor-default hover:shadow-sm transition-shadow"
      style={{ borderColor: c.outline }}>
      <div className="text-[10.5px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className="text-[26px] font-bold mt-1 leading-none">{value}</div>
    </button>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 bg-white" style={{ borderColor: c.outline }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold">{title}</h4>
        {action}
      </div>
      {children}
    </div>
  );
}
function EmptyLine({ text }: { text: string }) {
  return <div className="text-[11.5px]" style={{ color: c.onSurfaceVariant }}>{text}</div>;
}

/* ---------- Ask Trelo ---------- */
function AskView({ isConnected }: { isConnected: boolean }) {
  const qc = useQueryClient();
  const askFn = useServerFn(askTrelo);
  const historyQuery = useQuery({ queryKey: ["answers"], queryFn: () => listRecentAnswers(), enabled: isConnected });
  const [input, setInput] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const mutation = useMutation({
    mutationFn: (question: string) => {
      setLastQuestion(question);
      return askFn({ data: { question } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["answers"] }); setInput(""); },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-[20px] font-bold">Ask Trelo</h2>
        <p className="text-[12px]" style={{ color: c.onSurfaceVariant }}>Ask anything about your team's Slack conversations.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) mutation.mutate(input.trim()); }}
        className="flex gap-2 mb-6">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={isConnected ? "e.g. What did we decide about pricing last week?" : "Connect Slack first…"}
          disabled={!isConnected || mutation.isPending}
          className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 disabled:bg-gray-50"
          style={{ borderColor: c.outline }} />
        <button type="submit" disabled={!isConnected || mutation.isPending || !input.trim()}
          className="h-10 px-4 rounded-lg text-[12.5px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: "#000" }}>
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
          Ask
        </button>
      </form>

      {mutation.isError && (
        <div className="mb-4 rounded-lg border p-3 text-[12px]" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
          {(mutation.error as Error)?.message ?? "Something went wrong."}
        </div>
      )}

      {mutation.data && (
        <AnswerCard question={lastQuestion || "Your question"} answer={mutation.data.answer} sources={mutation.data.sources} />
      )}

      <div className="mt-6">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Recent</h3>
        {historyQuery.isLoading && <div className="text-[12px] text-gray-500">Loading…</div>}
        {historyQuery.data && historyQuery.data.length === 0 && (
          <div className="text-[12px]" style={{ color: c.onSurfaceVariant }}>No questions yet.</div>
        )}
        <div className="space-y-3">
          {historyQuery.data?.map((a: any) => (
            <AnswerCard key={a.id} question={a.question} answer={a.answer_md} sources={a.sources ?? []} timestamp={a.created_at} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnswerCard({ question, answer, sources, timestamp }: { question: string; answer: string; sources: any[]; timestamp?: string }) {
  return (
    <div className="rounded-xl border p-4 bg-white" style={{ borderColor: c.outline }}>
      <div className="flex items-start gap-2 mb-2">
        <MessageCircle size={14} className="mt-0.5 text-gray-500" />
        <div className="text-[12.5px] font-semibold">{question}</div>
      </div>
      <div className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: c.onSurface }}>{answer}</div>
      {timestamp && <div className="text-[10px] text-gray-400 mt-2">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</div>}
      {sources?.length > 0 && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: c.surfaceMid }}>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Sources</div>
          <div className="space-y-1">
            {sources.slice(0, 5).map((s: any) => (
              <a key={s.index} href={s.permalink ?? "#"} target="_blank" rel="noreferrer"
                className="block text-[11.5px] hover:underline">
                <span className="text-gray-400">[{s.index}]</span> <span className="font-semibold">#{s.channel ?? "channel"}</span>
                {" — "}<span className="text-gray-600">{s.user}</span>: <span className="text-gray-700">{s.text}</span>
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
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");
  const [newTitle, setNewTitle] = useState("");

  const listQuery = useQuery({ queryKey: ["commitments"], queryFn: () => listFn() });

  const toggle = useMutation({
    mutationFn: (v: { id: string; done: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commitments"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commitments"] }),
  });
  const create = useMutation({
    mutationFn: (title: string) => createFn({ data: { title } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["commitments"] }); setNewTitle(""); },
  });

  const rows = (listQuery.data ?? []).filter((c: any) =>
    filter === "all" ? true : filter === "open" ? c.status === "pending" : c.status === "done"
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold">Commitments</h2>
          <p className="text-[12px]" style={{ color: c.onSurfaceVariant }}>
            {isConnected ? "Action items auto-detected from Slack + tasks you add." : "Connect Slack to auto-extract commitments."}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5 bg-white text-[11px]" style={{ borderColor: c.outline }}>
          {(["open", "done", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-md font-semibold capitalize"
              style={filter === f ? { background: "#000", color: "#fff" } : {}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) create.mutate(newTitle.trim()); }}
        className="flex gap-2 mb-4">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task manually…"
          className="flex-1 rounded-lg border px-3 py-2 text-[12.5px] outline-none focus:ring-2"
          style={{ borderColor: c.outline }} />
        <button type="submit" disabled={create.isPending || !newTitle.trim()}
          className="h-10 px-3 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50" style={{ background: "#000" }}>
          <Plus size={14} className="inline" /> Add
        </button>
      </form>

      {listQuery.isLoading && <div className="text-[12px] text-gray-500">Loading…</div>}
      {rows.length === 0 && !listQuery.isLoading && (
        <div className="rounded-xl border p-8 bg-white text-center" style={{ borderColor: c.outline }}>
          <CheckSquare size={24} className="mx-auto text-gray-300 mb-2" />
          <div className="text-[13px] font-semibold">No {filter === "all" ? "" : filter} commitments</div>
          <div className="text-[11.5px] text-gray-500 mt-1">
            {isConnected ? "Trelo will surface tasks as your team commits to things in Slack." : "Connect Slack to auto-detect."}
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {rows.map((row: any) => (
          <li key={row.id} className="rounded-lg border p-3 bg-white flex items-start gap-3" style={{ borderColor: c.outline }}>
            <input type="checkbox" checked={row.status === "done"}
              onChange={(e) => toggle.mutate({ id: row.id, done: e.target.checked })}
              className="mt-0.5 h-4 w-4" />
            <div className="flex-1 min-w-0">
              <div className={`text-[13px] font-medium ${row.status === "done" ? "line-through text-gray-400" : ""}`}>{row.title}</div>
              <div className="text-[10.5px] text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                {row.owner_name && <span>👤 {row.owner_name}</span>}
                {row.due_date && <span>📅 {row.due_date}</span>}
                {row.channel_name && <span>#{row.channel_name}</span>}
                {row.source_permalink && (
                  <a href={row.source_permalink} target="_blank" rel="noreferrer" className="underline">source ↗</a>
                )}
              </div>
            </div>
            <button onClick={() => del.mutate(row.id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete">
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Digest ---------- */
function DigestView({ isConnected }: { isConnected: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listDigestEvents);
  const genFn = useServerFn(generateDigest);
  const listQuery = useQuery({ queryKey: ["digest"], queryFn: () => listFn() });
  const gen = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digest"] }),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold">Activity Digest</h2>
          <p className="text-[12px]" style={{ color: c.onSurfaceVariant }}>AI summaries of your team's Slack activity.</p>
        </div>
        <button onClick={() => gen.mutate()} disabled={!isConnected || gen.isPending}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: "#000" }}>
          {gen.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Generate now
        </button>
      </div>

      {gen.data && (
        <div className="mb-4 rounded-lg border p-3 text-[12px]" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
          {gen.data.message}
        </div>
      )}
      {gen.isError && (
        <div className="mb-4 rounded-lg border p-3 text-[12px]" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
          {(gen.error as Error)?.message}
        </div>
      )}

      {listQuery.isLoading && <div className="text-[12px] text-gray-500">Loading…</div>}
      {listQuery.data && listQuery.data.length === 0 && !listQuery.isLoading && (
        <div className="rounded-xl border p-8 bg-white text-center" style={{ borderColor: c.outline }}>
          <Newspaper size={24} className="mx-auto text-gray-300 mb-2" />
          <div className="text-[13px] font-semibold">No digests yet</div>
          <div className="text-[11.5px] text-gray-500 mt-1">
            {isConnected ? "Click Generate now to build one from the last 24h of Slack activity." : "Connect Slack first."}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {listQuery.data?.map((d: any) => (
          <div key={d.id} className="rounded-xl border p-4 bg-white" style={{ borderColor: c.outline }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">#{d.channel_name ?? "channel"}</div>
              <div className="text-[10.5px] text-gray-400">{formatDistanceToNow(new Date(d.occurred_at), { addSuffix: true })}</div>
            </div>
            <div className="text-[12.5px] whitespace-pre-wrap leading-relaxed">{d.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
