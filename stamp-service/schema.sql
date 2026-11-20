CREATE TABLE IF NOT EXISTS claims (
 serial INTEGER PRIMARY KEY AUTOINCREMENT,
 event TEXT NOT NULL, holder TEXT NOT NULL, issued INTEGER NOT NULL,
 token_hash TEXT UNIQUE, expires INTEGER, redeemed INTEGER, staff TEXT,
 UNIQUE(event,holder)
);
CREATE TABLE IF NOT EXISTS quiz_sessions (
 challenge_hash TEXT PRIMARY KEY,
 plan TEXT NOT NULL,
 position INTEGER NOT NULL DEFAULT 0,
 attempts INTEGER NOT NULL DEFAULT 0,
 created INTEGER NOT NULL,
 expires INTEGER NOT NULL,
 proof_hash TEXT UNIQUE,
 proof_expires INTEGER,
 used INTEGER
);
CREATE INDEX IF NOT EXISTS quiz_sessions_expiry ON quiz_sessions(expires);
