# 0008. EAS build profiles, with preview APKs built on demand

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** MatiEGP
- **Related:** [#15](https://github.com/MatiEGP/app-gym/issues/15), [#16](https://github.com/MatiEGP/app-gym/issues/16), [ADR 0002](0002-native-android-app-with-expo.md), [ADR 0006](0006-supabase-backend-and-environments.md)

## Context and problem statement

A native app ([ADR 0002](0002-native-android-app-with-expo.md)) needs Android builds: one for day-to-day development with fast refresh, and self-contained ones to install and use in the gym. The development machine is Windows without Android Studio, and the free EAS plan has a monthly build quota. How are builds produced, and when?

## Decision drivers

- No local Android toolchain to install and maintain.
- A development client that loads code from the PC with fast refresh, including the app's native modules.
- A self-contained APK that runs with no PC and no network.
- Spend the free build quota only when a build is needed.
- Each build points at the right backend environment ([ADR 0006](0006-supabase-backend-and-environments.md)).

## Considered options

1. EAS cloud builds with three profiles; preview built on demand from `main`
2. Local builds with Android Studio / Gradle
3. EAS builds triggered automatically on every push to `main`

## Decision outcome

**Chosen: EAS cloud builds with three profiles, each bound to its EAS environment:**

| Profile | Purpose | Trigger | Backend |
|---------|---------|---------|---------|
| `development` | Dev client (own "Expo Go" with native modules) | manual, when native code changes | local stack |
| `preview` | Self-contained APK of `main` | **Preview APK** workflow button (`workflow_dispatch`, `main` only) | staging |
| `production` | Release APK, auto-incremented version code | release tag (planned) | prod |

All profiles produce APKs, since the app is sideloaded, not published to Google Play. The Android signing key is generated and stored by EAS.

### Consequences

- **Good:** builds run in the cloud from a clean environment; nothing to install locally beyond Node.
- **Good:** quota spent only on purpose; the workflow job takes about a minute because it only queues the build.
- **Good:** measurable difference between build types: the development build is about 300 MB installed (debug, unstripped, four CPU architectures), the preview APK is 94.3 MB and runs fully offline.
- **Bad / trade-offs:** development and preview share the app id, so only one can be installed at a time (app variants deferred).
- **Bad / trade-offs:** `workflow_dispatch` works only once the workflow is on `main`, so it can only be fully verified after merge.
- **Follow-ups:** an arm64-only build could shrink the APK further; production builds on tags (M7).

## Pros and cons of the options

### EAS with profiles, preview on demand

- ✅ No local Android toolchain; reproducible cloud builds.
- ✅ Builds tied to environments and variables managed in EAS.
- ❌ Depends on the EAS free quota and queue times.

### Local Gradle builds

- ✅ No quota, no queue.
- ❌ Android Studio, SDKs, and Java on Windows to install and keep in sync with the SDK.
- ❌ Signing keys managed by hand.

### Automatic builds on every push

- ✅ Always a fresh APK.
- ❌ Burns the free monthly quota on merges nobody installs.

## Evidence

- Profiles, package id, EAS project, first development build (`e6bda2de`): [PR #33](https://github.com/MatiEGP/app-gym/pull/33).
- Preview workflow, staging variables in the EAS `preview` environment, preview build `0dc2492d` installed and run offline on the device, workflow run from `main` producing build `19ec7abe`: [PR #36](https://github.com/MatiEGP/app-gym/pull/36).
