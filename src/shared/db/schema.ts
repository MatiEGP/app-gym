import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Local-only key/value store for app infrastructure (for example, a future sync cursor or seed
// version). Not synced, so it does not carry the user_id / deleted_at columns that synced tables need.
export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Exercise catalog: seeded exercises (fixed ids, shipped with the app, never synced) and the
// user's custom ones share this table (ADR 0016). Synced-table columns from day one: `user_id`
// stays null until sign-in exists (M5). Muscle groups and equipment are plain text here; the
// exercises feature owns their values and validates them when reading.
export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  name: text('name').notNull(),
  primaryMuscleGroup: text('primary_muscle_group').notNull(),
  secondaryMuscleGroups: text('secondary_muscle_groups', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  equipment: text('equipment'),
  origin: text('origin', { enum: ['seeded', 'custom'] }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
});
