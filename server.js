import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fetchApod } from "./src/apodService.js";
import { APP_META, getRuntimeConfig } from "./src/config.js";
import { buildAuroraStatus } from "./src/auroraService.js";
import {
  ensureStorageFiles,
  listSubscribers,
  upsertSubscriber,
  wasNotificationSent,
  writeNotificationLog
} from "./src/storage.js";
import { createTransporter, sendAuroraEmail } from "./src/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const app = express();
const runtimeConfig = getRuntimeConfig();
const transporter = createTransporter(runtimeConfig.smtp);

let cachedStatus = null;
let cachedAt = 0;
let refreshInFlight = null;
let cachedApod = null;
let cachedApodAt = 0;
let apodRefreshInFlight = null;

app.use(express.json());
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

async function runNotificationCycle() {
  try {
    const status = await getStatus({ force: true });
    const subscribers = await listSubscribers();

    if (!subscribers.length || !transporter) {
      return;
    }

    for (const subscriber of subscribers) {
      const minScore = runtimeConfig.alertThresholds[subscriber.threshold] ?? runtimeConfig.alertThresholds.possible;
      if (status.summary.score < minScore) {
        continue;
      }

      const nightKey = `${status.summary.localNightKey}:${subscriber.email}`;
      const alreadySent = await wasNotificationSent(nightKey);
      if (alreadySent) {
        continue;
      }

      await sendAuroraEmail({
        transporter,
        smtpFrom: runtimeConfig.smtp.from,
        to: subscriber.email,
        subscriber,
        status,
        appMeta: APP_META
      });

      await writeNotificationLog(nightKey, {
        email: subscriber.email,
        threshold: subscriber.threshold,
        sentAt: new Date().toISOString(),
        score: status.summary.score,
        site: status.summary.bestSite.name
      });
    }
  } catch (error) {
    console.error("Notification cycle failed:", error);
  }
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

app.post("/api/subscriptions", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const threshold = String(req.body?.threshold ?? "possible").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: "INVALID_EMAIL",
      message: "Unesite validnu email adresu."
    });
  }

  if (!runtimeConfig.alertThresholds[threshold]) {
    return res.status(400).json({
      error: "INVALID_THRESHOLD",
      message: "Nepoznat prag alarma."
    });
  }

  const record = await upsertSubscriber({
    email,
    threshold,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({
    ok: true,
    subscription: record,
    emailReady: Boolean(transporter),
    message: transporter
      ? "Pretplata sacuvana. Alarm ce slati email kada procjena za BiH predje izabrani prag."
      : "Pretplata sacuvana. Za stvarno slanje emailova treba popuniti SMTP varijable u .env."
  });
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

async function bootstrap() {
  await ensureStorageFiles();

  app.listen(runtimeConfig.port, () => {
    console.log(`${APP_META.name} listening on http://127.0.0.1:${runtimeConfig.port}`);
  });

  await runNotificationCycle();
  setInterval(runNotificationCycle, runtimeConfig.pollMinutes * 60 * 1000);
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exitCode = 1;
});
