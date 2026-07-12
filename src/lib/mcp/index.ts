import { auth, defineMcp } from "@lovable.dev/mcp-js";
import askTrelo from "./tools/ask-trelo";
import listCommitments from "./tools/list-commitments";
import toggleCommitment from "./tools/toggle-commitment";
import getDigest from "./tools/get-digest";
import listChannels from "./tools/list-channels";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "trelo-mcp",
  title: "Trelo",
  version: "0.1.0",
  instructions:
    "Trelo turns your Slack workspace into answers and action items. Use `ask_trelo` to search Slack semantically, `list_commitments` and `toggle_commitment` for tasks auto-extracted from messages, `get_digest` for a 24h activity summary, and `list_channels` for indexed channels.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [askTrelo, listCommitments, toggleCommitment, getDigest, listChannels],
});
