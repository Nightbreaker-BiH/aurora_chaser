import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const subscribersFile = path.join(dataDir, "subscribers.json");
const notificationsFile = path.join(dataDir, "notifications.json");

async function ensureJsonFile(filePath, fallback) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

export async function ensureStorageFiles() {
  await ensureJsonFile(subscribersFile, []);
  await ensureJsonFile(notificationsFile, {});
}

export async function listSubscribers() {
  return readJson(subscribersFile, []);
}

export async function upsertSubscriber(subscriber) {
  const subscribers = await listSubscribers();
  const existingIndex = subscribers.findIndex((item) => item.email === subscriber.email);

  if (existingIndex >= 0) {
    subscribers[existingIndex] = {
      ...subscribers[existingIndex],
      ...subscriber,
      updatedAt: new Date().toISOString()
    };
  } else {
    subscribers.push({
      ...subscriber,
      updatedAt: new Date().toISOString()
    });
  }

  await writeJson(subscribersFile, subscribers);
  return subscribers.find((item) => item.email === subscriber.email);
}

export async function wasNotificationSent(key) {
  const logs = await readJson(notificationsFile, {});
  return Boolean(logs[key]);
}

export async function writeNotificationLog(key, payload) {
  const logs = await readJson(notificationsFile, {});
  logs[key] = payload;
  await writeJson(notificationsFile, logs);
}
