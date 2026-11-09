# 0014. Issue-driven workflow with risk-tiered delegation

- **Status:** Accepted
- **Date:** 2026-11-07
- **Deciders:** MatiEGP
- **Related:** [#3](https://github.com/MatiEGP/app-gym/issues/3), [docs/working-with-claude.md](../working-with-claude.md), [docs/project-management.md](../project-management.md), [ADR 0011](0011-test-first-verification-policy.md)

## Context and problem statement

One developer owns product, architecture, and delivery. To move faster, routine implementation can be handed off, including to AI coding assistants used as support tools, while the developer keeps every decision. Handing off work safely requires that the work is fully specified, that the riskiest parts never leave the owner's direct control, and that nothing merges without proof. How is work planned, assigned, and accepted?

## Decision drivers

- The developer decides scope, design, and every merge.
- Work specified well enough that whoever implements it needs no extra context.
- Risky areas (data migrations, security, CI, releases) get the closest supervision.
- Routine work handed off at low cost.
- Every change accepted on evidence, not trust.

## Considered options

1. Issue-driven workflow: milestone slicing, acceptance criteria, risk tiers that decide who implements, test-first handoffs, owner review and merge
2. Ad hoc: implement directly from conversation, no written criteria
3. Delegate everything uniformly, regardless of risk

## Decision outcome

**Chosen: the issue-driven workflow with risk tiers.**

1. **Plan once per milestone.** The milestone is sliced into small, vertical issues with acceptance criteria; the developer approves the list before any issue is created.
2. **Classify each issue's risk.**

   | Tier | Typical scope | Implementation |
   |------|---------------|----------------|
   | Low | UI, presentational components, pure domain rules, local CRUD | Delegated, with low-cost tooling |
   | Medium | Logic with edge cases: volume, sets, timers, notifications | Delegated, with more careful tooling |
   | High | Sync, RLS, migrations, auth, CI, releases | Implemented in the main session under the developer's direct supervision |

3. **Hand off by the issue, not by conversation.** The handoff carries the issue verbatim, the allowed files, the verification kind for each criterion ([ADR 0011](0011-test-first-verification-policy.md)), and no permission for git operations or new dependencies.
4. **Accept on evidence.** The main session reviews the diff and runs lint, typecheck, and tests; the PR carries the evidence table; the developer merges.

### Consequences

- **Good:** context lives in issues and the repository, not in someone's memory; any contributor or tool can pick up an issue.
- **Good:** the riskiest changes are never delegated; in M0 every issue was high risk, so all of them stayed under direct supervision.
- **Good:** a poorly written issue surfaces immediately as a question before implementation; the fix goes into the issue, not only the chat.
- **Bad / trade-offs:** more upfront writing per issue; slicing a milestone takes a planning session.
- **Follow-ups:** delegation by tier starts with M1, whose issues include low- and medium-risk work.

## Pros and cons of the options

### Issue-driven, risk-tiered

- ✅ Control proportional to risk; cost proportional to value.
- ✅ Traceable: issue → branch → PR with evidence → squash commit.
- ❌ Planning and writing overhead.

### Ad hoc

- ✅ No overhead.
- ❌ Context lost between sessions; nothing to verify against.

### Uniform delegation

- ✅ Simplest rule.
- ❌ Data migrations and security changes handed off with the same supervision as a button color.

## Evidence

- Workflow rules: [CLAUDE.md](../../CLAUDE.md) and [docs/working-with-claude.md](../working-with-claude.md) ([PR #4](https://github.com/MatiEGP/app-gym/pull/4)).
- M0 sliced into 12 approved issues; every one classified high risk and implemented under direct supervision, each closed by its own PR with an evidence table.
