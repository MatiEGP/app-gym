# M0 Foundations — milestone report

**Goal:** a walking skeleton. An Android app that boots, with the full toolchain, quality gates, local database, backend environments, and an installable build, so that every later milestone only adds features.

**Result:** delivered between 2026-11-07 and 2026-11-09. 17 issues closed by 17 pull requests, each with an evidence table. The app boots on a real Android phone from a self-contained 94 MB APK, with no PC and no network.

| At a glance | |
|-------------|---|
| Platform | Expo SDK 58 (React Native 0.88, React 19.3), TypeScript 6 strict, Android |
| Data | SQLite + Drizzle ORM on the device; Supabase (Postgres) local + staging + prod |
| Quality | ESLint + Prettier with architecture rules, 43 tests, required CI check on `main` |
| Delivery | EAS development build and an on-demand preview APK workflow |
| Decisions | 14 Architecture Decision Records ([docs/adr](../adr/README.md)) |

## Why this project

App Gym is a personal workout tracker. Commercial apps such as Hevy cap free routines at four; the owner needs five or more and wants features of their own. The app must work during a gym session: a session timer, sets logged one by one, rest timers that alert with the screen locked, and no dependence on the gym's signal. Those constraints drove the first architectural decisions ([ADR 0002](../adr/0002-native-android-app-with-expo.md), [ADR 0003](../adr/0003-offline-first-local-sqlite.md)).

## What was built

### Platform and app shell

- Expo SDK 58 with Expo Router (routes in `src/app`), strict TypeScript, Android-only configuration. → [ADR 0002](../adr/0002-native-android-app-with-expo.md), PR [#19](https://github.com/MatiEGP/app-gym/pull/19)
- NativeWind v4 with design tokens in `src/shared/ui/tokens.ts`: components use theme classes, never hardcoded colors. → [ADR 0009](../adr/0009-nativewind-v4-with-design-tokens.md), PR [#26](https://github.com/MatiEGP/app-gym/pull/26)
- i18n with typed keys: Spanish UI, Spanish fallback for any device language, and a mistyped key fails the type check. → [ADR 0010](../adr/0010-typed-i18n-with-spanish-fallback.md), PR [#27](https://github.com/MatiEGP/app-gym/pull/27)

### Architecture

Feature folders with hexagonal layers (`domain`, `application`, `infrastructure`, `ui`). The boundaries are not a convention: `pnpm lint` and CI reject a React import in `domain/`, database access from `ui/`, or reaching into another feature's internals. The rules have 29 regression tests. → [ADR 0004](../adr/0004-feature-sliced-hexagonal-architecture-enforced-by-lint.md), PR [#25](https://github.com/MatiEGP/app-gym/pull/25)

### Data

- **On the device:** SQLite is the source of truth ([ADR 0003](../adr/0003-offline-first-local-sqlite.md)). Drizzle ORM provides a typed schema; drizzle-kit generates versioned migrations; a `MigrationGate` applies them at startup and shows a Spanish error screen if one fails. → [ADR 0005](../adr/0005-drizzle-and-expo-sqlite-with-startup-migrations.md), PR [#32](https://github.com/MatiEGP/app-gym/pull/32)
- **Backend:** Supabase. A local stack in Docker for development, and two free cloud projects (staging, prod) in São Paulo. Migrations reach the cloud only with an explicit `--remote`; prod only from release tags. → [ADR 0006](../adr/0006-supabase-backend-and-environments.md), PRs [#34](https://github.com/MatiEGP/app-gym/pull/34), [#35](https://github.com/MatiEGP/app-gym/pull/35), [docs/environments.md](../environments.md)

### Quality

- Lint (ESLint + Prettier, zero warnings), typecheck, and Jest with React Native Testing Library; two Jest projects, one for app code and one for tooling configuration. → PRs [#20](https://github.com/MatiEGP/app-gym/pull/20), [#21](https://github.com/MatiEGP/app-gym/pull/21)
- CI job `verify` required to merge into `main`; actions pinned by commit SHA, read-only token. → [ADR 0012](../adr/0012-ci-as-the-required-gate-for-main.md), PR [#23](https://github.com/MatiEGP/app-gym/pull/23)
- Verification policy: every acceptance criterion is proven by an automated test, a command probe, or a manual device check, in that order of preference, with evidence in the PR. → [ADR 0011](../adr/0011-test-first-verification-policy.md), PR [#18](https://github.com/MatiEGP/app-gym/pull/18)

### Delivery

| Build | Size | Runs without a PC | How |
|-------|------|-------------------|-----|
| Development | ~300 MB installed (debug) | No (loads code from Metro) | Manual EAS build when native code changes |
| Preview | 94.3 MB APK | Yes, fully offline | **Preview APK** workflow button on `main` |

→ [ADR 0008](../adr/0008-eas-build-profiles-and-on-demand-preview.md), PRs [#33](https://github.com/MatiEGP/app-gym/pull/33), [#36](https://github.com/MatiEGP/app-gym/pull/36)

### Process

GitHub Flow with squash merges and tag-based releases ([ADR 0007](../adr/0007-github-flow-with-tag-releases-and-squash-merges.md)); a Kanban board; issues with acceptance criteria and risk tiers that decide who implements and how closely the owner supervises ([ADR 0014](../adr/0014-issue-driven-workflow-with-risk-tiered-delegation.md)). AI coding assistants are part of the toolchain as support for implementation; scope, design, and every merge stay with the owner. All M0 issues were high risk and were implemented under direct supervision. Package management with pnpm pinned through Corepack ([ADR 0013](../adr/0013-pnpm-via-corepack-with-hoisted-linker.md)).

## Problems caught along the way

Each of these was found by a check designed into the process, before it reached a user.

| Problem | Caught by | Outcome |
|---------|-----------|---------|
| Lint passed with an unused variable: Expo's config reports it as a warning | "Must fail" probe ([ADR 0011](../adr/0011-test-first-verification-policy.md)) | `--max-warnings 0`; the probe is the reason the rule works |
| The architecture rules also blocked the *allowed* `application/` imports | Tests for what must pass, not only what must fail | Gitignore-style patterns cannot re-include children of an excluded parent; fixed with a separate regex |
| Type check passed locally but failed in CI on `import '../global.css'` | Required CI on a clean checkout ([ADR 0012](../adr/0012-ci-as-the-required-gate-for-main.md)) | A git-ignored generated file had hidden the error; types now committed |
| Deleting a test migration by hand left the migration journal pointing to it | `db:generate` probe | Folder regenerated; rule added: generated migrations are never edited |
| An unrelated issue was closed by a merge | Milestone review | The PR template's example `Closes #12` became part of a squash commit; template fixed and guarded by a test |
| Supabase projects created in two different US regions | Environment setup review | Recreated together in São Paulo while still empty, the cheapest moment |
| A NativeWind version verified only up to the previous SDK | Bundle probe + device probe | Styles proven in the real Android bundle and on the phone |

## Lessons

- **"Works on my machine" is not evidence.** A clean checkout in CI found an error the developer machine could not.
- **Test what is allowed, not only what is forbidden.** Rules that only had "must fail" tests would have shipped a bug that blocked valid code.
- **Irreversible settings are cheap only at the start.** Regions, app ids, and signing keys were decided before any data existed.
- **Process controls beat trust.** Required CI, evidence tables, and lint-enforced boundaries hold no matter who, or what tool, writes the code.

## What is next

**M1 — Exercise catalog:** seeded and custom exercises with muscle groups. It is the first milestone with low- and medium-risk issues, so the risk-tiered delegation of [ADR 0014](../adr/0014-issue-driven-workflow-with-risk-tiered-delegation.md) starts being used.

Known follow-ups: ESLint 10 is blocked upstream ([#22](https://github.com/MatiEGP/app-gym/issues/22)); an arm64-only APK could reduce its size; app variants would let development and preview builds be installed side by side.
