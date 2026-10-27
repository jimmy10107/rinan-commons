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
  assert.equal(snapshot.programs.length, 9);
  assert.deepEqual(snapshot.programs.filter(p => p.day === '2026-10-25').map(p => p.start), ['08:00','14:00','16:30','18:00']);
  assert.deepEqual(snapshot.programs.filter(p => p.day === '2026-10-31').map(p => p.start), ['17:00','18:00','18:45','19:35','20:20']);
  assert.equal(snapshot.programs.filter(p => p.day === '2026-10-24').length, 0);
  assert.equal(snapshot.settings[0].address, '437 臺中市大甲區孟春里中山路二段 6 號');
  assert.equal(snapshot.settings[0].handbookUrl, null);
  assert.doesNotMatch(JSON.stringify(snapshot), /中山路二段 1 號對面/);
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
