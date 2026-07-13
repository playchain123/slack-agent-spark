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
    async function completeSignIn() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");

      if (!tokenHash) {
        setError("Slack connected, but the sign-in link was missing. Please try again.");
        return;
      }

      // If already signed in, skip verification and go straight to dashboard.
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        window.location.replace("/dashboard?slack=connected");
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: "email",
        token_hash: tokenHash,
      });

      if (verifyError) {
        console.error("Slack sign-in verifyOtp failed", verifyError);
        setError(verifyError.message);
        return;
      }

      // Confirm session persisted before navigating so the auth gate sees it.
      const { data: after } = await supabase.auth.getSession();
      if (!after.session) {
        setError("Sign-in did not complete. Please try again.");
        return;
      }

      // Full reload so the _authenticated gate re-reads the fresh session.
      window.location.replace("/dashboard?slack=connected");
    }

    void completeSignIn();
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