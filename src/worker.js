import { fetchApod } from "./apodService.js";
import { buildAuroraStatus } from "./auroraService.js";
import { getWorkerRuntimeConfig } from "./config.js";

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

      return await serveStaticAsset(request, env);
    } catch (error) {
      return jsonError(500, "WORKER_RUNTIME_ERROR", error instanceof Error ? error.message : "Unknown error");
    }
  }
};
