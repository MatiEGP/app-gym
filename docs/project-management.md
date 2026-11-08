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

**The board tracks issues only.** An issue is the unit of work; its PR shows up in the issue's **Development** panel through `Closes #N`. Adding PRs as cards would duplicate every task in two columns.

Configure these built-in workflows in **Project → ⋯ → Workflows**:

| Workflow | Setting | Why |
|----------|---------|-----|
| Auto-add to project | Repository `app-gym`, filter `is:issue` | New issues land on the board automatically |
| Item added to project | Status → Backlog | Everything starts in Backlog |
| Pull request linked to issue | Status → Review | Opening a PR with `Closes #N` moves the issue to Review |
| Item closed | Status → Done | Merging the PR closes the issue and moves it to Done |
| Auto-close issue | On | Moving a card to Done by hand closes the issue |
| Pull request merged | **Off** | No PR cards on the board, so it never applies |

- GitHub Free allows **one** auto-add workflow per project, hence the single `is:issue` filter.
- Auto-add does **not** add existing items: add older issues by hand (type `#` in a column and pick them).
- Reopening an issue does not move its card; move it back from Done yourself.

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

The WIP limit is set per column (**⋯ → Set column limit**) and is **visual only**: GitHub highlights the count when it is exceeded but does not block anything.

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
>
> ⚠️ Squash merges copy the whole PR body into the commit message, and GitHub closes **every** issue written after a closing keyword (`close`, `fix`, `resolve` and their variants), even inside HTML comments. Mention other issues without a closing keyword ("related to #14", "follow-up of #14"). `pr-template.test.js` guards the template itself.

## Branches, environments, and releases

**There is no `dev` branch.** `main` is the only long-lived branch; feature branches live for a few days. Production is a **tag**, not a branch: merging to `main` changes nothing on the phone until a version is tagged and built.

Why: with one developer, a `dev` branch doubles every merge and drifts from `main`. Protected `main` + CI already gives an always-releasable integration branch.

```text
feat/12-rest-timer ──PR + CI──▶ main ──tag v0.3.0──▶ production APK
        │                         │
   dev build (local)        preview APK (optional check)
```

| Environment | Code | App build | Supabase |
|-------------|------|-----------|----------|
| development | feature branch | Expo dev build | local (`supabase start`) |
| preview | `main` | APK, `preview` profile, installs next to production | `staging` project |
| production | tag `vX.Y.Z` | APK, `production` profile | `prod` project |

### Releasing a version

1. Merge the PRs planned for the version into `main`.
2. Optional: install the preview APK built from `main` and smoke test it.
3. Tag and push: `git tag v0.3.0 && git push --tags`.
4. CI builds the production APK and applies pending migrations to `prod`.
5. Install the APK and close the milestone if it is complete.

### Hotfix

Same path as any change: issue → `fix/45-...` → PR → `main` → patch tag (`v0.3.1`). No `hotfix/` or `release/` branches.

### Versioning

SemVer, `0.x` until v1.0. Since the last tag: any `feat` → bump minor; only `fix` → bump patch; any `!` (breaking) after v1.0 → bump major.

### When to revisit

Add a `release/x.y` branch only if an older version must be patched while the next one is in development (for example, after publishing to the Play Store).

## Checklist before moving to Done

- [ ] PR merged with squash and CI green
- [ ] Issue closed automatically by `Closes #N`
- [ ] Branch deleted
- [ ] Follow-up ideas captured as new Backlog issues
