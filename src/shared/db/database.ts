import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type * as schema from './schema';

// The database type repositories depend on: any synchronous Drizzle SQLite database with the app
// schema. The app passes the expo-sqlite client; tests pass an in-memory one from `test-db.ts`
// (ADR 0015).
export type AppDatabase = BaseSQLiteDatabase<'sync', unknown, typeof schema>;
