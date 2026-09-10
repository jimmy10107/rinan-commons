import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
test('publishing excludes every draft record, while retaining planning data in SQLite', () => {
  const db = new DatabaseSync(new URL('.content/content.sqlite', root).pathname, { readOnly: true });
  const snapshot = JSON.parse(readFileSync(new URL('app/generated/content.json', root), 'utf8'));
  const publishedIds = new Set(Object.values(snapshot).flat().map(row => row.id));
  const drafts = db.prepare("SELECT id FROM content_records WHERE status != 'published'").all();
  assert.ok(drafts.length > 0);
  for (const draft of drafts) assert.equal(publishedIds.has(draft.id), false, draft.id);
  const publicRows = db.prepare('SELECT id FROM public_content').all();
  assert.equal(publicRows.length, publishedIds.size);
  assert.equal(snapshot.settings[0].registrationUrl, null);
  assert.equal(snapshot.settings[0].headline, '在往返之間，認識日南。');
  assert.equal(snapshot.programs.length, 3);
  assert.equal(snapshot.chapters.length, 4);
  db.close();
});

test('database rejects invalid payloads, statuses and duplicate content IDs', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('db/migrations/0001_content.sql', root), 'utf8'));
  const insert = db.prepare('INSERT INTO content_records (id,kind,status,source,updated_at,payload) VALUES (?,?,?,?,?,?)');
  assert.throws(() => insert.run('bad','articles','published','test','2026-09-10','invalid JSON'));
  assert.throws(() => insert.run('bad','articles','invited','test','2026-09-10','{}'));
  insert.run('one','articles','draft','test','2026-09-10','{}');
  assert.throws(() => insert.run('one','articles','draft','test','2026-09-10','{}'));
  db.close();
});

test('rebuilding the database is deterministic and does not append duplicates', () => {
  const file = new URL('app/generated/content.json', root);
  const before = readFileSync(file, 'utf8');
  execFileSync(process.execPath, [new URL('scripts/build-content.mjs', root).pathname]);
  assert.equal(readFileSync(file, 'utf8'), before);
});
