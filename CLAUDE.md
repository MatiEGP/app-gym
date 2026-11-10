@AGENTS.md

# Claude Workflow

Project-specific rules for Claude Code. The human-facing explanation lives in [docs/working-with-claude.md](docs/working-with-claude.md).

The user explicitly authorizes delegating implementation of approved issues to fresh `general-purpose` agents with `model: sonnet` and the effort level set by the risk tier below.

## 1. Milestone planning

Trigger: the user asks to plan or start a milestone (e.g. "planifiquemos M2").

1. Run the `story-slicer` agent on the milestone scope (README roadmap row, existing issues in that milestone, relevant AGENTS.md rules).
2. Return a summary table: proposed issue title, user story, acceptance criteria, size (S/M), `area:*`, risk tier.
3. Stop and wait for approval or changes. Never create issues before approval.
4. Create the approved issues with `gh`, following the issue template structure, labels, and milestone.

## 2. Issue implementation

Trigger: the user asks to implement an issue (e.g. "vamos con el issue #12").

1. Read the issue. If acceptance criteria are missing or ambiguous, stop and ask one question.
2. Classify the risk tier and state it in one line before starting.
3. Update `main`, then create the branch `<type>/<issue>-<kebab-desc>`.
4. Delegate per tier (table below). The handoff must include:
   - the issue body verbatim and the instruction to read `AGENTS.md` first;
   - `## Allowed edit surfaces` with exact paths or narrow globs;
   - the verification policy below, with the kind assigned to each acceptance criterion;
   - the verification commands to run and report as `<command>: <result>`;
   - no git operations, no new dependencies, no edits outside the surfaces.
5. Review the returned diff against the allowed surfaces, then run lint, typecheck, and tests.
6. Blockers get one correction round from the same agent. If they persist, fix inline or ask the user.
7. If the work involved a significant decision (hard to reverse, affects several features, or chosen between real alternatives; see `docs/adr/README.md`), write its ADR from `docs/adr/template.md` and add it to the index in the same PR. Superseding an ADR means a new ADR plus `Superseded by` on the old one.
8. Commit (Conventional Commits, no AI attribution), push, and open the PR from the template with `Closes #N`, filling the acceptance criteria evidence table. Never merge: the user merges.

## 3. Milestone closing

Trigger: the last issue of a milestone is merged, or the user asks to close a milestone.

1. Verify on a fresh clone of `main`: install with the frozen lockfile, lint, typecheck, tests; check that every closed issue was closed by its own PR.
2. Check ADR coverage: every significant decision taken during the milestone has an ADR; propose missing ones to the user.
3. Write `docs/milestones/mN-<name>.md` following `docs/milestones/m0-foundations.md`: goal and result, what was built (each area linked to its ADR and PR), problems caught, lessons, next steps. Link it from the README and mark the milestone done in the roadmap.
4. Get the user's review of the report before opening its PR; close the GitHub milestone only when the user asks.

## Verification policy

Applies to every implementation path: delegated agents and inline work by the parent session alike.

Before writing code, assign each acceptance criterion one verification kind, in this order of preference:

| Kind | When | How | Evidence in the PR |
|------|------|-----|--------------------|
| Automated test | The criterion is observable through code: domain rules, use cases, UI behavior, error states | Write the test first, observe it fail (RED), implement until it passes (GREEN), then refactor | Test name + `pnpm test` result |
| Command probe | Tooling or config behavior: lint, typecheck, build, CLI, CI | Run the command; for "must fail" criteria, introduce the fault temporarily, observe the failure, revert it | `<command>: <result>` |
| Manual check | Needs a device or external service: install on the phone, cloud console | Exact steps for the user to run | Steps + who checked and the result |

- Prefer the higher kind whenever possible; never downgrade a testable criterion to a probe or manual check.
- Tests go through the public interface (use cases, rendered UI), live next to the code as `*.test.ts(x)`, and stay committed as regression tests.
- Probe faults are never committed.
- Every bug fix starts with a failing test that reproduces it.
- A criterion without evidence is not done: report it as pending in the PR instead of checking it.

## Risk tiers

| Tier | Typical scope | Implementation |
|------|---------------|----------------|
| Low | UI, presentational components, pure domain rules, local CRUD | Sonnet agent, effort `low` |
| Medium | Logic with edge cases: volume, sets, PRs, timers, notifications | Sonnet agent, effort `medium` |
| High | Sync, RLS policies, migrations, auth, CI/release | Inline by the parent session, with deeper review |

When unsure between two tiers, pick the higher one.

## Parallelism

Run several implementation agents at once only when the user asks for several issues and their edit surfaces are disjoint. Shared files (DB schema, i18n resources, navigation) are edited by the parent at the end. Git is always owned by the parent session.
