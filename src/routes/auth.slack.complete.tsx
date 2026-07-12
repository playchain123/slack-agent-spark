import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeSignIn() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");

      if (!tokenHash) {
        setError("Slack connected, but the sign-in link was missing. Please try again.");
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: tokenHash,
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      navigate({ to: "/dashboard", replace: true, search: { slack: "connected" } });
    }

    void completeSignIn();
  }, [navigate]);

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