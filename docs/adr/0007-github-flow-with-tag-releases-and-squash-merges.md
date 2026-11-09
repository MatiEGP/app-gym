# 0007. GitHub Flow with tag-based releases and squash merges

- **Status:** Accepted
- **Date:** 2026-11-07
- **Deciders:** MatiEGP
- **Related:** [#1](https://github.com/MatiEGP/app-gym/issues/1), [#28](https://github.com/MatiEGP/app-gym/issues/28), [docs/project-management.md](../project-management.md), [ADR 0012](0012-ci-as-the-required-gate-for-main.md)

## Context and problem statement

The project needs a branching model, a merge strategy, and a definition of "release". There is one developer, no app store, and a phone that only changes when a new APK is installed. A common instinct is to keep a `dev` branch next to `main`. How should code flow from a change to a release?

## Decision drivers

- Minimal ceremony for a single developer.
- `main` always releasable, protected by automated checks.
- A readable history: one commit per change, linked to its issue.
- Releases as explicit, reproducible events.

## Considered options

1. GitHub Flow: short-lived branches into a protected `main`; releases are tags; squash merges
2. GitFlow: `develop` and `main`, release and hotfix branches
3. Trunk-based with direct commits to `main`

## Decision outcome

**Chosen: GitHub Flow with squash merges and tag-based releases.** `main` is the only long-lived branch. Every change starts as an issue, lives on a branch named `<type>/<issue>-<description>`, and enters `main` through a pull request squashed into one Conventional Commit. A release is a tag `vX.Y.Z` (SemVer, `0.x` until v1.0), not a branch: merging changes nothing on the phone until a version is built.

### Consequences

- **Good:** one commit per issue on `main`, each with its PR number; trivial to read and to revert.
- **Good:** no branch drift and no double merges; protected `main` plus required CI does the job a `dev` branch would.
- **Bad / trade-offs:** a long-lived release branch is needed only if an old version must be patched while the next one is developed (for example, after publishing to a store). Revisit then.
- **Bad / trade-offs:** squash merges copy the PR body into the commit message, so every closing keyword in it acts. An example `Closes #12` in a template comment closed an unrelated issue ([#28](https://github.com/MatiEGP/app-gym/issues/28)); a regression test now guards the PR template.
- **Follow-ups:** production builds and prod migrations triggered by tags (M5/M7).

## Pros and cons of the options

### GitHub Flow

- ✅ Lowest ceremony that still gives reviews and CI on every change.
- ✅ Releases decoupled from merges.
- ❌ No built-in place to maintain old versions.

### GitFlow

- ✅ Explicit release and hotfix paths for teams shipping several versions.
- ❌ Every change merged twice; `develop` drifts from `main`.
- ❌ Ceremony without benefit for one developer and one installed version.

### Direct commits to main

- ✅ Fastest possible flow.
- ❌ No PR to run CI against before code lands; no review step; history mixes unrelated changes.

## Evidence

- Branch protection ruleset `protect-main`: no deletion, no force push, PRs required, squash only, required `verify` check.
- Flow, naming, and release steps: [docs/project-management.md](../project-management.md) ([PR #2](https://github.com/MatiEGP/app-gym/pull/2)).
- Squash-message pitfall and its regression test: [PR #29](https://github.com/MatiEGP/app-gym/pull/29).
