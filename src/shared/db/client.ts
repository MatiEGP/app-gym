import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// Single local database: the source of truth for the app (AGENTS.md → Architecture Rules).
const expoDb = openDatabaseSync('app-gym.db');

export const db = drizzle(expoDb, { schema });
