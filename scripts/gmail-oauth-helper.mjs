import http from "node:http";
import crypto from "node:crypto";

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const port = Number(process.env.GMAIL_OAUTH_PORT || 8787);
const scope = "https://www.googleapis.com/auth/gmail.send";
const redirectUri = `http://127.0.0.1:${port}/oauth2/callback`;
const state = crypto.randomBytes(16).toString("hex");

if (!clientId || !clientSecret) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET before running this helper.");
  process.exit(1);
}

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    }).toString()
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${responseText}`);
  }

  return response.json();
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", redirectUri);
    if (url.pathname !== "/oauth2/callback") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    if (url.searchParams.get("state") !== state) {
      res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      res.end("Invalid OAuth state.");
      return;
    }

    if (url.searchParams.get("error")) {
      res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      res.end(`OAuth error: ${url.searchParams.get("error")}`);
      return;
    }

    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      res.end("Missing OAuth authorization code.");
      return;
    }

    const tokens = await exchangeCodeForTokens(code);
    const refreshToken = tokens.refresh_token || "";

    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("OAuth complete. Return to the terminal.");

    console.log("");
    console.log("Google OAuth completed.");
    console.log(`access_token: ${tokens.access_token || ""}`);
    console.log(`refresh_token: ${refreshToken}`);
    console.log(`expires_in: ${tokens.expires_in || ""}`);
    console.log("");

    if (!refreshToken) {
      console.log("No refresh_token returned. Revoke previous consent or retry with prompt=consent on a fresh grant.");
    } else {
      console.log("Next Cloudflare secrets:");
      console.log("npx wrangler secret put GMAIL_CLIENT_ID");
      console.log("npx wrangler secret put GMAIL_CLIENT_SECRET");
      console.log("npx wrangler secret put GMAIL_REFRESH_TOKEN");
      console.log("npx wrangler secret put GMAIL_SENDER_EMAIL");
      console.log("npx wrangler secret put GMAIL_SENDER_NAME");
      console.log("npx wrangler deploy");
    }
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("OAuth token exchange failed. Check terminal output.");
    console.error(error instanceof Error ? error.message : error);
  } finally {
    setTimeout(() => {
      server.close(() => process.exit(0));
    }, 250);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`OAuth redirect URI: ${redirectUri}`);
  console.log("Open this URL in your browser and complete Gmail consent:");
  console.log(buildAuthUrl());
});
