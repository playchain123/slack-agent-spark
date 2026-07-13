import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/slack/complete")({
  head: () => ({
    meta: [
      { title: "Connecting Slack — Trelo" },
      { name: "description", content: "Completing Slack sign-in and opening your Trelo dashboard." },
    ],
  }),
  ssr: false,
  component: SlackAuthComplete,
});

function SlackAuthComplete() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function goToDashboard() {
      // Full reload so the _authenticated gate re-reads the fresh session.
      window.location.replace("/dashboard?slack=connected");
    }

    async function waitForSession() {
      // Supabase's detectSessionInUrl parses the tokens in the URL hash
      // (#access_token=...&refresh_token=...) and persists the session.
      // It runs on client init, but may not be finished the instant this
      // effect runs, so we poll briefly and also listen for auth events.
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) return goToDashboard();

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && !cancelled) {
          sub.subscription.unsubscribe();
          goToDashboard();
        }
      });

      // Poll for up to ~8 seconds as a safety net.
      for (let i = 0; i < 40; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 200));
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          sub.subscription.unsubscribe();
          return goToDashboard();
        }
      }

      sub.subscription.unsubscribe();
      if (!cancelled) {
        setError("Sign-in did not complete. Please try again.");
      }
    }

    void waitForSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#faf7f8" }}>
      <div className="w-full max-w-sm rounded-xl border bg-white p-6 text-center shadow-sm" style={{ borderColor: "#ebe7e8" }}>
        <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-lg bg-black text-lg font-black text-white">
          T
        </div>
        <h1 className="text-lg font-bold" style={{ color: "#1a0b1a" }}>
          {error ? "Slack sign-in needs another try" : "Connecting Slack"}
        </h1>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#6b5b6b" }}>
          {error ?? "Finishing your Slack connection and opening your Trelo dashboard."}
        </p>
        {error && (
          <Link
            to="/"
            className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-[12.5px] font-semibold text-white"
          >
            Try again
          </Link>
        )}
      </div>
    </div>
  );
}
