const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function getConfiguredSender(env) {
  const senderEmail = String(env.GMAIL_SENDER_EMAIL || "").trim();
  const senderName = String(env.GMAIL_SENDER_NAME || "").trim();

  if (!senderEmail) {
    return "";
  }

  return senderName ? `${senderName} <${senderEmail}>` : senderEmail;
}

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildMimeMessage({ from, to, replyTo, subject, text, html, notificationKey }) {
  const boundary = `aurorachaser_${crypto.randomUUID()}`;
  const recipients = Array.isArray(to) ? to.join(", ") : String(to);
  const lines = [
    `From: ${from}`,
    `To: ${recipients}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `X-AuroraChaser-Notification-Key: ${notificationKey}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];

  if (replyTo) {
    lines.splice(3, 0, `Reply-To: ${replyTo}`);
  }

  lines.push(
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
    "",
    `--${boundary}--`,
    ""
  );

  return encodeBase64Url(lines.join("\r\n"));
}

async function fetchAccessToken(env) {
  const response = await fetch(GMAIL_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token"
    }).toString()
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Google OAuth token refresh failed: ${response.status} ${responseText}`);
  }

  const responseJson = await response.json();
  if (!responseJson?.access_token) {
    throw new Error("Google OAuth token refresh did not return access_token.");
  }

  return responseJson.access_token;
}

export function isGmailConfigured(env) {
  return Boolean(
    env?.GMAIL_CLIENT_ID &&
      env?.GMAIL_CLIENT_SECRET &&
      env?.GMAIL_REFRESH_TOKEN &&
      env?.GMAIL_SENDER_EMAIL
  );
}

export async function sendGmailEmail(env, message, notificationKey) {
  if (!isGmailConfigured(env)) {
    return {
      delivered: false,
      reason: "GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN ili GMAIL_SENDER_EMAIL nije konfigurisan."
    };
  }

  const accessToken = await fetchAccessToken(env);
  const raw = buildMimeMessage({
    from: getConfiguredSender(env),
    to: message.to,
    replyTo: env.GMAIL_REPLY_TO || "",
    subject: message.subject,
    text: message.text,
    html: message.html,
    notificationKey
  });

  const response = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ raw })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Gmail API send failed: ${response.status} ${responseText}`);
  }

  const responseJson = await response.json();

  return {
    delivered: true,
    providerMessageId: responseJson?.id || null
  };
}
