# 0002. Build a native Android app with Expo (React Native)

- **Status:** Accepted
- **Date:** 2026-11-07
- **Deciders:** MatiEGP
- **Related:** [#5](https://github.com/MatiEGP/app-gym/issues/5), [#15](https://github.com/MatiEGP/app-gym/issues/15), [ADR 0008](0008-eas-build-profiles-and-on-demand-preview.md)

## Context and problem statement

App Gym replaces a commercial workout tracker (Hevy) whose free plan caps saved routines at four, while the owner needs five or more. It is used on the owner's Android phone during gym sessions: a session timer runs for an hour or more, rest timers must alert with the screen locked, and the phone often has poor signal. Distribution must be free. Which platform should the app target?

## Decision drivers

- Rest timer alerts (notification, sound, vibration) must fire reliably with the screen locked.
- Works offline inside the gym (see [ADR 0003](0003-offline-first-local-sqlite.md)).
- Free distribution to one Android phone, with room to grow.
- One TypeScript codebase; the owner already knows React.
- Fast iteration while developing.

## Considered options

1. Native app with Expo (React Native), Android first
2. Progressive Web App (React + Vite)
3. Both: monorepo with a web app and a native app sharing domain code

## Decision outcome

**Chosen: native app with Expo, Android first**, because background timers and lock-screen notifications are the core of the workout experience, and they are reliable only with native APIs. Expo keeps the codebase in TypeScript/React and removes most native tooling: cloud builds (EAS), config plugins, and a development client with fast refresh.

### Consequences

- **Good:** local notifications, haptics, and SQLite through Expo modules; the same code can target iOS later.
- **Good:** free distribution as an APK installed directly on the phone, no store needed.
- **Bad / trade-offs:** native modules require a development build instead of Expo Go, and every native change needs a new build ([ADR 0008](0008-eas-build-profiles-and-on-demand-preview.md)).
- **Bad / trade-offs:** iOS distribution needs a paid Apple developer account; iOS is out of scope for v1.
- **Follow-ups:** revisit iOS only if the app is shared beyond the owner.

## Pros and cons of the options

### Native with Expo

- ✅ Reliable background timers, local notifications, haptics, local SQLite.
- ✅ Free Android distribution (APK); cloud builds without Android Studio.
- ✅ TypeScript + React skills carry over.
- ❌ Development builds and native rebuilds add friction.
- ❌ Larger download than a web app.

### PWA

- ✅ Simplest deployment (free static hosting) and instant updates.
- ✅ No build pipeline for native code.
- ❌ Timers and notifications with a locked screen are limited and inconsistent on mobile browsers.
- ❌ Storage can be evicted by the browser; risky for workout history.

### Web + native monorepo

- ✅ Domain code shared across both clients.
- ❌ Twice the delivery surface for a single user who only uses a phone.
- ❌ Much higher setup cost before any feature exists.

## Evidence

- Expo SDK 58 app initialized: [PR #19](https://github.com/MatiEGP/app-gym/pull/19).
- Android development build installed on the device: [PR #33](https://github.com/MatiEGP/app-gym/pull/33).
- Self-contained preview APK (94.3 MB) running offline on the device: [PR #36](https://github.com/MatiEGP/app-gym/pull/36).
