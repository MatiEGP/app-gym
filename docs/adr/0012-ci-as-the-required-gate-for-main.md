# 0012. CI as the required gate for main

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** MatiEGP
- **Related:** [#8](https://github.com/MatiEGP/app-gym/issues/8), [ADR 0007](0007-github-flow-with-tag-releases-and-squash-merges.md), [ADR 0011](0011-test-first-verification-policy.md)

## Context and problem statement

`main` must always be releasable ([ADR 0007](0007-github-flow-with-tag-releases-and-squash-merges.md)), and the architecture and type rules only matter if they cannot be skipped. Checks run on the developer's machine depend on discipline and on the state of that machine, including generated files that a clean checkout does not have. The repository is public, so the pipeline itself is part of the attack surface. How do we guarantee that every change entering `main` passes the same checks?

## Decision drivers

- No change reaches `main` without lint, typecheck, and tests passing.
- Checks run on a clean checkout, not on the developer's machine.
- Same commands locally and in CI.
- Supply-chain safety for a public repository.
- Free (public repository minutes).

## Considered options

1. GitHub Actions `verify` job, required by the branch ruleset
2. Local Git hooks only (for example, pre-commit and pre-push)
3. CI that runs but is not required to merge

## Decision outcome

**Chosen: a GitHub Actions job named `verify`, required by the `protect-main` ruleset.** It runs on every pull request and every push to `main`: frozen-lockfile install, `pnpm lint`, `pnpm typecheck`, `pnpm test --ci`. The required check accepts only results reported by GitHub Actions.

Hardening: actions pinned by full commit SHA (with version comments), a read-only token (`permissions: contents: read`), a 15-minute timeout, and superseded runs cancelled.

### Consequences

- **Good:** merges are blocked until `verify` passes; nothing depends on memory or habits.
- **Good:** the clean checkout catches what a developer machine hides.
- **Bad / trade-offs:** renaming the job silently breaks the required check; the workflow carries a comment saying so.
- **Bad / trade-offs:** "require branches to be up to date" is off: with one developer and squash merges it would only force extra rebases. Turn it on if collaborators join.
- **Follow-ups:** migration and Row Level Security tests against the local Supabase stack (M5); end-to-end tests (M7); coverage once domain logic exists.

## Pros and cons of the options

### Required Actions check

- ✅ Enforced by the platform, on a clean environment.
- ✅ Visible history of every run.
- ❌ Minutes of latency per PR.

### Local hooks only

- ✅ Instant feedback.
- ❌ Easy to bypass; run on the developer's machine state, not a clean checkout.

### Non-required CI

- ✅ Visibility without blocking.
- ❌ A red check can still be merged; the gate exists only on paper.

## Evidence

- Workflow and ruleset: [PR #23](https://github.com/MatiEGP/app-gym/pull/23). A throwaway PR with a failing assertion turned `verify` red at the test step; it was closed and its branch deleted.
- The gate earned its place in the next milestone issue: CI failed a type check that passed locally because a git-ignored generated file supplied CSS module types ([PR #26](https://github.com/MatiEGP/app-gym/pull/26)).
