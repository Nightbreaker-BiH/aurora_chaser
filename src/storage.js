const VALID_THRESHOLDS = new Set(["watch", "possible", "favorable"]);

function getDatabase(env) {
  if (!env?.DB) {
    throw new Error("Cloudflare D1 binding `DB` is not configured.");
  }

  return env.DB;
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeThreshold(value) {
  const threshold = String(value ?? "possible").trim().toLowerCase();
  if (!VALID_THRESHOLDS.has(threshold)) {
    throw new Error(`Unsupported threshold: ${threshold}`);
  }

  return threshold;
}

function mapSubscriberRow(row) {
  if (!row) {
    return null;
  }

  return {
    email: row.email,
    threshold: row.threshold,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapNotificationLogRow(row) {
  if (!row) {
    return null;
  }

  return {
    key: row.notification_key,
    email: row.email,
    threshold: row.threshold,
    sentAt: row.sent_at,
    score: row.score,
    site: row.site,
    deliveryStatus: row.delivery_status,
    providerMessageId: row.provider_message_id,
    payload: row.payload_json ? JSON.parse(row.payload_json) : null
  };
}

export async function listSubscribers(env) {
  const db = getDatabase(env);
  const { results } = await db
    .prepare(
      `SELECT email, threshold, created_at, updated_at
       FROM subscribers
       ORDER BY email ASC`
    )
    .all();

  return (results ?? []).map(mapSubscriberRow);
}

export async function getSubscriberByEmail(env, email) {
  const db = getDatabase(env);
  const row = await db
    .prepare(
      `SELECT email, threshold, created_at, updated_at
       FROM subscribers
       WHERE email = ?1`
    )
    .bind(normalizeEmail(email))
    .first();

  return mapSubscriberRow(row);
}

export async function upsertSubscriber(env, subscriber) {
  const db = getDatabase(env);
  const email = normalizeEmail(subscriber?.email);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  const threshold = normalizeThreshold(subscriber?.threshold);
  const now = new Date().toISOString();
  const createdAt = subscriber?.createdAt || now;

  await db
    .prepare(
      `INSERT INTO subscribers (email, threshold, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(email) DO UPDATE SET
         threshold = excluded.threshold,
         updated_at = excluded.updated_at`
    )
    .bind(email, threshold, createdAt, now)
    .run();

  return getSubscriberByEmail(env, email);
}

export async function wasNotificationSent(env, key) {
  const db = getDatabase(env);
  const row = await db
    .prepare(
      `SELECT delivery_status
       FROM notification_logs
       WHERE notification_key = ?1`
    )
    .bind(String(key))
    .first();

  return row?.delivery_status === "sent";
}

export async function writeNotificationLog(env, key, payload) {
  const db = getDatabase(env);
  const record = {
    email: normalizeEmail(payload?.email),
    threshold: normalizeThreshold(payload?.threshold),
    sentAt: payload?.sentAt || new Date().toISOString(),
    score: Number(payload?.score ?? 0),
    site: String(payload?.site ?? ""),
    deliveryStatus: String(payload?.deliveryStatus ?? "sent"),
    providerMessageId: payload?.providerMessageId ? String(payload.providerMessageId) : null,
    payloadJson: JSON.stringify(payload ?? {})
  };

  await db
    .prepare(
      `INSERT INTO notification_logs (
         notification_key,
         email,
         threshold,
         sent_at,
         score,
         site,
         delivery_status,
         provider_message_id,
         payload_json
       )
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT(notification_key) DO UPDATE SET
         email = excluded.email,
         threshold = excluded.threshold,
         sent_at = excluded.sent_at,
         score = excluded.score,
         site = excluded.site,
         delivery_status = excluded.delivery_status,
         provider_message_id = excluded.provider_message_id,
         payload_json = excluded.payload_json`
    )
    .bind(
      String(key),
      record.email,
      record.threshold,
      record.sentAt,
      record.score,
      record.site,
      record.deliveryStatus,
      record.providerMessageId,
      record.payloadJson
    )
    .run();

  const row = await db
    .prepare(
      `SELECT notification_key, email, threshold, sent_at, score, site, delivery_status, provider_message_id, payload_json
       FROM notification_logs
       WHERE notification_key = ?1`
    )
    .bind(String(key))
    .first();

  return mapNotificationLogRow(row);
}
