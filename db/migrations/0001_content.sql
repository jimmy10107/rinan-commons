CREATE TABLE IF NOT EXISTS content_records (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('settings','chapters','materials','vendors','performers','places','organizations','programs','articles','spaceUses')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  source TEXT NOT NULL CHECK (length(source) > 0),
  updated_at TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);
CREATE INDEX IF NOT EXISTS content_public_kind ON content_records(status,kind,sort_order);
CREATE VIEW IF NOT EXISTS public_content AS SELECT * FROM content_records WHERE status = 'published';
