# 0016. Keep seeded and custom exercises in one local table, seeded at startup

- **Status:** Accepted
- **Date:** 2026-11-16 (options decided while planning M1 on 2026-11-11)
- **Deciders:** MatiEGP
- **Related:** [#48](https://github.com/MatiEGP/app-gym/issues/48), [ADR 0003](0003-offline-first-local-sqlite.md), [ADR 0005](0005-drizzle-and-expo-sqlite-with-startup-migrations.md)

## Context and problem statement

M1 ships a built-in exercise catalog and lets the user add custom exercises. Workouts (M2) and routines (M4) will reference exercises by id, and M5 will sync user data to Supabase, so ids must be identical on every device and the table must carry the synced-table columns from day one. Merged migrations can never be edited ([ADR 0005](0005-drizzle-and-expo-sqlite-with-startup-migrations.md)), and the seeded list will keep growing (#49). Where do seeded exercises live, and how do they reach each device?

## Decision drivers

- One list and one query for the catalog and, later, the M2 exercise picker.
- Stable ids across devices, so workouts reference the same exercise everywhere.
- Changing the seeded list must not require a new migration each time.
- Fully offline, and ready for M5 sync without a schema rework.
- Few irreversible schema changes during M1.

## Considered options

1. One `exercises` table for seeded and custom rows; seeded rows have fixed UUIDs in code and are inserted at startup
2. Seeded exercises as static data in code; only custom exercises in the database
3. One table, with the seeded rows inserted by a SQL migration

## Decision outcome

**Chosen: option 1**, because it gives one query and stable ids, and the seeded list ships as code that is applied on every start, not as an immutable migration.

How it works:

- Table `exercises` (migration `0001`, the only M1 migration): `id`, `user_id`, `name`, `primary_muscle_group`, `secondary_muscle_groups` (JSON array), `equipment` (nullable), `origin` (`seeded` or `custom`), `updated_at`, `deleted_at`. Every column M1 needs is created at once.
- Seeded exercises live in `src/features/exercises/domain/seeded-exercises.ts` with fixed UUIDs that never change. Their names are stored as Spanish data, not i18n keys.
- After migrations, the app inserts the seeded rows that are missing (`insert … on conflict (id) do nothing`), so starting again changes nothing and new seeded exercises arrive with an app update.
- `user_id` stays null until sign-in exists (M5). Seeded rows never sync: they ship with the app. The Supabase table arrives with M5.
- Muscle groups and equipment are fixed lists owned by the exercises feature and validated when rows are read. There are no `CHECK` constraints, because changing one in SQLite requires rebuilding the table.
- Secondary muscle groups are a JSON array instead of a join table: the muscle-group filter matches the primary group only, and a join table would be one more synced table.
- No tracking type (weight × reps, duration) yet: M2 decides it with an additive migration.

### Consequences

- **Good:** the catalog, search, filters, and the M2 picker read one table, and every device shares the seeded ids.
- **Good:** growing the seeded list is a code change reviewed like any other, with no migration.
- **Bad / trade-offs:** the seeding runs on every start. It is one `insert or ignore` statement over about 100 rows.
- **Bad / trade-offs:** `insert or ignore` never updates or removes a seeded row that already exists. Renaming or retiring a seeded exercise needs explicit handling when it first happens (#49 decides).
- **Bad / trade-offs:** values in `primary_muscle_group`, `secondary_muscle_groups`, and `equipment` are validated only by the app, and the JSON column cannot be indexed.
- **Follow-ups:** M5 defines the Supabase `exercises` table, its RLS, and how a user's custom rows are claimed at first sign-in.

## Pros and cons of the options

### One table, seeded at startup

- ✅ One query and one id space for seeded and custom exercises.
- ✅ Seeded list changes without migrations.
- ❌ A startup step, and existing seeded rows are not updated automatically.

### Static seeded data in code

- ✅ No seeding step; the list is always the shipped one.
- ❌ Every list, search, and picker query merges two sources.
- ❌ Workouts would reference ids that do not exist in the database, so foreign keys and joins cannot cover seeded exercises.

### Seeded rows in a SQL migration

- ✅ Uses the existing migration path; no new startup code.
- ❌ Every change to the seeded list becomes a new migration, and merged migrations are immutable.
- ❌ The seeded data would be SQL instead of typed TypeScript checked against the muscle group and equipment lists.

## Evidence

- Implementation: chained PRs for #48 (domain and starter data, persistence and use cases, startup seeding and catalog screen).
- `src/features/exercises/application/catalog.test.ts` runs against an in-memory SQLite ([ADR 0015](0015-test-persistence-with-in-memory-sqlite.md)): seeding twice keeps the same ids without duplicates, and seeded rows have `user_id` and `deleted_at` null, `updated_at` set, and origin `seeded`.
