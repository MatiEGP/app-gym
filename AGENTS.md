# AGENTS.md

> Instructions for AI coding agents working in this repository. Keep this file concise and up to date.

## Project Overview

- **Purpose:** Personal gym companion app to log live workouts, manage unlimited routines, and review session stats.
- **Status:** prototype
- **Scope of v1:** workouts (timer, exercises, sets, notes, rest timer), routines, exercise catalog, history/summary, muscle map, Supabase sync. **Out:** social features, feed, comments, articles, iOS distribution.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | TypeScript (strict) | 6.0 |
| Runtime | Node.js | 22+ (`.nvmrc`) |
| App | Expo SDK + Expo Router, React Native, React | SDK 58, Router 58, RN 0.88, React 19.3 |
| Styling | NativeWind | TODO (#10) |
| State | Zustand | TODO (M2) |
| Local DB | expo-sqlite + Drizzle ORM | TODO (#12) |
| Backend | Supabase (Postgres, Auth, RLS) | — |
| Tests | Jest (jest-expo) + React Native Testing Library + test-renderer | Jest 30, jest-expo 58, RNTL 14, test-renderer 1.3 |
| Package manager | pnpm via Corepack (`packageManager` field) | 10.34.9 |

## Commands

Run from the repository root. CI (`.github/workflows/ci.yml`, job `verify`) runs install, lint, typecheck, and test on every PR and on pushes to `main`; `verify` is a required status check for merging into `main`.

```bash
pnpm install --frozen-lockfile   # Install dependencies
pnpm start                       # Expo dev server
pnpm android                     # Expo dev server, opens Android
pnpm typecheck                   # tsc --noEmit
pnpm expo install <package>      # Add Expo/RN packages (SDK-compatible versions); never plain `pnpm add` for them
pnpm lint                        # ESLint (eslint-config-expo + Prettier, zero warnings) + prettier --check
pnpm format                      # Prettier --write, then eslint --fix
pnpm test                        # Jest (jest-expo preset)
eas build -p android --profile preview   # APK (TODO: #15)
```

## Project Structure

```text
src/app/             # Expo Router routes; thin, only compose feature screens
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
- **Formatting:** Prettier (single quotes, trailing commas, width 100); run `pnpm format` before committing. Markdown is not auto-formatted.
- **Commits:** Conventional Commits with feature scope, e.g. `feat(workout-session): add rest timer`. No AI attribution.
- **Branching:** GitHub Flow. `main` is the only long-lived branch (no `dev` branch). Branch `<type>/<issue>-<kebab-desc>` (e.g. `feat/12-rest-timer`) from `main`; squash-merge PRs; `main` is protected.
- **PRs:** one issue per PR, ~400 changed lines max (split into chained PRs otherwise), title in Conventional Commit format, body with `Closes #N` and how to test.

## Environments & Releases

| Environment | Code | App build | Supabase |
|-------------|------|-----------|----------|
| development | feature branch | Expo dev build (`development` profile) | local (`supabase start`) |
| preview | `main` | APK, EAS `preview` profile, separate app id | cloud project `staging` |
| production | tag `vX.Y.Z` | APK, EAS `production` profile | cloud project `prod` |

- `main` is always releasable but not released: production is a tag, not a branch.
- Release: `git tag vX.Y.Z && git push --tags`; CI builds the production APK. Hotfixes follow the same path (`fix/<issue>-...` → PR → new patch tag).
- SemVer, `0.x` until v1.0: `feat` bumps minor, `fix` bumps patch.
- Schema changes only through `supabase/migrations`: test locally, apply to `staging` on merge, to `prod` on tag. Never edit schema in the dashboard.
- Each environment has its own env vars (EAS profile env / GitHub Environments). Never point a non-production build at `prod`.

## Testing

- Jest; tests live next to code as `*.test.ts(x)`.
- RNTL 14: `render`, `fireEvent`, and `act` are async; always `await` them. `test-renderer` minor must match the React minor (React 19.3 → 1.3).
- Every domain rule and use case has unit tests; every bug fix starts with a failing test.
- UI: test containers with React Native Testing Library through user-visible behavior.
- E2E (Maestro) for the critical flow: start workout → add set → finish (from M7).
- Test-first for every change: each acceptance criterion is verified by an automated test, a command probe, or a manual check, in that order of preference, with evidence in the PR (full policy: `CLAUDE.md` → Verification policy).

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
