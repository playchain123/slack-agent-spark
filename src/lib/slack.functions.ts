import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createPublicInstallState,
  createInstallState,
  getSlackEnv,
  buildSlackInstallUrl,
} from "@/lib/slack.server";
import { getCallerWorkspace } from "./workspace.server";

export const getPublicSlackInstallUrl = createServerFn({ method: "POST" }).handler(async () => {
  const { clientId, stateSecret } = getSlackEnv();
  const state = createPublicInstallState(stateSecret);
  const slackRedirectOrigin = "https://slack-agent-spark.lovable.app";
  const redirectUri = `${process.env.PUBLIC_ORIGIN ?? slackRedirectOrigin}/api/public/slack/oauth/callback`;
  return { url: buildSlackInstallUrl(clientId, state, redirectUri) };
});

export const getSlackInstallUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const member = await getCallerWorkspace(supabase, userId);

    if (!member) {
      throw new Error("No workspace found");
    }

    const { clientId, stateSecret } = getSlackEnv();
    const state = createInstallState(member.workspaceId, userId, stateSecret);
    const slackRedirectOrigin = "https://slack-agent-spark.lovable.app";
    const redirectUri = `${process.env.PUBLIC_ORIGIN ?? slackRedirectOrigin}/api/public/slack/oauth/callback`;
    return { url: buildSlackInstallUrl(clientId, state, redirectUri) };
  });

export const getInstallation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const member = await getCallerWorkspace(supabase, userId);

    if (!member) return { installation: null };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: installation } = await supabaseAdmin
      .from("slack_installations")
      .select("id, slack_team_id, slack_team_name, bot_user_id, installed_at")
      .eq("workspace_id", member.workspaceId)
      .single();

    return { installation };
  });

export const disconnectSlack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const member = await getCallerWorkspace(supabase, userId);

    if (!member || member.role !== "owner") {
      throw new Error("Only workspace owners can disconnect Slack");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("slack_installations").delete().eq("workspace_id", member.workspaceId);
    return { ok: true };
  });
