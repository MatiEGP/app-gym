# 0004. Feature-sliced hexagonal architecture, enforced by lint

- **Status:** Accepted
- **Date:** 2026-11-08 (structure chosen 2026-11-07; enforcement added 2026-11-08)
- **Deciders:** MatiEGP
- **Related:** [#9](https://github.com/MatiEGP/app-gym/issues/9), [ADR 0011](0011-test-first-verification-policy.md), [ADR 0014](0014-issue-driven-workflow-with-risk-tiered-delegation.md)

## Context and problem statement

The app will grow feature by feature (workout session, routines, exercises, history, settings, auth, sync), and code is written in short sessions, often from an issue description rather than full memory of earlier work. Business rules such as volume, set counts, or personal records must stay testable without React Native, and data access must stay swappable for sync. Conventions written only in a document are easy to break by accident. How should the code be organized, and how do we keep it that way?

## Decision drivers

- Domain rules testable in plain TypeScript, without React, Expo, or a database.
- Features that can be built and reasoned about independently.
- Boundaries enforced by tooling, not by memory or good intentions: they must hold for any contributor, human or tool, and under time pressure.
- No new dependencies just for tooling, if avoidable.

## Considered options

1. Feature folders with hexagonal layers, boundaries enforced by ESLint's core `no-restricted-imports`
2. Same structure, boundaries enforced by `eslint-plugin-boundaries` or `import/no-restricted-paths`
3. Layer-first folders (`components/`, `services/`, `screens/`) with conventions only

## Decision outcome

**Chosen: feature folders with hexagonal layers, enforced by the core `no-restricted-imports` rule**, because the structure "screams" the product's features, keeps the domain pure, and the core rule enforces it with no extra dependencies.

```text
src/features/<feature>/
  domain/          pure TypeScript: entities and rules
  application/     use cases; the only public entry point of a feature
  infrastructure/  SQLite repositories and adapters
  ui/              containers and presentational components
src/shared/        db, i18n, ui (design system), sync
src/app/           Expo Router routes; thin, only compose screens
```

`pnpm lint` (and therefore CI) rejects:

- `domain/` importing React, React Native, Expo, Drizzle, Supabase, or shared data access.
- `ui/` importing the database, Supabase, or any `infrastructure/`.
- A feature importing another feature's internals instead of its `application/`.
- Relative imports that climb more than one folder (`../../`); the `@/` alias is used instead.

### Consequences

- **Good:** a violation fails CI, so the rule holds regardless of who writes the code.
- **Good:** domain logic is unit-testable in isolation.
- **Bad / trade-offs:** `no-restricted-imports` cannot resolve the `@/` alias, so the "climb at most one folder" convention is required to cover relative imports.
- **Bad / trade-offs:** ESLint does not merge the same rule across config blocks, so each block repeats its full pattern list (generated per feature in `eslint.config.js`).
- **Follow-ups:** new feature folders are picked up automatically; the rules themselves have 29 regression tests.

## Pros and cons of the options

### Core `no-restricted-imports`

- ✅ No new dependencies.
- ✅ Simple, explicit patterns, testable through the ESLint API.
- ❌ String patterns, not resolved paths: needs the relative-import convention.

### `eslint-plugin-boundaries` / `import/no-restricted-paths`

- ✅ Rules expressed as element types and resolved paths.
- ❌ Needs an import resolver for the `@/` alias, available here only as a transitive dependency.
- ❌ One more plugin to keep compatible with ESLint upgrades (see the blocked ESLint 10 upgrade in [#22](https://github.com/MatiEGP/app-gym/issues/22)).

### Layer-first folders with conventions only

- ✅ Familiar to most React developers.
- ❌ Features spread across the whole tree.
- ❌ Nothing prevents a screen from querying the database directly.

## Evidence

- Rules and tests: [`eslint.config.js`](../../eslint.config.js), [`eslint.config.test.js`](../../eslint.config.test.js), [PR #25](https://github.com/MatiEGP/app-gym/pull/25).
- The tests caught a real bug in the first version: a gitignore-style pattern blocked the *allowed* `application/` imports, because children of an excluded parent cannot be re-included.
- The rule shaped later work: `global.css` moved into `src/` so the root layout would not need `../../` ([PR #26](https://github.com/MatiEGP/app-gym/pull/26)).
