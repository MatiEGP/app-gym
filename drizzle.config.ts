import { defineConfig } from 'drizzle-kit';

// Local SQLite schema and migrations (Drizzle docs, Expo SQLite). Generate with `pnpm db:generate`.
export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './src/shared/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
});
