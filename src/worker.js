import { fetchApod } from "./apodService.js";
import { buildAuroraStatus } from "./auroraService.js";
import { APP_META, getWorkerRuntimeConfig } from "./config.js";
import { buildAuroraEmailContent } from "./emailService.js";
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  const emailReady = Boolean(env.RESEND_API_KEY && env.RESEND_FROM);

  return jsonResponse(
    {
      ok: true,
      subscription: record,
      emailReady,
      message: emailReady
        ? "Pretplata sacuvana. Worker scheduled delivery je spreman preko Resend integracije."
        : "Pretplata sacuvana. Worker/D1 migracija je spremna, ali Resend secrets jos nisu povezani."
    },
    { status: 201 }
  );
}

async function sendNotificationViaResend(env, payload, notificationKey) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    return {
      delivered: false,
      reason: "RESEND_API_KEY ili RESEND_FROM nije konfigurisan."
    };
  }

  const message = buildAuroraEmailContent(payload);
  const resendPayload = {
    from: env.RESEND_FROM,
    to: [payload.subscriber.email],
    subject: message.subject,
    text: message.text,
    html: message.html
  };

  if (env.RESEND_REPLY_TO) {
    resendPayload.reply_to = env.RESEND_REPLY_TO;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Idempotency-Key": notificationKey
    },
    body: JSON.stringify(resendPayload)
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Resend delivery failed: ${response.status} ${responseText}`);
  }

  const responseJson = await response.json();

  return {
    delivered: true,
    providerMessageId: responseJson?.id || null
  };
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

  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.warn("Scheduled notification cycle skipped: RESEND_API_KEY or RESEND_FROM is not configured.");
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
      app: APP_META,
      subscriber,
      status
    };

    try {
      const delivery = await sendNotificationViaResend(env, payload, notificationKey);
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
