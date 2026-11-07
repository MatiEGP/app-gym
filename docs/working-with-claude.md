# Working with Claude

How to drive this project with Claude Code: you decide **what** gets built and **when it merges**; Claude plans, delegates implementation to lighter models, and reviews the result.

## Quick path

| You say | Claude does | You decide |
|---------|-------------|------------|
| "Planifiquemos M2" | Runs `story-slicer` on the milestone and returns a table of proposed issues | Approve, edit, or drop issues |
| "Aprobado" | Creates the issues in GitHub with labels and milestone | Move them to **Ready** on the board |
| "Vamos con el issue #12" | States the risk tier, branches, delegates, reviews, opens the PR | Review the PR |
| "Mergealo" / you merge | — | The issue closes and moves to **Done** |

## The two phases

### 1. Plan once per milestone

At the start of each milestone, ask Claude to plan it. The `story-slicer` agent splits the milestone into small, vertical, testable issues (size S or M). Claude brings you a summary; nothing is created until you approve.

Why per milestone and not per issue: one planning session gives you the full picture and avoids repeating the analysis for every task.

### 2. Implement issue by issue

```text
"vamos con el issue #N"
  → risk tier announced
  → branch <type>/<N>-<desc> from main
  → agent writes failing tests from the acceptance criteria, then the code
  → Claude reviews the diff + runs lint, typecheck, tests
  → PR with "Closes #N"
  → you merge
```

## Who implements what

| Risk tier | Examples | Who writes the code |
|-----------|----------|---------------------|
| Low | Screens, components, pure domain rules, local CRUD | Sonnet agent, low effort |
| Medium | Volume, sets, PRs, timers, notifications | Sonnet agent, medium effort |
| High | Sync, RLS, migrations, auth, CI/release | Claude directly (main session) |

High-risk work stays in the main session because a mistake there can corrupt data or open a security hole, and tests rarely catch it.

## Why this setup

- **Cheap where it can be:** implementation of well-defined issues runs on Sonnet.
- **Context lives in the repo, not the chat:** agents start without the conversation, so issues must carry complete acceptance criteria and `AGENTS.md` carries the rules.
- **Tests first:** each acceptance criterion becomes a test before the code exists, so verification is objective even with a low-effort model.
- **One owner for git:** only the main session creates branches, commits, and PRs.

## Tips

- Write a good issue and the rest follows. If Claude asks you a question before implementing, the issue was missing something: update the issue, not just the chat.
- Ask for several issues at once ("vamos con #12 y #13") only when they touch different parts of the app; Claude will run them in parallel if their files do not overlap.
- You can override the tier: "hacelo vos directo" or "usá effort medium".
- Use the session model selector for the main session: Opus for planning and high-risk work; Sonnet is enough for routine sessions.

## Next step

Agent-facing rules: [CLAUDE.md](../CLAUDE.md). Board and labels: [project-management.md](project-management.md).
