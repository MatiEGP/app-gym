# Architecture Decision Records

Why App Gym is built the way it is. Each record captures one significant decision: its context, the options considered, the choice, and its consequences. Format: [MADR](https://adr.github.io/madr/), using [template.md](template.md). See [ADR 0001](0001-record-architecture-decisions.md) for why this log exists.

Records 0001–0014 were written retroactively at the end of milestone M0 (2026-11-09) from the issues, PRs, and conversations where each decision was made; their dates are the dates of the decisions.

## Index

| ADR | Decision | Status |
|-----|----------|--------|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-native-android-app-with-expo.md) | Build a native Android app with Expo (React Native) | Accepted |
| [0003](0003-offline-first-local-sqlite.md) | Offline-first: local SQLite is the source of truth | Accepted |
| [0004](0004-feature-sliced-hexagonal-architecture-enforced-by-lint.md) | Feature-sliced hexagonal architecture, enforced by lint | Accepted |

## Writing a new ADR

1. Copy [template.md](template.md) to `NNNN-short-title.md` with the next number.
2. Fill it in while the options are fresh; link the issue and PR.
3. Add it to the index in the same PR.
4. Never rewrite an accepted ADR's decision: write a new one and mark the old one `Superseded by NNNN`.

Write an ADR when a decision is hard to reverse, affects several features, or was chosen between real alternatives.
