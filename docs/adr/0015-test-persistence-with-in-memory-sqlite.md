# 0015. Test persistence against an in-memory SQLite with sql.js

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** MatiEGP
- **Related:** [#47](https://github.com/MatiEGP/app-gym/issues/47), [ADR 0005](0005-drizzle-and-expo-sqlite-with-startup-migrations.md), [ADR 0011](0011-test-first-verification-policy.md)

## Context and problem statement

M1 adds the first feature table, and its acceptance criteria are about persistence: seeded rows keep fixed ids across launches, soft delete sets `deleted_at`, and every row carries the sync columns. Jest could not run SQLite: `expo-sqlite` is a native module, so the only database test mocked both the migrator and the client. Under the verification policy ([ADR 0011](0011-test-first-verification-policy.md)), those criteria would fall back to manual device checks. How do repository and migration tests reach a real SQLite database in Jest, on Windows and on the CI runner?

## Decision drivers

- Real SQL: tests run the committed migrations and the queries repositories issue, not a fake.
- Works on Windows (development) and Ubuntu (CI) with no native build step or toolchain.
- Supported by Drizzle 0.45 through its public API.
- Fast and isolated: a fresh database per test.
- No change to app code paths, and no Node types leaking into app code that runs on React Native.

## Considered options

1. sql.js (SQLite compiled to WebAssembly) through Drizzle's `sql-js` driver
2. better-sqlite3 through Drizzle's `better-sqlite3` driver
3. Node's built-in `node:sqlite`
4. Repository ports with in-memory fakes, and manual device checks for the SQLite adapters

## Decision outcome

**Chosen: sql.js**, because it runs real SQLite inside Jest with no native binary, so it behaves the same on Windows and on CI, and Drizzle ships both a driver and a migrator for it.

How it works:

- `createTestDb()` (`src/shared/db/test-db.ts`) opens a new in-memory sql.js database and applies every migration in `src/shared/db/migrations` with Drizzle's `sql-js` migrator. Each call returns an isolated database.
- `AppDatabase` (`src/shared/db/database.ts`) is the type repositories depend on: any synchronous Drizzle SQLite database with the app schema. The app passes the expo-sqlite client and tests pass `createTestDb()`. `client.ts` declares the client with `satisfies AppDatabase`, so `pnpm typecheck` proves the real client fits.
- Tests read migrations from the folder, not from the app bundle (`migrations.js`). Using the bundle would need a cast to the Expo database type, and Jest caches the Babel-inlined SQL keyed by `migrations.js` alone, so an edited `.sql` file can keep serving its old content (see Evidence).

### Consequences

- **Good:** persistence criteria (seeding, fixed ids, soft delete, sync columns) become automated tests instead of device checks.
- **Good:** a broken migration fails `pnpm test`, locally and in CI, before any device applies it.
- **Bad / trade-offs:** tests run the sql.js build of SQLite, not the one bundled with expo-sqlite, so version-specific SQL behavior could differ. The upgrade path on a real install keeps a device check.
- **Bad / trade-offs:** tests apply migrations from the folder while the app applies the `migrations.js` bundle that drizzle-kit generates; a migration missing from the bundle would only show on a device.
- **Bad / trade-offs:** two more dev dependencies (`sql.js`, `@types/sql.js`).
- **Follow-ups:** repositories in `infrastructure/` take an `AppDatabase` instead of importing `client.ts`. App code never imports `test-db.ts`, because sql.js is a dev dependency.

## Pros and cons of the options

### sql.js

- ✅ Pure WebAssembly: no install script (which pnpm 10 blocks by default) and no per-platform binary.
- ✅ Drizzle 0.45 driver and migrator (`drizzle-orm/sql-js`), with the same synchronous API as the expo-sqlite driver.
- ❌ A different SQLite build from the one on the device.

### better-sqlite3

- ✅ Fast and widely used; Drizzle driver; synchronous API.
- ❌ Native addon: its install script must be allowlisted in pnpm 10, and it needs a prebuilt binary for each Node version and OS, or a C++ toolchain on Windows.

### node:sqlite

- ✅ Built into Node 22; no dependency.
- ❌ Still experimental in Node 22: loading it prints an `ExperimentalWarning`.
- ❌ No Drizzle 0.45 driver.

### Ports with in-memory fakes

- ✅ No dependency; fast.
- ❌ Fakes run no SQL: migrations, constraints, and queries stay untested until a device check.

## Evidence

- `src/shared/db/test-db.test.ts`: applies every committed migration (compared against the journal), round-trips an `app_meta` row, and gives every call its own empty database.
- Fault probe: changing `CREATE TABLE` to `CREATE TABLEX` in migration `0000` made all three tests fail with `near "TABLEX": syntax error`; the change was reverted.
- Cache probe: after appending 12 bytes to migration `0000`, a test that imported `migrations.js` still read the 147-byte inlined SQL, while the file on disk had 159 bytes.
