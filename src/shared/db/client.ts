import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import type { AppDatabase } from './database';
import * as schema from './schema';

// Single local database: the source of truth for the app (AGENTS.md → Architecture Rules).
const expoDb = openDatabaseSync('app-gym.db');

// `satisfies` keeps the expo-sqlite type (the migrator needs it) and proves that repositories
// typed against AppDatabase accept the real client.
export const db = drizzle(expoDb, { schema }) satisfies AppDatabase;
