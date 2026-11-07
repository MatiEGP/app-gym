# AGENTS.md

> Instructions for AI coding agents working in this repository. Keep this file concise and up to date.

## Project Overview

- **Purpose:** Personal gym companion app to log live workouts, manage unlimited routines, and review session stats.
- **Status:** prototype
- **Scope of v1:** workouts (timer, exercises, sets, notes, rest timer), routines, exercise catalog, history/summary, muscle map, Supabase sync. **Out:** social features, feed, comments, articles, iOS distribution.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | TypeScript (strict) | TODO: pin at init |
| App | Expo + Expo Router (React Native) | TODO: pin SDK at init |
| Styling | NativeWind | TODO |
| State | Zustand | TODO |
| Local DB | expo-sqlite + Drizzle ORM | TODO |
| Backend | Supabase (Postgres, Auth, RLS) | — |
| Tests | Jest (jest-expo) + React Native Testing Library | TODO |
| Package manager | pnpm | TODO |

## Commands

Run from the repository root. CI runs the same commands.

```bash
pnpm install --frozen-lockfile   # Install dependencies
pnpm start                       # Expo dev server (TODO: confirm script after init)
pnpm lint                        # ESLint (TODO: confirm)
pnpm typecheck                   # tsc --noEmit (TODO: confirm)
pnpm test                        # Jest (TODO: confirm)
eas build -p android --profile preview   # APK (TODO: confirm eas.json)
```

## Project Structure

```text
app/                 # Expo Router routes; thin, only compose feature screens
src/features/<name>/ # workout-session, routines, exercises, history, settings, auth
  domain/            # pure TS entities and rules (no React/Expo/DB imports)
  application/       # use cases; the only entry point for UI
  infrastructure/    # SQLite (Drizzle) repositories, adapters
  ui/                # containers + presentational components
src/shared/          # db, sync, ui (design system), i18n
supabase/            # migrations (SQL + RLS) and seed
```

## Architecture Rules

- Local SQLite is the source of truth; Supabase is a sync target. The app must work fully offline.
- `domain/` never imports React, Expo, Drizzle, or Supabase.
- UI calls use cases; it never queries the DB or Supabase directly.
- Features never import another feature's internals; only its `application/` exports.
- Timers store timestamps (`startedAt`, `restEndsAt`), never accumulated ticks.
- Every synced table has `id` (client uuid), `user_id`, `updated_at`, `deleted_at` (soft delete).
- Every Supabase table has RLS enabled with `user_id = auth.uid()` policies.
- Weights are stored in kg; unit conversion happens only in the UI.

## Code Conventions

- **Language:** code, identifiers, comments, commits, and docs in English. UI copy in Spanish via i18n keys; never hardcode user-facing strings.
- **Naming:** files `kebab-case.ts`, components `PascalCase.tsx`, hooks `useX`, use cases as verbs (`finishWorkout`).
- **Commits:** Conventional Commits with feature scope, e.g. `feat(workout-session): add rest timer`. No AI attribution.
- **Branching:** GitHub Flow. Branch `<type>/<issue>-<kebab-desc>` (e.g. `feat/12-rest-timer`) from `main`; squash-merge PRs; `main` is protected.
- **PRs:** one issue per PR, ~400 changed lines max (split into chained PRs otherwise), title in Conventional Commit format, body with `Closes #N` and how to test.

## Testing

- Jest; tests live next to code as `*.test.ts(x)`.
- Every domain rule and use case has unit tests; every bug fix starts with a failing test.
- UI: test containers with React Native Testing Library through user-visible behavior.
- E2E (Maestro) for the critical flow: start workout → add set → finish (from M7).

## Definition of Done

- [ ] Lint, typecheck, and tests pass locally and in CI.
- [ ] Acceptance criteria of the issue are met.
- [ ] Works offline (airplane mode) when the feature touches workouts.
- [ ] No secrets, debug code, or unused files.
- [ ] i18n keys added for new UI copy; docs updated if behavior or commands changed.

## Agent Boundaries

- Ask before adding dependencies, changing the architecture, the DB schema, or CI.
- Never commit secrets. Use `.env.example` for configuration keys.
- Never disable RLS or weaken lint rules, tests, or CI gates to make a change pass.
- Never run destructive commands (data deletion, force push, `supabase db reset` on remote) without explicit approval.
