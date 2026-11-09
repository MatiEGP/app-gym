# 0006. Supabase as the backend, with local, staging, and production environments

- **Status:** Accepted
- **Date:** 2026-11-08 (backend chosen 2026-11-07)
- **Deciders:** MatiEGP
- **Related:** [#13](https://github.com/MatiEGP/app-gym/issues/13), [#14](https://github.com/MatiEGP/app-gym/issues/14), [ADR 0003](0003-offline-first-local-sqlite.md), [docs/environments.md](../environments.md)

## Context and problem statement

The app needs authentication and a server copy of each user's data to sync to ([ADR 0003](0003-offline-first-local-sqlite.md)). The budget is zero, so the backend must have a usable free tier. Schema changes must be testable before they reach real data, and the backend should not lock the app into a proprietary data model. Which backend, and how many environments?

## Decision drivers

- Free tier sufficient for a personal app.
- Relational data (routines → exercises → sets) and per-user access control at the database level.
- Local development without touching cloud data.
- A staging environment that behaves like production.
- Low latency from Argentina.

## Considered options

1. Supabase (Postgres, Auth, Row Level Security), with two free cloud projects (staging, prod) plus a local stack
2. Supabase with its branching feature for staging
3. Firebase (Firestore, Auth)
4. Custom backend (Node.js API + Postgres) on a free host

## Decision outcome

**Chosen: Supabase, with a local Docker stack for development and two free cloud projects, `app-gym-staging` and `app-gym-prod`, both in `sa-east-1` (São Paulo)**, because it provides real Postgres with Row Level Security and Auth on a free tier, and separate projects give an isolated staging at no cost.

- **Local:** `pnpm supabase:start` runs the stack in Docker; the CLI is a pinned dev dependency.
- **Staging and prod:** linked with the CLI; migrations live in `supabase/migrations` and reach the cloud only with an explicit `db push --remote`. Prod receives migrations only from release tags.
- **Keys:** the app uses only the URL and the **publishable** key (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`); Supabase replaced the legacy anon key with publishable keys, so the variable was renamed.

### Consequences

- **Good:** standard Postgres and SQL migrations; the data model is portable.
- **Good:** RLS policies (`user_id = auth.uid()`) enforce per-user access at the database, not only in app code.
- **Good:** staging mirrors prod (same region, same configuration) at no cost.
- **Bad / trade-offs:** free projects pause after about a week without activity and must be resumed from the dashboard (a keep-alive job may be added later).
- **Bad / trade-offs:** local development requires Docker Desktop running.
- **Bad / trade-offs:** no per-PR preview databases (that is the paid branching feature); CI will run migrations against the local stack instead.
- **Follow-ups:** sync tables, RLS policies, and their tests in M5.

## Pros and cons of the options

### Supabase with two free projects

- ✅ Postgres, Auth, RLS, and a CLI with local development.
- ✅ Free; staging isolated from prod.
- ❌ Two projects to keep in step; project pausing on the free tier.

### Supabase branching

- ✅ Automatic preview databases per pull request.
- ❌ Paid plan only, and branch usage is billed outside the spend cap.

### Firebase

- ✅ Generous free tier, mature offline SDKs.
- ❌ Document model is a poor fit for relational workout data and reporting queries.
- ❌ Proprietary data model; harder to leave.

### Custom backend

- ✅ Full control.
- ❌ Auth, hosting, and security are all on one developer; no meaningful free hosting for an always-on API and database.

## Evidence

- Local stack: clean clone → `supabase start` (12 containers) → `supabase stop` (0 left): [PR #34](https://github.com/MatiEGP/app-gym/pull/34).
- Cloud projects, refs, and value locations: [PR #35](https://github.com/MatiEGP/app-gym/pull/35), [docs/environments.md](../environments.md).
- Region decision: the first projects were created in two different US regions; while still empty they were recreated together in São Paulo, the cheapest moment to change an irreversible setting.
