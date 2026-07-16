import { createFileRoute } from "@tanstack/react-router";
import { getSlackEnv, normalizeReturnOrigin, verifyState } from "@/lib/slack.server";

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

        let workspaceId: string | undefined;
        let stateUserId: string | undefined;
        let returnOrigin: string | null = null;
        let isPublicFlow = false;
        try {
          const payload = verifyState(state, stateSecret);
          workspaceId = payload.workspace_id;
          stateUserId = payload.user_id;
          returnOrigin =
            normalizeReturnOrigin(payload.return_origin) ?? new URL(request.url).origin;
          isPublicFlow = payload.flow === "public" || !workspaceId;
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
            bot_user_id?: string;
            access_token?: string;
            scope?: string;
            authed_user?: {
              id?: string;
              access_token?: string;
              scope?: string;
            };
          };

          if (!tokenData.ok) {
            console.error("Slack OAuth exchange failed", tokenData.error);
            return new Response(`Slack OAuth failed: ${tokenData.error ?? "unknown"}`, {
              status: 400,
            });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          async function redirectWithMagicSignIn(email: string) {
            const { data: magicLink, error: magicLinkError } =
              await supabaseAdmin.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: {
                  redirectTo: `${returnOrigin ?? new URL(request.url).origin}/slack/complete`,
                },
              });

            const actionLink = magicLink.properties?.action_link;
            if (magicLinkError || !actionLink) {
              console.error("Failed to generate Slack sign-in link", magicLinkError);
              return new Response("Slack connected, but sign-in could not be completed", {
                status: 500,
              });
            }

            return Response.redirect(actionLink, 302);
          }

          let slackUserEmail: string | null = null;
          let slackUserName: string | null = null;
          let slackUserAvatar: string | null = null;

          if (tokenData.authed_user?.access_token) {
            const profileRes = await fetch("https://slack.com/api/openid.connect.userInfo", {
              headers: { Authorization: `Bearer ${tokenData.authed_user.access_token}` },
            });
            const profileData = (await profileRes.json()) as {
              ok?: boolean;
              email?: string;
              name?: string;
              picture?: string;
            };
            if (profileData.ok !== false) {
              slackUserEmail = profileData.email ?? null;
              slackUserName = profileData.name ?? null;
              slackUserAvatar = profileData.picture ?? null;
            }
          }

          if (isPublicFlow) {
            if (!slackUserEmail) {
              return new Response(
                "Slack did not return an email address. Please allow email access and try again.",
                {
                  status: 400,
                },
              );
            }

            const { data: existingProfile } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", slackUserEmail)
              .maybeSingle();

            let userId = existingProfile?.id;
            if (!userId) {
              const { data: createdUser, error: createUserError } =
                await supabaseAdmin.auth.admin.createUser({
                  email: slackUserEmail,
                  email_confirm: true,
                  user_metadata: {
                    full_name: slackUserName ?? slackUserEmail.split("@")[0],
                    avatar_url: slackUserAvatar,
                  },
                });

              if (createUserError && !createUserError.message.toLowerCase().includes("already")) {
                console.error("Failed to create Slack-auth user", createUserError);
                return new Response("Failed to create Trelo account", { status: 500 });
              }

              userId = createdUser.user?.id;
            }

            if (!userId) {
              const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({
                page: 1,
                perPage: 1000,
              });
              userId = usersPage.users.find(
                (user) => user.email?.toLowerCase() === slackUserEmail.toLowerCase(),
              )?.id;
            }

            if (!userId) {
              return new Response("Could not find or create your Trelo account", { status: 500 });
            }

            await supabaseAdmin.from("profiles").upsert({
              id: userId,
              email: slackUserEmail,
              full_name: slackUserName ?? slackUserEmail.split("@")[0],
              avatar_url: slackUserAvatar,
            });

            const { data: existingInstallation } = await supabaseAdmin
              .from("slack_installations")
              .select("workspace_id")
              .eq("slack_team_id", tokenData.team?.id ?? "")
              .maybeSingle();

            if (existingInstallation?.workspace_id) {
              workspaceId = existingInstallation.workspace_id;
              await supabaseAdmin
                .from("workspace_members")
                .upsert(
                  { workspace_id: workspaceId, user_id: userId, role: "member" },
                  { onConflict: "workspace_id,user_id", ignoreDuplicates: true },
                );
            } else {
              const { data: membership } = await supabaseAdmin
                .from("workspace_members")
                .select("workspace_id")
                .eq("user_id", userId)
                .limit(1)
                .maybeSingle();

              workspaceId = membership?.workspace_id;
              if (!workspaceId) {
                const { data: workspace, error: workspaceError } = await supabaseAdmin
                  .from("workspaces")
                  .insert({
                    name: `${tokenData.team?.name ?? "Slack"} workspace`,
                    owner_id: userId,
                  })
                  .select("id")
                  .single();

                if (workspaceError || !workspace) {
                  console.error("Failed to create workspace", workspaceError);
                  return new Response("Failed to create workspace", { status: 500 });
                }

                workspaceId = workspace.id;
                await supabaseAdmin
                  .from("workspace_members")
                  .insert({ workspace_id: workspaceId, user_id: userId, role: "owner" });
              }
            }
          }

          if (!workspaceId) {
            return new Response("Missing workspace for Slack installation", { status: 400 });
          }

          const { error: upsertErr } = await supabaseAdmin.from("slack_installations").upsert(
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

          if (tokenData.access_token) {
            try {
              const { syncWorkspaceSlack } = await import("@/lib/slack-sync.server");
              await syncWorkspaceSlack({
                workspaceId,
                botToken: tokenData.access_token,
                maxChannels: 12,
                messagesPerChannel: 12,
                joinPublicChannels: true,
              });
            } catch (syncError) {
              console.error("Initial Slack sync failed", syncError);
            }
          }

          if (isPublicFlow && slackUserEmail) {
            // Redirect the browser through Supabase's own verify endpoint.
            // Supabase sets the session tokens in the URL hash and then
            // redirects to /slack/complete, where detectSessionInUrl
            // picks them up and persists the session before we navigate.
            return redirectWithMagicSignIn(slackUserEmail);
          }

          return Response.redirect(
            `${returnOrigin ?? new URL(request.url).origin}/dashboard?slack=connected`,
            302,
          );
        } catch (err) {
          console.error("OAuth callback error", err);
          return new Response("Internal error", { status: 500 });
        }
      },
    },
  },
});
