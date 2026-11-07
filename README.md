# app-gym

Personal gym companion app: log live workouts, manage unlimited routines, and review session stats. Offline-first, Android-first.

## Features (v1 scope)

- Live workout with session timer, volume, and set count header
- Add predefined or custom exercises, sets, notes, and per-exercise rest timer
- Finish (summary + save) or discard (with confirmation) a workout
- Unlimited routines; start a workout from a routine
- History, session summary, muscle map, and progress charts
- Works fully offline; syncs to Supabase when online

## Tech Stack

Expo (React Native) + Expo Router, TypeScript, NativeWind, Zustand, expo-sqlite + Drizzle ORM, Supabase (Auth, Postgres, RLS), Jest. See [AGENTS.md](AGENTS.md) for architecture rules and conventions.

## Getting Started

TODO: add setup steps after the Expo project is initialized (M0).

1. Copy `.env.example` to `.env` and fill in the Supabase values.
2. TODO: confirm install and dev commands.

## Roadmap

| Milestone | Outcome |
|-----------|---------|
| M0 Foundations | Expo init, lint/test tooling, CI, Supabase project |
| M1 Exercise catalog | Seeded and custom exercises, muscle groups |
| M2 Empty workout | Timer, exercises, sets, notes, finish/discard, summary |
| M3 Rest timer + Settings | Rest notifications, sounds, preferences |
| M4 Routines | Unlimited routines, start workout from routine |
| M5 Auth + Sync | Login, outbox sync, RLS |
| M6 History & stats | History, muscle map, charts, PRs |
| M7 v1.0 | Android APK release, E2E smoke test |

## Contributing

GitHub Flow with Conventional Commits. Branches: `<type>/<issue>-<kebab-desc>`. See [AGENTS.md](AGENTS.md), the [project management guide](docs/project-management.md), and [how to work with Claude](docs/working-with-claude.md).
