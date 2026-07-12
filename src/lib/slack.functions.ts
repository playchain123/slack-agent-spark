import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createPublicInstallState,
  createInstallState,
  getSlackEnv,
  buildSlackInstallUrl,
} from "@/lib/slack.server";

const SLACK_REDIRECT_ORIGIN = "https://slack-agent-spark.lovable.app";

export const getPublicSlackInstallUrl = createServerFn({ method: "POST" }).handler(async () => {
  const { clientId, stateSecret } = getSlackEnv();
  const state = createPublicInstallState(stateSecret);
  const redirectUri = `${process.env.PUBLIC_ORIGIN ?? SLACK_REDIRECT_ORIGIN}/api/public/slack/oauth/callback`;
  return { url: buildSlackInstallUrl(clientId, state, redirectUri) };
});

export const getSlackInstallUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", userId)
      .single();

    if (!member) {
      throw new Error("No workspace found");
    }

    const { clientId, stateSecret } = getSlackEnv();
    const state = createInstallState(member.workspace_id, stateSecret);
    const redirectUri = `${process.env.PUBLIC_ORIGIN ?? SLACK_REDIRECT_ORIGIN}/api/public/slack/oauth/callback`;
    return { url: buildSlackInstallUrl(clientId, state, redirectUri) };
  });

export const getInstallation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .single();

    if (!member) return { installation: null };

    const { data: installation } = await supabase
      .from("slack_installations_public")
      .select("*")
      .eq("workspace_id", member.workspace_id)
      .single();

    return { installation };
  });

export const disconnectSlack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", userId)
      .single();

    if (!member || member.role !== "owner") {
      throw new Error("Only workspace owners can disconnect Slack");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("slack_installations").delete().eq("workspace_id", member.workspace_id);
    return { ok: true };
  });
