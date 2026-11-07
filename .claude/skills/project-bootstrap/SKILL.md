---
name: project-bootstrap
description: "Trigger: new project, init project, bootstrap repo, create AGENTS.md, project setup, audit structure. Define project rules, stack, and structure in AGENTS.md."
license: Apache-2.0
metadata:
  author: "matia"
  version: "1.0"
---

## Activation Contract

Use this skill when the user starts a project, asks for an `AGENTS.md`, or wants to audit an existing project's structure and conventions.

## Hard Rules

- **Write NOTHING before explicit approval.** Show the full draft and the file plan, then STOP.
- Never overwrite an existing file. Show a diff and ask first.
- Never move, rename, or delete code. Structural changes are **recommendations** only.
- Never invent commands. Each command must come from manifests or scripts, or be marked `TODO: confirm`.
- Never write secret values. Only `.env.example` with placeholder values.
- Keep `AGENTS.md` under ~150 lines. It is loaded into every agent session, so every line costs tokens.

## Decision Gates

| Repository state | Path |
|------------------|------|
| Empty or only README/LICENSE | **A: Interview** |
| Has source code or manifests | **B: Analyze** |
| `AGENTS.md` already exists | **B**, and propose updates as a diff |
| `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, or similar exist | Propose consolidating into `AGENTS.md`. The tool-specific files should only point to it. |

## Execution Steps

**Path A: Interview.** Ask at most 3 questions per round. Give a suggested default for each. Cover these topics:

1. Purpose, target users, and scope of the first version.
2. Stack: language, frameworks, database, and package manager. Recommend one option if the user is unsure.
3. Repository shape: single app or monorepo.
4. Testing strategy and quality gates.
5. Hosting, CI (GitHub Actions), and repository visibility.
6. Conventions: commits, branching, and the language for code and docs.

**Path B: Analyze.**

1. Read the manifests, lockfiles, configs, folder tree, CI workflows, and README.
2. Detect the stack, commands, structure, and conventions that already exist.
3. Report the gaps: missing files, inconsistencies, and anti-patterns (secrets committed, no lockfile, missing scripts, mixed structures).

**Both paths:**

1. Fill in [assets/AGENTS.template.md](assets/AGENTS.template.md).
2. Build a file plan: `AGENTS.md` plus any missing scaffolding (`.gitignore`, `.editorconfig`, `.env.example`, README skeleton). Never generate application code.
3. Present it using the Output Contract, and wait for approval.
4. Apply only what the user approved. Then list the next steps, for example: run `gentle-ai skill-registry refresh` if gentle-ai is used, or set up the CI pipeline.

## Output Contract

```markdown
## Project Bootstrap — <name>
**Path:** A (new) | B (existing)
### Findings        (Path B only: what exists, what is missing, what to fix)
### AGENTS.md draft (full content)
### File plan       (create / update / recommend-only, one line each)
### Decisions to confirm
Reply "approve", or tell me what to change.
```

## References

- [assets/AGENTS.template.md](assets/AGENTS.template.md): AGENTS.md structure.
