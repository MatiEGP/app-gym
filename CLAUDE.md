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
   - test-first: one failing test per acceptance criterion, observed RED, then implementation to GREEN;
   - the verification commands to run and report as `<command>: <result>`;
   - no git operations, no new dependencies, no edits outside the surfaces.
5. Review the returned diff against the allowed surfaces, then run lint, typecheck, and tests.
6. Blockers get one correction round from the same agent. If they persist, fix inline or ask the user.
7. Commit (Conventional Commits, no AI attribution), push, and open the PR from the template with `Closes #N`. Never merge: the user merges.

## Risk tiers

| Tier | Typical scope | Implementation |
|------|---------------|----------------|
| Low | UI, presentational components, pure domain rules, local CRUD | Sonnet agent, effort `low` |
| Medium | Logic with edge cases: volume, sets, PRs, timers, notifications | Sonnet agent, effort `medium` |
| High | Sync, RLS policies, migrations, auth, CI/release | Inline by the parent session, with deeper review |

When unsure between two tiers, pick the higher one.

## Parallelism

Run several implementation agents at once only when the user asks for several issues and their edit surfaces are disjoint. Shared files (DB schema, i18n resources, navigation) are edited by the parent at the end. Git is always owned by the parent session.
