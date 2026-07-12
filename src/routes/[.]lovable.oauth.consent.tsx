import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthNs(): OAuthNs {
  return (supabase.auth as unknown as { oauth: OAuthNs }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthNs().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold mb-2">Authorization error</h1>
        <p className="text-sm text-gray-600">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as any;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const ns = oauthNs();
    const { data, error } = approve
      ? await ns.approveAuthorization(authorization_id)
      : await ns.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message ?? String(error)); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: "#faf7f8" }}>
      <div className="w-full max-w-md bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: "#ebe7e8" }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-lg" style={{ background: "#000" }}>T</div>
          <div className="font-bold text-[15px]" style={{ color: "#1a0b1a" }}>Trelo</div>
        </div>
        <h1 className="text-lg font-bold mb-1" style={{ color: "#1a0b1a" }}>
          Connect {clientName} to Trelo
        </h1>
        <p className="text-[13px] mb-4" style={{ color: "#6b5b6b" }}>
          {clientName} will be able to call Trelo's tools (Ask Trelo, list commitments, get digests) while you are signed in{email ? ` as ${email}` : ""}.
        </p>
        <ul className="text-[12.5px] mb-5 space-y-1" style={{ color: "#3a2b3a" }}>
          <li>• Read your Slack messages indexed in Trelo</li>
          <li>• Read and update your commitments</li>
          <li>• Read your activity digests</li>
        </ul>
        <p className="text-[11.5px] mb-5" style={{ color: "#7a6b7a" }}>
          This does not bypass Trelo's per-workspace permissions.
        </p>
        {error && (
          <div className="text-[12px] rounded-md p-2.5 border mb-3" style={{ color: "#7f1d1d", background: "#fef2f2", borderColor: "#fecaca" }}>
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 h-9 rounded-md border bg-white text-[12.5px] font-semibold disabled:opacity-60"
            style={{ borderColor: "#e3dde0", color: "#1a0b1a" }}
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 h-9 rounded-md text-[12.5px] font-semibold text-white disabled:opacity-60"
            style={{ background: "#000" }}
          >
            {busy ? "Working…" : "Approve"}
          </button>
        </div>
      </div>
    </main>
  );
}
