# 0013. pnpm via Corepack, with the hoisted node linker

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** MatiEGP
- **Related:** [#5](https://github.com/MatiEGP/app-gym/issues/5), [#13](https://github.com/MatiEGP/app-gym/issues/13)

## Context and problem statement

The project needs one package manager, the same version on the developer's machine, in CI, and in EAS cloud builds, and a lockfile that reproduces the same dependency tree everywhere. React Native's bundler (Metro) and native tooling have a history of trouble with symlinked `node_modules`. Which package manager, and how is its version pinned?

## Decision drivers

- Reproducible installs (frozen lockfile) in every environment.
- One pinned version, picked up automatically by CI and EAS.
- Compatibility with Metro and Expo native tooling.
- Fast installs and disk efficiency.

## Considered options

1. pnpm, pinned through the `packageManager` field and Corepack, with `nodeLinker: hoisted`
2. npm
3. pnpm with its default isolated (symlinked) layout

## Decision outcome

**Chosen: pnpm 10.34.9, pinned in `package.json` (`packageManager`) and run through Corepack, with `nodeLinker: hoisted`**, which is what `create-expo-app` configures for pnpm. The GitHub Actions setup step and EAS read the same `packageManager` field, and Node is pinned in `.nvmrc`.

### Consequences

- **Good:** identical tool versions locally, in CI, and on EAS; `pnpm install --frozen-lockfile` everywhere.
- **Good:** pnpm 10 blocks dependency install scripts by default; only the Supabase CLI is allowed to run one, explicitly (`allowBuilds`).
- **Bad / trade-offs:** pnpm 12 is newer, but the Corepack bundled with Node 22 cannot launch it, so the project stays on pnpm 10 until Node/Corepack catch up.
- **Bad / trade-offs:** `corepack enable` needs an administrator terminal on Windows; until then, every command needs a `corepack` prefix.
- **Bad / trade-offs:** auto-installed optional peers can drift from Expo's expected versions; `react-dom` is pinned through `overrides` to the version the SDK expects.

## Pros and cons of the options

### pnpm via Corepack, hoisted

- ✅ Fast, disk-efficient, strict lockfile; the version is part of the repository.
- ✅ Hoisted layout avoids Metro symlink issues.
- ❌ Corepack setup on Windows; pnpm version limited by the Node's Corepack.

### npm

- ✅ Ships with Node; nothing to set up.
- ❌ Slower; no workspace-level controls such as blocking install scripts or overrides in one file.

### pnpm isolated layout

- ✅ Strictest dependency isolation.
- ❌ Riskier with Metro and native tooling; Expo's own template opts out of it.

## Evidence

- Pinning and `nodeLinker`: [PR #19](https://github.com/MatiEGP/app-gym/pull/19); install verified with the frozen lockfile on a fresh clone.
- `react-dom` override removing the unmet-peer warning: [PR #21](https://github.com/MatiEGP/app-gym/pull/21).
- Supabase CLI install script allowed: [PR #34](https://github.com/MatiEGP/app-gym/pull/34).
