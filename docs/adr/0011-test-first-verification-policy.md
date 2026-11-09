# 0011. Test-first verification policy with evidence per acceptance criterion

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** MatiEGP
- **Related:** [#17](https://github.com/MatiEGP/app-gym/issues/17), [CLAUDE.md → Verification policy](../../CLAUDE.md), [ADR 0012](0012-ci-as-the-required-gate-for-main.md)

## Context and problem statement

Every issue has acceptance criteria, but "done" was initially a matter of opinion. Some criteria are logic that a unit test can prove; others are tooling behavior (a lint rule must fail on an unused variable) or physical facts (the APK installs on the phone) that no unit test can observe. Test-first was written down only for one implementation path. How do we prove that each criterion is met, whoever writes the code?

## Decision drivers

- Every criterion backed by evidence, not by a claim.
- Prefer automated, permanent proof (regression tests) whenever possible.
- A clear, honest path for what cannot be automated.
- The same rules for every implementation path.
- Evidence a reviewer can check in the pull request.

## Considered options

1. A verification policy with three ordered kinds — automated test, command probe, manual check — and an evidence table in every PR
2. Unit tests only, with no explicit treatment of non-testable criteria
3. Manual QA at the end of each milestone

## Decision outcome

**Chosen: the three-kind verification policy.** Before writing code, each acceptance criterion gets one kind, in order of preference:

| Kind | When | Rule |
|------|------|------|
| Automated test | Observable through code | Written first, seen failing (RED), then passing (GREEN); stays as a regression test |
| Command probe | Tooling and configuration | Run the command; for "must fail" criteria, introduce the fault temporarily, observe it, revert it; faults are never committed |
| Manual check | Device or external service | Exact steps; who checked and the result go in the PR |

A testable criterion is never downgraded to a probe or a manual check. A criterion without evidence is reported as pending, never checked off. Every PR has an "Acceptance criteria evidence" table.

### Consequences

- **Good:** most criteria end as permanent regression tests (43 tests at the end of M0, including tests for lint rules and the PR template).
- **Good:** probes caught real defects: a lint configuration that ignored warnings, a broken migration journal, and allowed imports blocked by an over-broad rule.
- **Bad / trade-offs:** more upfront work per issue, and some proofs need a person with the phone.
- **Bad / trade-offs:** proving "must fail" behavior in CI needs a throwaway branch and pull request, so the failing code never lands.
- **Follow-ups:** end-to-end tests with Maestro (M7) will turn some manual checks into automated ones.

## Pros and cons of the options

### Three-kind policy with evidence tables

- ✅ Every criterion proven, with the strongest available kind.
- ✅ Reviewers see the evidence without rerunning everything.
- ❌ More documentation per PR.

### Unit tests only

- ✅ Simple rule.
- ❌ Tooling and device criteria end up unverified or "tested" with meaningless tests.

### Manual QA per milestone

- ✅ Cheap during development.
- ❌ Defects found weeks after the code was written; no regression protection.

## Evidence

- Policy: [CLAUDE.md → Verification policy](../../CLAUDE.md), [PR #18](https://github.com/MatiEGP/app-gym/pull/18); PR template evidence table.
- Two Jest projects: `app` (jest-expo) and `tooling` (plain Node for configuration tests such as ESLint rules): [PR #25](https://github.com/MatiEGP/app-gym/pull/25).
- Mutation check on the lint rule tests: removing a rule made exactly its cases fail.
