import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export interface SlackStatePayload {
  workspace_id?: string;
  flow?: "workspace" | "public";
  nonce: string;
  exp: number;
}

export function getSlackEnv() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const stateSecret = process.env.SLACK_STATE_SECRET;
  if (!clientId || !clientSecret || !signingSecret || !stateSecret) {
    throw new Error(
      "Missing Slack environment variables: SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET, SLACK_STATE_SECRET",
    );
  }
  return { clientId, clientSecret, signingSecret, stateSecret };
}

export function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export function signState(payload: SlackStatePayload, secret: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64UrlEncode(sig)}`;
}

export function verifyState(token: string, secret: string): SlackStatePayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid state token");
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest();
  if (!timingSafeEqual(base64UrlDecode(sig), expected)) {
    throw new Error("Invalid state signature");
  }
  const payload: SlackStatePayload = JSON.parse(base64UrlDecode(body).toString("utf8"));
  if (payload.exp < Date.now() / 1000) throw new Error("State token expired");
  return payload;
}

export function createInstallState(workspaceId: string, secret: string): string {
  const payload: SlackStatePayload = {
    workspace_id: workspaceId,
    flow: "workspace",
    nonce: randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + 600,
  };
  return signState(payload, secret);
}

export function createPublicInstallState(secret: string): string {
  const payload: SlackStatePayload = {
    flow: "public",
    nonce: randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + 600,
  };
  return signState(payload, secret);
}

export function buildSlackInstallUrl(clientId: string, state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: [
      "app_mentions:read",
      "assistant:write",
      "channels:history",
      "channels:join",
      "channels:read",
      "chat:write",
      "groups:history",
      "groups:read",
      "im:history",
      "im:read",
      "im:write",
      "mpim:history",
      "mpim:read",
      "reactions:read",
      "search:read.public",
      "users:read",
      "users:read.email",
    ].join(","),
    user_scope: ["openid", "email", "profile"].join(","),
    redirect_uri: redirectUri,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export function verifySlackRequest(
  signingSecret: string,
  timestamp: string,
  rawBody: string,
  signature: string,
): boolean {
  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;
  const expected = createHmac("sha256", signingSecret)
    .update(`v0:${timestamp}:${rawBody}`)
    .digest("hex");
  if (!signature?.startsWith("v0=")) return false;
  const expectedBuf = Buffer.from(`v0=${expected}`);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
