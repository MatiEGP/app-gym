# Project Management Guide

How work flows from idea to merged code: every change starts as an issue, lives on the Kanban board, ships through one branch and one PR, and closes the issue on merge.

## Quick path (one issue, end to end)

1. **Create the issue** from a template (Feature, Bug, or Task). Add `area:*` and `priority:*` labels and a milestone.
2. **Refine it** until it has clear acceptance criteria, then move it to **Ready**.
3. **Start it**: assign yourself, move to **In progress**, and branch from `main`:
   `git switch -c feat/12-rest-timer`
4. **Commit** in small Conventional Commits: `feat(workout-session): add rest timer`.
5. **Open a PR** with title `feat(workout-session): add rest timer` and body `Closes #12`. It moves to **Review**.
6. **Squash-merge** when CI is green. The issue closes and moves to **Done**; the branch is deleted.

## Board setup (one time)

Create the board in the GitHub UI: **Profile → Projects → New project → Board**, name it `app-gym`, then link it to the repository (**Project settings → Linked repositories**).

| Field | Type | Values |
|-------|------|--------|
| Status | Single select | Backlog, Ready, In progress, Review, Done |
| Priority | Single select | P1, P2, P3 |
| Size | Single select | S (< 1 day), M (1–2 days), L (split it) |
| Milestone | Built-in | M0 … M7 |

Enable these built-in workflows in **Project → Workflows**:

| Workflow | Sets Status to |
|----------|----------------|
| Item added to project | Backlog |
| Pull request linked to issue | Review |
| Item closed | Done |
| Pull request merged | Done |
| Auto-add to project (filter `is:issue,pr is:open`) | — |

Add a second view as a **Table** grouped by Milestone to see the roadmap.

## Columns and their rules

| Column | Entry rule | WIP limit |
|--------|-----------|-----------|
| Backlog | Any idea, even rough | — |
| Ready | Has acceptance criteria, size S or M, labels, milestone | — |
| In progress | Assigned, branch created | **2** |
| Review | PR open and linked with `Closes #N` | — |
| Done | PR merged, issue closed | — |

An `L` item never enters **Ready**: split it into vertical slices first (the `story-slicer` agent helps).

## Labels

| Group | Labels | Use |
|-------|--------|-----|
| Type | `type:feature`, `type:bug`, `type:chore`, `type:docs` | Set by the issue template |
| Area | `area:workout-session`, `area:routines`, `area:exercises`, `area:history`, `area:settings`, `area:auth`, `area:sync`, `area:infra` | Matches the feature folder and the commit scope |
| Priority | `priority:P1`, `priority:P2`, `priority:P3` | P1 blocks the current milestone |

## Milestones

One milestone per roadmap step (`M0 Foundations` … `M7 v1.0`, see the [README](../README.md#roadmap)). Work only on the current milestone; new ideas go to **Backlog** without a milestone.

## Naming cheat sheet

| Thing | Format | Example |
|-------|--------|---------|
| Issue title | `<type>(<area>): <description>` | `feat(routines): allow unlimited routines` |
| Branch | `<type>/<issue>-<kebab-desc>` | `feat/14-unlimited-routines` |
| Commit | `<type>(<area>): <imperative description>` | `feat(routines): remove routine count limit` |
| PR title | Same as the squash commit | `feat(routines): allow unlimited routines` |
| PR body | Closing keyword + issue | `Closes #14` |

> The closing keyword must be `Closes #14` (keyword, space, `#`, number). `# Closes` is a Markdown heading and links nothing.

## Checklist before moving to Done

- [ ] PR merged with squash and CI green
- [ ] Issue closed automatically by `Closes #N`
- [ ] Branch deleted
- [ ] Follow-up ideas captured as new Backlog issues
