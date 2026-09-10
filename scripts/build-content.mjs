import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(path.join(root, '.content'), { recursive: true });
mkdirSync(path.join(root, 'app/generated'), { recursive: true });
const temporary = path.join(root, '.content/content-next.sqlite');
rmSync(temporary, { force: true });
const db = new DatabaseSync(temporary);
try {
  db.exec(readFileSync(path.join(root, 'db/migrations/0001_content.sql'), 'utf8'));
  db.exec(readFileSync(path.join(root, 'content/seed.sql'), 'utf8'));
  if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Content database failed integrity check');
  const output = { settings: [], chapters: [], materials: [], vendors: [], performers: [], places: [], organizations: [], programs: [], articles: [], spaceUses: [] };
  const slugs = new Set();
  for (const row of db.prepare('SELECT * FROM public_content ORDER BY sort_order, id').all()) {
    const payload = JSON.parse(row.payload);
    if (row.kind === 'articles') {
      if (!/^[a-z0-9-]+$/.test(payload.slug) || slugs.has(payload.slug)) throw new Error(`Invalid or duplicate article slug: ${row.id}`);
      slugs.add(payload.slug);
      if (!payload.title || !payload.sections?.length) throw new Error(`Incomplete article: ${row.id}`);
    }
    for (const key of ['href', 'sourceUrl', 'mapUrl', 'handbookUrl', 'registrationUrl']) {
      const value = payload[key];
      if (value && !/^https:\/\//.test(value) && !/^\/(?!\/)/.test(value)) throw new Error(`Unsafe URL: ${row.id}.${key}`);
    }
    if (row.kind === 'vendors' && payload.status !== '已確認') throw new Error(`Unconfirmed vendor cannot be published: ${row.id}`);
    output[row.kind].push({ ...payload, id: row.id, updatedAt: row.updated_at });
  }
  if (output.settings.length !== 1) throw new Error('Exactly one published site settings record required');
  if (output.settings[0].headline !== '在往返之間，認識日南。') throw new Error('Brand headline differs from approved baseline');
  const counts = Object.fromEntries(Object.entries(output).map(([key, rows]) => [key, rows.length]));
  db.close();
  renameSync(temporary, path.join(root, '.content/content.sqlite'));
  writeFileSync(path.join(root, 'app/generated/content.json'), JSON.stringify(output, null, 2) + '\n');
  console.log('SQLite validated; published content exported:', counts);
} catch (error) {
  try { db.close(); } catch {}
  rmSync(temporary, { force: true });
  throw error;
}
