# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-09
- **Deciders:** MatiEGP
- **Related:** [AGENTS.md](../../AGENTS.md), [docs/working-with-claude.md](../working-with-claude.md)

## Context and problem statement

App Gym is designed and owned by one developer, who evaluates and approves every architectural choice. Work happens across many short sessions, some of them with AI coding assistants in the toolchain. Decisions discussed in a session (why Expo, why offline-first, why NativeWind v4 and not v5) are lost when it ends, and anyone or anything picking up the work later starts without that context. Without a durable record, the same questions get re-litigated and good decisions get silently reverted. How do we keep the *why* behind the architecture?

## Decision drivers

- Decisions must survive the session that made them and be available to every contributor and tool.
- Recording must be cheap enough to actually happen on a solo project.
- The record should show trade-offs, not only the outcome, so a decision can be revisited when its assumptions change.
- The project doubles as a portfolio piece: reasoning should be readable by someone outside the project.

## Considered options

1. Architecture Decision Records (MADR format) in `docs/adr/`
2. Rules only in `AGENTS.md`
3. Decisions in GitHub issues and PR descriptions only

## Decision outcome

**Chosen: ADRs in MADR format, one file per decision in `docs/adr/`**, because they keep the reasoning next to the code, versioned with it, and MADR forces the comparison of options that the other approaches skip.

`AGENTS.md` keeps the **rules** every contributor and coding tool must follow; ADRs keep the **reasons**. Issues and PRs keep the **evidence** and are linked from each ADR.

### Consequences

- **Good:** whoever changes the code next can read why things are the way they are before changing them.
- **Good:** a superseded decision is not deleted: a new ADR replaces it and the old one points to it, so the history stays readable.
- **Bad / trade-offs:** each significant decision costs a short document; small or reversible choices do not get an ADR.
- **Follow-ups:** write an ADR when a decision is hard to reverse, affects several features, or was debated between options.

## Pros and cons of the options

### ADRs in MADR format

- ✅ Versioned with the code, reviewed in PRs like any change.
- ✅ Captures options and trade-offs, not only the outcome.
- ✅ Widely recognized format.
- ❌ Extra writing for every significant decision.

### Rules only in AGENTS.md

- ✅ Already read by contributors and coding tools at the start of every session.
- ❌ Loaded into every session's context, so it must stay short: no room for reasoning.
- ❌ Rules without reasons invite "why not just…?" reversals.

### Issues and PR descriptions only

- ✅ Zero extra files; evidence lives there anyway.
- ❌ Scattered across dozens of threads; hard to find the current decision.
- ❌ Not part of the repository's history in a reviewable form.

## Evidence

- This log: [docs/adr/README.md](README.md).
- Rules that reference these decisions: [AGENTS.md](../../AGENTS.md).
