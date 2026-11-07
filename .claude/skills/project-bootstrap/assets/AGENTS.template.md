# AGENTS.md

> Instructions for AI coding agents working in this repository. Keep this file concise and up to date.

## Project Overview

- **Purpose:** <one sentence: what problem this solves and for whom>
- **Status:** <prototype | MVP | production>
- **Scope of the current version:** <what is in, what is explicitly out>

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | <e.g., TypeScript> | <x.y> |
| Frontend | <framework> | <x.y> |
| Backend | <framework> | <x.y> |
| Database | <engine / ORM> | <x.y> |
| Package manager | <pnpm / npm / poetry / ...> | <x.y> |

## Commands

Run these from the repository root. CI runs the same commands.

```bash
<install>      # Install dependencies (frozen lockfile)
<dev>          # Start the development environment
<lint>         # Lint
<typecheck>    # Type check / compile
<test>         # Run tests
<build>        # Production build
```

## Project Structure

```text
<tree of the main folders, with a short comment on each>
```

## Architecture Rules

- <e.g., Domain logic never imports from framework or infrastructure code.>
- <e.g., Shared contracts live in packages/contracts; apps never duplicate types.>

## Code Conventions

- **Language:** code, identifiers, comments, and docs in <English>.
- **Naming:** <files, components, variables>.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`...). No AI attribution.
- **Branching:** <e.g., short-lived feature branches; PRs into main>.

## Testing

- <framework, where tests live, naming pattern>
- <what must be tested before a PR: e.g., every use case and bug fix>

## Definition of Done

- [ ] Lint, type check, build, and tests pass locally and in CI.
- [ ] Acceptance criteria of the issue are met.
- [ ] No secrets, debug code, or unused files.
- [ ] Docs updated if behavior or commands changed.

## Agent Boundaries

- Ask before adding dependencies, changing the architecture, or modifying CI.
- Never commit secrets. Use `.env.example` for configuration keys.
- Never weaken lint rules, tests, or CI gates to make a change pass.
- Never run destructive commands (data deletion, force push) without explicit approval.
