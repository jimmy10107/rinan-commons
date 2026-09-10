import { integer, sqliteTable, text, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Mirrors db/migrations/0001_content.sql. No runtime binding is activated.
export const contentRecords = sqliteTable('content_records', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  source: text('source').notNull(),
  updatedAt: text('updated_at').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  payload: text('payload', { mode: 'json' }).notNull(),
}, table => [
  index('content_public_kind').on(table.status, table.kind, table.sortOrder),
  check('valid_payload', sql`json_valid(${table.payload})`),
  check('valid_status', sql`${table.status} IN ('draft','published','archived')`),
  check('valid_kind', sql`${table.kind} IN ('settings','chapters','materials','vendors','performers','places','organizations','programs','articles','spaceUses')`),
  check('source_required', sql`length(${table.source}) > 0`),
]);
