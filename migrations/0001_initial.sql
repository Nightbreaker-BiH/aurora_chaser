PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  threshold TEXT NOT NULL CHECK (threshold IN ('watch', 'possible', 'favorable')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_logs (
  notification_key TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  threshold TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  score INTEGER NOT NULL,
  site TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'sent',
  provider_message_id TEXT,
  payload_json TEXT NOT NULL,
  FOREIGN KEY (email) REFERENCES subscribers(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_email
  ON notification_logs (email);

CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at
  ON notification_logs (sent_at);
