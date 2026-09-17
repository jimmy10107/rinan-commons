PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS media_assets (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 category TEXT NOT NULL DEFAULT '',
 original_key TEXT NOT NULL UNIQUE,
 mime_type TEXT NOT NULL CHECK(mime_type IN ('image/jpeg','image/png')),
 width INTEGER NOT NULL CHECK(width>0),
 height INTEGER NOT NULL CHECK(height>0),
 credit TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','revoked')),
 display_approved INTEGER NOT NULL DEFAULT 0 CHECK(display_approved IN (0,1)),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(status<>'published' OR (display_approved=1 AND length(trim(credit))>0))
);
CREATE TABLE IF NOT EXISTS media_variants (
 asset_id TEXT NOT NULL REFERENCES media_assets(id),
 width INTEGER NOT NULL CHECK(width IN (480,800,1200)),
 object_key TEXT NOT NULL UNIQUE,
 PRIMARY KEY(asset_id,width)
);
CREATE INDEX IF NOT EXISTS media_publication ON media_assets(status,display_approved);
