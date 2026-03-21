import { fetchApod } from "./apodService.js";
import { buildAuroraStatus } from "./auroraService.js";
import { APP_META, getWorkerRuntimeConfig } from "./config.js";
import { buildAuroraEmailContent } from "./emailContent.js";
import { isGmailConfigured, sendGmailEmail } from "./gmailService.js";
import { listSubscribers, upsertSubscriber, wasNotificationSent, writeNotificationLog } from "./storage.js";

let cachedStatus = null;
let cachedAt = 0;
let refreshInFlight = null;
let cachedApod = null;
let cachedApodAt = 0;
let apodRefreshInFlight = null;

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(payload), {
    ...init,
    headers
  });
}

function jsonError(status, error, message) {
  return jsonResponse({ error, message }, { status });
}

function validateEmailAddress(email) {
  return Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getStatus(env, { force = false } = {}) {
  const runtimeConfig = getWorkerRuntimeConfig(env);
  const cacheAgeMs = Date.now() - cachedAt;
  const maxAgeMs = runtimeConfig.pollMinutes * 60 * 1000;

  if (!force && cachedStatus && cacheAgeMs < maxAgeMs) {
    return cachedStatus;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = buildAuroraStatus(runtimeConfig)
    .then((status) => {
      cachedStatus = status;
      cachedAt = Date.now();
      return status;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function getApod(env, { force = false } = {}) {
  const runtimeConfig = getWorkerRuntimeConfig(env);
  const cacheAgeMs = Date.now() - cachedApodAt;
  const maxAgeMs = 6 * 60 * 60 * 1000;

  if (!force && cachedApod && cacheAgeMs < maxAgeMs) {
    return cachedApod;
  }

  if (apodRefreshInFlight) {
    return apodRefreshInFlight;
  }

  apodRefreshInFlight = fetchApod(runtimeConfig.nasaApiKey)
    .then((apod) => {
      cachedApod = apod;
      cachedApodAt = Date.now();
      return apod;
    })
    .finally(() => {
      apodRefreshInFlight = null;
    });

  return apodRefreshInFlight;
}

async function serveStaticAsset(request, env) {
  if (!env.ASSETS) {
    return new Response("Static assets binding `ASSETS` is not configured.", { status: 500 });
  }

  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const fallbackUrl = new URL("/index.html", request.url);
  return env.ASSETS.fetch(new Request(fallbackUrl, request));
}

async function readRequestJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
}

async function handleSubscriptionRequest(request, env) {
  const runtimeConfig = getWorkerRuntimeConfig(env);
  const body = await readRequestJson(request);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const threshold = String(body?.threshold ?? "possible").trim().toLowerCase();

  if (!validateEmailAddress(email)) {
    return jsonError(400, "INVALID_EMAIL", "Unesite validnu email adresu.");
  }

  if (!runtimeConfig.alertThresholds[threshold]) {
    return jsonError(400, "INVALID_THRESHOLD", "Nepoznat prag alarma.");
  }

  const record = await upsertSubscriber(env, {
    email,
    threshold,
    createdAt: new Date().toISOString()
  });

  const emailReady = isGmailConfigured(env);

  return jsonResponse(
    {
      ok: true,
      subscription: record,
      emailReady,
      message: emailReady
        ? "Pretplata sacuvana. Worker scheduled delivery je spreman preko Gmail API integracije."
        : "Pretplata sacuvana. Worker/D1 migracija je spremna, ali Gmail API secrets jos nisu povezani."
    },
    { status: 201 }
  );
}

async function sendNotificationViaGmail(env, payload, notificationKey) {
  const message = buildAuroraEmailContent(payload);
  return sendGmailEmail(
    env,
    {
      to: [payload.subscriber.email],
      subject: message.subject,
      text: message.text,
      html: message.html
    },
    notificationKey
  );
}

function extractAdminToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return request.headers.get("x-admin-token") || "";
}

async function handleTestEmailRequest(request, env) {
  if (!env.ADMIN_TEST_TOKEN) {
    return jsonError(503, "TEST_EMAIL_DISABLED", "Admin test token nije konfigurisan.");
  }

  if (!isGmailConfigured(env)) {
    return jsonError(503, "EMAIL_NOT_CONFIGURED", "Gmail API secrets nisu kompletno konfigurirani.");
  }

  if (extractAdminToken(request) !== env.ADMIN_TEST_TOKEN) {
    return jsonError(403, "FORBIDDEN", "Neispravan admin test token.");
  }

  const body = await readRequestJson(request);
  const targetEmail = String(body?.email ?? "").trim().toLowerCase();

  if (!validateEmailAddress(targetEmail)) {
    return jsonError(400, "INVALID_EMAIL", "Unesite validnu email adresu za test.");
  }

  await upsertSubscriber(env, {
    email: targetEmail,
    threshold: "possible",
    createdAt: new Date().toISOString()
  });

  const status = await getStatus(env, { force: true });
  const testPayload = {
    appMeta: APP_META,
    subscriber: {
      email: targetEmail,
      threshold: "possible"
    },
    status
  };
  const message = buildAuroraEmailContent(testPayload);
  const notificationKey = `test:${Date.now()}:${targetEmail}`;
  const delivery = await sendGmailEmail(
    env,
    {
      to: [targetEmail],
      subject: `[TEST] ${message.subject}`,
      text: `TEST EMAIL\n\n${message.text}`,
      html: `<p><strong>TEST EMAIL</strong></p>${message.html}`
    },
    notificationKey
  );

  await writeNotificationLog(env, notificationKey, {
    email: targetEmail,
    threshold: "possible",
    sentAt: new Date().toISOString(),
    score: status.summary.score,
    site: status.summary.bestSite.name,
    deliveryStatus: delivery.delivered ? "sent" : "failed",
    providerMessageId: delivery.providerMessageId,
    payload: {
      type: "test-email",
      targetEmail,
      status
    }
  });

  return jsonResponse({
    ok: true,
    targetEmail,
    score: status.summary.score,
    providerMessageId: delivery.providerMessageId
  });
}

async function runNotificationCycle(env) {
  const runtimeConfig = getWorkerRuntimeConfig(env);
  const status = await getStatus(env, { force: true });
  const subscribers = await listSubscribers(env);
  const summary = {
    subscribers: subscribers.length,
    delivered: 0,
    skippedThreshold: 0,
    skippedDuplicate: 0,
    skippedNoDelivery: 0,
    failed: 0
  };

  if (!subscribers.length) {
    return summary;
  }

  if (!isGmailConfigured(env)) {
    console.warn("Scheduled notification cycle skipped: Gmail API secrets are not fully configured.");
    summary.skippedNoDelivery = subscribers.length;
    return summary;
  }

  for (const subscriber of subscribers) {
    const minScore = runtimeConfig.alertThresholds[subscriber.threshold] ?? runtimeConfig.alertThresholds.possible;
    if (status.summary.score < minScore) {
      summary.skippedThreshold += 1;
      continue;
    }

    const notificationKey = `${status.summary.localNightKey}:${subscriber.email}`;
    if (await wasNotificationSent(env, notificationKey)) {
      summary.skippedDuplicate += 1;
      continue;
    }

    const payload = {
      appMeta: APP_META,
      subscriber,
      status
    };

    try {
      const delivery = await sendNotificationViaGmail(env, payload, notificationKey);
      await writeNotificationLog(env, notificationKey, {
        email: subscriber.email,
        threshold: subscriber.threshold,
        sentAt: new Date().toISOString(),
        score: status.summary.score,
        site: status.summary.bestSite.name,
        deliveryStatus: delivery.delivered ? "sent" : "failed",
        providerMessageId: delivery.providerMessageId,
        payload
      });
      summary.delivered += 1;
    } catch (error) {
      await writeNotificationLog(env, notificationKey, {
        email: subscriber.email,
        threshold: subscriber.threshold,
        sentAt: new Date().toISOString(),
        score: status.summary.score,
        site: status.summary.bestSite.name,
        deliveryStatus: "failed",
        providerMessageId: null,
        error: error instanceof Error ? error.message : "Unknown delivery error",
        payload
      });
      summary.failed += 1;
    }
  }

  return summary;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/api/status") {
        return jsonResponse(await getStatus(env));
      }

      if (request.method === "GET" && url.pathname === "/api/apod") {
        return jsonResponse(await getApod(env));
      }

      if (request.method === "POST" && url.pathname === "/api/subscriptions") {
        return await handleSubscriptionRequest(request, env);
      }

      if (request.method === "POST" && url.pathname === "/api/test-email") {
        return await handleTestEmailRequest(request, env);
      }

      return await serveStaticAsset(request, env);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_JSON") {
        return jsonError(400, "INVALID_JSON", "Neispravan JSON body.");
      }

      return jsonError(500, "WORKER_RUNTIME_ERROR", error instanceof Error ? error.message : "Unknown error");
    }
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      runNotificationCycle(env)
        .then((summary) => {
          console.log("Scheduled notification cycle completed", summary);
        })
        .catch((error) => {
          console.error("Scheduled notification cycle failed", error);
        })
    );
  }
};
