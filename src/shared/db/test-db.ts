import { drizzle } from 'drizzle-orm/sql-js';
import { migrate } from 'drizzle-orm/sql-js/migrator';
import initSqlJs, { type SqlJsStatic } from 'sql.js';

import type { AppDatabase } from './database';
import * as schema from './schema';

// Test-only helper: never import it from app code, because sql.js is a dev dependency (ADR 0015).

// Provided by Jest's CommonJS module wrapper. Declared here instead of loading Node types, which
// would make Node globals look available to app code that runs on React Native.
declare const __dirname: string;

let sqlJs: Promise<SqlJsStatic> | undefined;

/**
 * Opens a fresh in-memory SQLite database (sql.js, WebAssembly) with every committed migration
 * applied, read from the same folder `pnpm db:generate` writes to. Each call is isolated.
 */
export async function createTestDb(): Promise<AppDatabase> {
  sqlJs ??= initSqlJs();
  const SQL = await sqlJs;
  const db = drizzle(new SQL.Database(), { schema });
  migrate(db, { migrationsFolder: `${__dirname}/migrations` });
  return db;
}
