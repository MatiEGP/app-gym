# 0003. Offline-first: local SQLite is the source of truth

- **Status:** Accepted
- **Date:** 2026-11-07
- **Deciders:** MatiEGP
- **Related:** [#12](https://github.com/MatiEGP/app-gym/issues/12), [ADR 0005](0005-drizzle-and-expo-sqlite-with-startup-migrations.md), [ADR 0006](0006-supabase-backend-and-environments.md)

## Context and problem statement

A workout is logged set by set over an hour or more, often in a gym with weak or no mobile signal. Losing a session because a request failed mid-workout would make the app useless. The owner still wants their data backed up and available on another device. Where does the data live, and what role does the backend play?

## Decision drivers

- A workout in progress must never depend on the network.
- Every action must feel instant (no spinners between sets).
- Data must survive a phone change: a backend copy is needed.
- Single user first, so sync conflicts are rare.
- Keep the sync design simple enough for one developer.

## Considered options

1. Offline-first: local SQLite is the source of truth; Supabase is a sync target
2. Online with tolerance: Supabase is the source of truth; only the active workout is persisted locally
3. Always online: every action goes to the backend

## Decision outcome

**Chosen: offline-first with local SQLite as the source of truth and Supabase as a sync target**, because it is the only option where a full workout works with zero connectivity, and for a single user a custom outbox with last-write-wins is enough to sync.

### Consequences

- **Good:** the app works in airplane mode; reads and writes are local and immediate.
- **Good:** the backend is replaceable: it only receives synced copies.
- **Bad / trade-offs:** the schema exists twice (SQLite locally, Postgres in Supabase) and must evolve in step.
- **Bad / trade-offs:** sync must be designed and tested explicitly (planned for M5): client-generated UUIDs, `updated_at`, and soft deletes (`deleted_at`) on every synced table.
- **Follow-ups:** the Definition of Done requires checking offline behavior for any feature that touches workouts.

## Pros and cons of the options

### Offline-first with local SQLite

- ✅ Full functionality without network.
- ✅ Instant UI; no loading states for local data.
- ❌ Two schemas and a sync layer to maintain.

### Online with tolerance

- ✅ Single source of truth on the server; simpler data model.
- ❌ History, routines, and the exercise catalog are unavailable without signal.
- ❌ Partial local persistence still needs most of the sync complexity.

### Always online

- ✅ Simplest implementation.
- ❌ A dropped connection breaks the session in the middle of a workout.

## Evidence

- Rules in [AGENTS.md → Architecture Rules](../../AGENTS.md): SQLite is the source of truth; synced tables carry `id`, `user_id`, `updated_at`, `deleted_at`.
- Local database and startup migrations: [PR #32](https://github.com/MatiEGP/app-gym/pull/32).
- Preview APK verified running with no PC and no network: [PR #36](https://github.com/MatiEGP/app-gym/pull/36).
