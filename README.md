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

## Documentation

- [M0 Foundations report](docs/milestones/m0-foundations.md): what the first milestone delivered, why, and the problems caught along the way.
- [Architecture Decision Records](docs/adr/README.md): the reasoning behind each significant decision.
- [Environments](docs/environments.md), [project management](docs/project-management.md), [development workflow](docs/working-with-claude.md).

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

### Preview APK (install `main` on the phone)

A self-contained release APK (~94 MB) built from `main`, pointing at the staging backend. It runs without a PC or network.

1. GitHub → **Actions** → **Preview APK** → **Run workflow** (branch `main`). The job queues an EAS build and finishes in about a minute.
2. Wait for the build on expo.dev (project → Builds), or run `npx eas-cli@27.5.0 build:list --platform android --limit 1`.
3. Open the build's APK link on the phone and install it.

Every run uses one build from the EAS free monthly quota, so it is manual only. The preview and development builds share the app id: uninstall one before installing the other.

### Local backend (Supabase)

Requires **Docker Desktop running**. The Supabase CLI is a dev dependency, so no global install is needed.

```bash
pnpm supabase:start    # start the local stack (first run downloads Docker images)
pnpm supabase:status   # print local URLs and keys
pnpm supabase:stop     # stop it; data is kept in a Docker volume
```

Studio (database UI) runs at http://127.0.0.1:54323. Config, migrations, and the local seed live in `supabase/`.

To point the app at the local backend, copy `.env.example` to `.env` and set:

| Variable | Local value |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `http://<your PC's LAN IP>:54321`, not `127.0.0.1`: on the phone, `127.0.0.1` is the phone itself |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `PUBLISHABLE_KEY` from `pnpm supabase:status` (`sb_publishable_...`) |

Never put the `SECRET_KEY` / `SERVICE_ROLE_KEY` in the app: `EXPO_PUBLIC_*` values are bundled into the APK.

Cloud projects (staging, prod), where each environment's values live, and how to apply migrations: [docs/environments.md](docs/environments.md).

Other commands: `pnpm start` (dev server only), `pnpm typecheck`, `pnpm lint` (ESLint + Prettier check, warnings fail), `pnpm format` (auto-fix formatting), `pnpm test` (Jest). CI runs lint, typecheck, and tests on every pull request; the `verify` check must pass to merge.

## Roadmap

| Milestone | Outcome |
|-----------|---------|
| M0 Foundations ✅ | Expo init, lint/test tooling, CI, Supabase project ([report](docs/milestones/m0-foundations.md)) |
| M1 Exercise catalog | Seeded and custom exercises, muscle groups |
| M2 Empty workout | Timer, exercises, sets, notes, finish/discard, summary |
| M3 Rest timer + Settings | Rest notifications, sounds, preferences |
| M4 Routines | Unlimited routines, start workout from routine |
| M5 Auth + Sync | Login, outbox sync, RLS |
| M6 History & stats | History, muscle map, charts, PRs |
| M7 v1.0 | Android APK release, E2E smoke test |

## Contributing

GitHub Flow with Conventional Commits. Branches: `<type>/<issue>-<kebab-desc>`. See [AGENTS.md](AGENTS.md), the [project management guide](docs/project-management.md), and [how to work with Claude](docs/working-with-claude.md).
