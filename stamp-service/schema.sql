CREATE TABLE IF NOT EXISTS claims (
 serial INTEGER PRIMARY KEY AUTOINCREMENT,
 event TEXT NOT NULL, holder TEXT NOT NULL, issued INTEGER NOT NULL,
 token_hash TEXT UNIQUE, expires INTEGER, redeemed INTEGER, staff TEXT,
 UNIQUE(event,holder)
);
