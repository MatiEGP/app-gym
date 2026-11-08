# Environments

Where each environment's backend lives and where its configuration values are stored. Workflow rules (branches, tags, releases) are in [project-management.md](project-management.md#branches-environments-and-releases).

## Supabase projects

| Environment | Supabase | Project ref | Region |
|-------------|----------|-------------|--------|
| development | Local stack (`pnpm supabase:start`, Docker) | — | your PC |
| preview | `app-gym-staging` | `blvmfqvthbwljszhijia` | `sa-east-1` (São Paulo) |
| production | `app-gym-prod` | `bmwcqyaxjmwfqvvefszp` | `sa-east-1` (São Paulo) |

Project refs are public identifiers (they appear in each project's URL), not secrets. Staging and prod share a region so staging behaves like prod.

## Where configuration values live

| Value | development | preview (staging) | production (prod) |
|-------|-------------|-------------------|-------------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` (git-ignored): `http://<PC LAN IP>:54321` | EAS environment variable, `preview` environment: `https://blvmfqvthbwljszhijia.supabase.co` | EAS environment variable, `production` environment: `https://bmwcqyaxjmwfqvvefszp.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env`: `PUBLISHABLE_KEY` from `pnpm supabase:status` | EAS `preview` env: staging publishable key (Dashboard → Project Settings → API Keys) | EAS `production` env: prod publishable key |
| Database password | — (local default) | Password manager only; typed when the CLI asks. Later CI: GitHub secret `SUPABASE_DB_PASSWORD_STAGING` | Password manager only. Later CI: GitHub secret `SUPABASE_DB_PASSWORD_PROD` |
| `SUPABASE_ACCESS_TOKEN` (CLI in CI) | — (`supabase login` on your PC) | GitHub secret (when migrations run in CI, M5) | same secret |
| `EXPO_TOKEN` (EAS in CI) | — (`eas login` on your PC) | GitHub secret (#16) | same secret |

Rules:

- `EXPO_PUBLIC_*` values are bundled into the APK: only the URL and the **publishable** key. Never the secret / service_role key.
- A build never points at a database of another environment; in particular, nothing but a `production` build uses `prod`.
- Secrets live in a password manager, EAS, or GitHub secrets. Never in the repo, the chat, or `.env.example`.

## Applying migrations

```bash
pnpm exec supabase link --project-ref blvmfqvthbwljszhijia   # once per machine; asks for the staging DB password
pnpm exec supabase db push --remote                          # apply pending migrations to the linked project
```

- Supabase CLI 3 targets the **local** stack by default; `--remote` is required for the cloud. Keep it explicit.
- The CLI labels any cloud target as "production" (`Target: project app-gym-staging (…) · production`): trust the project name, not the label.
- Prod receives migrations only from a release tag (M5/M7 automates it); never link your PC to prod for day-to-day work.
