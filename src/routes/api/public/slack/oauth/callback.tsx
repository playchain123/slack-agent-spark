import { createFileRoute } from "@tanstack/react-router";
import {
  getSlackEnv,
  verifyState,
} from "@/lib/slack.server";

export const Route = createFileRoute("/api/public/slack/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { clientId, clientSecret, stateSecret } = getSlackEnv();
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          return new Response(`Slack OAuth error: ${error}`, { status: 400 });
        }
        if (!code || !state) {
          return new Response("Missing code or state", { status: 400 });
        }

        let workspaceId: string;
        try {
          const payload = verifyState(state, stateSecret);
          workspaceId = payload.workspace_id;
        } catch (err) {
          console.error("State verification failed", err);
          return new Response("Invalid or expired state", { status: 400 });
        }

        const redirectUri = `${new URL(request.url).origin}/api/public/slack/oauth/callback`;

        try {
          const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              code,
              redirect_uri: redirectUri,
            }),
          });
          const tokenData = (await tokenRes.json()) as {
            ok: boolean;
            error?: string;
            team?: { id?: string; name?: string };
            authed_user?: { id?: string };
            bot_user_id?: string;
            access_token?: string;
            scope?: string;
          };

          if (!tokenData.ok) {
            console.error("Slack OAuth exchange failed", tokenData.error);
            return new Response(`Slack OAuth failed: ${tokenData.error ?? "unknown"}`, {
              status: 400,
            });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error: upsertErr } = await supabaseAdmin
            .from("slack_installations")
            .upsert(
              {
                workspace_id: workspaceId,
                slack_team_id: tokenData.team?.id ?? "",
                slack_team_name: tokenData.team?.name ?? null,
                bot_user_id: tokenData.bot_user_id ?? null,
                bot_token: tokenData.access_token ?? "",
                authed_user_id: tokenData.authed_user?.id ?? null,
                scope: tokenData.scope ?? null,
                installed_at: new Date().toISOString(),
              },
              { onConflict: "workspace_id" },
            );

          if (upsertErr) {
            console.error("Failed to store Slack installation", upsertErr);
            return new Response("Failed to store installation", { status: 500 });
          }

          return Response.redirect(`${new URL(request.url).origin}/dashboard?slack=connected`, 302);
        } catch (err) {
          console.error("OAuth callback error", err);
          return new Response("Internal error", { status: 500 });
        }
      },
    },
  },
});
