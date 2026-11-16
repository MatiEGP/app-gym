# 0017. Use cases take repository ports, bound to the app database in each feature's entry

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** MatiEGP
- **Related:** [#48](https://github.com/MatiEGP/app-gym/issues/48), [ADR 0004](0004-feature-sliced-hexagonal-architecture-enforced-by-lint.md), [ADR 0015](0015-test-persistence-with-in-memory-sqlite.md)

## Context and problem statement

The exercises feature is the first one with use cases and a repository, so it sets the pattern for the others. [ADR 0004](0004-feature-sliced-hexagonal-architecture-enforced-by-lint.md) makes `application/` the only public entry of a feature and forbids `ui/` from touching the database, but does not say how a use case gets its repository. Use-case tests need an in-memory database ([ADR 0015](0015-test-persistence-with-in-memory-sqlite.md)) while the app uses the expo-sqlite client. How are use cases wired to their repository?

## Decision drivers

- Use cases testable against an in-memory SQLite, without mocking modules.
- UI calls plain functions, with no wiring code in components.
- No new dependency and no framework for a single-user app.
- Easy to follow for each new feature.

## Considered options

1. Use cases take a repository port; `application/index.ts` binds them to the app database and is the feature's public API
2. A React context that provides repositories to the UI
3. A dependency-injection library
4. Use cases import the app database client directly

## Decision outcome

**Chosen: option 1**, because it keeps use cases plain functions that tests call with any repository, and keeps the wiring in one file per feature.

How it works:

- `application/<port>.ts` declares the repository interface the use cases need.
- `application/<use-case>.ts` exports functions that take the repository as their first argument.
- `infrastructure/sqlite-<name>-repository.ts` implements the port over an `AppDatabase`.
- `application/index.ts` creates the SQLite repository over the app client and exports the use cases with the repository already applied. UI and other features import only this file.

Tests:

- Use-case tests call the functions in `application/<use-case>.ts` with a SQLite repository over `createTestDb()`.
- UI tests mock their feature's `application` module, because `ui/` may not import the database, not even in tests (ADR 0004).

### Consequences

- **Good:** each use case is tested against real SQL with no module mocks.
- **Good:** UI and other features see plain functions such as `listExercises()`.
- **Bad / trade-offs:** each feature repeats a small binding file.
- **Bad / trade-offs:** importing a feature's `application/index.ts` opens the app database, so tests of code that imports it mock that module or `@/shared/db/client`.
- **Follow-ups:** revisit if a use case needs several repositories or a transaction across features; a context or a small composition root may fit better then.

## Pros and cons of the options

### Ports bound in `application/index.ts`

- ✅ Plain functions for the UI; real-SQL tests for use cases.
- ❌ One binding file per feature.

### React context

- ✅ Dependencies swappable per render tree.
- ❌ Use cases become reachable only from React, and M5 sync runs outside the UI.

### Dependency-injection library

- ✅ Central wiring.
- ❌ A dependency and a framework concept for a handful of repositories.

### Use cases import the client directly

- ✅ Least code.
- ❌ Tests must mock the client module to reach an in-memory database, and the use cases are tied to expo-sqlite.

## Evidence

- `src/features/exercises/application/index.ts` binds `listExercises`, `getExercise`, and `seedExerciseCatalog`.
- `src/features/exercises/application/catalog.test.ts` calls the use cases with a SQLite repository over an in-memory database.
