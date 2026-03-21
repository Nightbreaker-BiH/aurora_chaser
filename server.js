import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fetchApod } from "./src/apodService.js";
import { APP_META, getRuntimeConfig } from "./src/config.js";
import { buildAuroraStatus } from "./src/auroraService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const app = express();
const runtimeConfig = getRuntimeConfig();

let cachedStatus = null;
let cachedAt = 0;
let refreshInFlight = null;
let cachedApod = null;
let cachedApodAt = 0;
let apodRefreshInFlight = null;

app.use(express.static(publicDir, { extensions: ["html"] }));

async function getStatus({ force = false } = {}) {
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

async function getApod({ force = false } = {}) {
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

app.get("/api/status", async (_req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: "STATUS_FETCH_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/apod", async (_req, res) => {
  try {
    const apod = await getApod();
    res.json(apod);
  } catch (error) {
    res.status(500).json({
      error: "APOD_FETCH_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(runtimeConfig.port, () => {
  console.log(`${APP_META.name} listening on http://127.0.0.1:${runtimeConfig.port}`);
});
