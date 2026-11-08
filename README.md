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

Requirements: Node.js 22+ and Corepack (bundled with Node). An Android emulator or device is needed to run the app.

```bash
corepack enable pnpm             # once per machine; needs an admin terminal on Windows
pnpm install --frozen-lockfile   # install dependencies (pnpm version pinned in package.json)
pnpm android                     # start Expo and open the app on Android
```

Without `corepack enable`, prefix commands with `corepack`, for example `corepack pnpm install`.

### Development build (Android)

Expo Go only ships its own native modules; this app needs a development build (its own "Expo Go" with this project's native code). Rebuild it only when native dependencies or `app.json` change.

1. Log in once: `npx eas-cli@27.5.0 login` (browser, GitHub account).
2. Build in the cloud: `npx eas-cli@27.5.0 build -p android --profile development`. The first build asks to generate the Android keystore (answer yes; EAS stores it). Builds use the free monthly quota.
3. Open the build link or QR on the phone, download the APK, and install it (allow installs from the browser when Android asks).
4. Run `pnpm start --dev-client`, open the installed **App Gym**, and scan the QR from it.

The development build is a debug, all-architectures APK (hundreds of MB installed) and loads JavaScript from your PC. The app for daily use is the self-contained `preview`/`production` APK.

Other commands: `pnpm start` (dev server only), `pnpm typecheck`, `pnpm lint` (ESLint + Prettier check, warnings fail), `pnpm format` (auto-fix formatting), `pnpm test` (Jest). CI runs lint, typecheck, and tests on every pull request; the `verify` check must pass to merge. Copy `.env.example` to `.env` once the Supabase setup lands (#13).

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
