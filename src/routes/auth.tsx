import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicSlackInstallUrl } from "@/lib/slack.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Trelo" },
      { name: "description", content: "Sign in or create your Trelo workspace to turn Slack conversations into answers and action." },
    ],
  }),
  ssr: false,
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const getSlackInstallUrl = useServerFn(getPublicSlackInstallUrl);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slackLoading, setSlackLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName || undefined },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onSlackConnect() {
    setError(null);
    setSlackLoading(true);
    try {
      const { url } = await getSlackInstallUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open Slack");
      setSlackLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#faf7f8" }}>
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-lg" style={{ background: "#000" }}>T</div>
          <div className="font-bold text-[15px]" style={{ color: "#1a0b1a" }}>Trelo</div>
        </Link>

        <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: "#ebe7e8" }}>
          <h1 className="text-lg font-bold mb-1" style={{ color: "#1a0b1a" }}>
            {mode === "signin" ? "Sign in to Trelo" : "Create your Trelo workspace"}
          </h1>
          <p className="text-[12px] mb-5" style={{ color: "#6b5b6b" }}>
            {mode === "signin"
              ? "Welcome back. Access your workspace."
              : "Free during beta. We'll set up your workspace automatically."}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "#1a0b1a" }}>Your name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border text-[13px] outline-none focus:border-black"
                  style={{ borderColor: "#e3dde0" }}
                  placeholder="Ada Lovelace"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] font-semibold block mb-1" style={{ color: "#1a0b1a" }}>Work email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-md border text-[13px] outline-none focus:border-black"
                style={{ borderColor: "#e3dde0" }}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold block mb-1" style={{ color: "#1a0b1a" }}>Password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-md border text-[13px] outline-none focus:border-black"
                style={{ borderColor: "#e3dde0" }}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              />
            </div>

            {error && (
              <div className="text-[12px] rounded-md p-2.5 border" style={{ color: "#7f1d1d", background: "#fef2f2", borderColor: "#fecaca" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md text-[12.5px] font-semibold text-white disabled:opacity-60"
              style={{ background: "#000" }}
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create workspace"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t text-center text-[12px]" style={{ borderColor: "#f0ecee", color: "#6b5b6b" }}>
            {mode === "signin" ? (
              <>Don't have an account?{" "}
                <button className="font-semibold underline" style={{ color: "#000" }} onClick={() => { setMode("signup"); setError(null); }}>Sign up</button>
              </>
            ) : (
              <>Already have one?{" "}
                <button className="font-semibold underline" style={{ color: "#000" }} onClick={() => { setMode("signin"); setError(null); }}>Sign in</button>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSlackConnect}
          disabled={slackLoading}
          className="mt-4 h-10 w-full rounded-md border bg-white text-[12.5px] font-semibold disabled:cursor-wait disabled:opacity-70"
          style={{ borderColor: "#e3dde0", color: "#1a0b1a" }}
        >
          {slackLoading ? "Opening Slack…" : "Continue with Slack"}
        </button>
      </div>
    </div>
  );
}
