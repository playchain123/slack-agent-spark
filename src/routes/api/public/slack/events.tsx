import { createFileRoute } from "@tanstack/react-router";
import { getSlackEnv, verifySlackRequest } from "@/lib/slack.server";

export const Route = createFileRoute("/api/public/slack/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { signingSecret } = getSlackEnv();
        const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
        const signature = request.headers.get("x-slack-signature") ?? "";
        const rawBody = await request.text();

        if (!verifySlackRequest(signingSecret, timestamp, rawBody, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(rawBody) as {
          type?: string;
          challenge?: string;
          event?: { type?: string; team_id?: string; [key: string]: unknown };
        };

        if (payload.type === "url_verification") {
          return new Response(payload.challenge ?? "", {
            headers: { "Content-Type": "text/plain" },
          });
        }

        const event = payload.event;
        if (event && event.team_id) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin.from("slack_event_queue").insert({
              slack_team_id: event.team_id,
              event_type: event.type ?? "unknown",
              payload: event,
            });
          } catch (err) {
            console.error("Failed to queue Slack event", err);
          }
        }

        return new Response("ok");
      },
    },
  },
});
