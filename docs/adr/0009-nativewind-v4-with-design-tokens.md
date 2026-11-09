# 0009. Style with NativeWind v4 and design tokens

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** MatiEGP
- **Related:** [#10](https://github.com/MatiEGP/app-gym/issues/10)

## Context and problem statement

Every screen in the app needs consistent styling, and colors must come from one place so a theme change does not mean editing dozens of components. Tailwind-style utility classes are fast to write and to review. At decision time, the established library for Tailwind on React Native, NativeWind, had a stable v4 (Tailwind CSS 3) and a one-week-old v5 release candidate (Tailwind CSS 4) aimed at newer Expo SDKs. The app runs Expo SDK 58. How do we style components?

## Decision drivers

- One source of truth for theme values (colors first).
- Fast, readable styling in components.
- Stability over novelty on a foundation that every screen depends on.
- Verifiable on the real platform, since styles are not visible in unit tests.

## Considered options

1. NativeWind v4.2.7 (stable) with Tailwind CSS 3 and theme tokens
2. NativeWind v5.0.0-rc.1 with Tailwind CSS 4
3. React Native `StyleSheet` with a hand-made theme object

## Decision outcome

**Chosen: NativeWind v4.2.7 with Tailwind CSS 3**, because it is the stable, documented line and its maintainers publish a setup for recent Expo SDKs; a release candidate is a poor base for every screen. Theme values live in `src/shared/ui/tokens.ts` and are mapped into Tailwind by `tailwind.config.js`, so components use classes such as `bg-background` and `text-primary` and never hardcoded colors.

### Consequences

- **Good:** consistent, reviewable styling; a token change updates every screen.
- **Bad / trade-offs:** v4 is verified by its maintainers up to Expo SDK 57; SDK 58 compatibility had to be proven here (see Evidence).
- **Bad / trade-offs:** NativeWind compiles styles in Metro at build time, so Jest cannot observe them. Visual changes are verified on an Android bundle or a device instead.
- **Follow-ups:** migrate to v5 when it is stable; it has an official migration guide.

## Pros and cons of the options

### NativeWind v4 (stable)

- ✅ Stable, widely used, documented setup for recent SDKs.
- ✅ Utility classes plus theme tokens.
- ❌ Older Tailwind version; a future migration to v5 is likely.

### NativeWind v5 RC

- ✅ Tailwind CSS 4 and the newer pipeline; no future migration.
- ❌ Release candidate: possible bugs and breaking changes before stable.
- ❌ Requires exact RC versions of its CSS runtime.

### StyleSheet with a theme object

- ✅ No dependencies; styles visible in unit tests.
- ❌ Verbose; theming discipline enforced only by convention.

## Evidence

- Setup and tokens: [PR #26](https://github.com/MatiEGP/app-gym/pull/26).
- Bundle probe: the exported Android bundle contains `"text-primary"` → `color: "#208aef"` and `"bg-background"` → `backgroundColor: "#f8fafc"`, the values in `tokens.ts`.
- Device probe: the background token was temporarily set to hot pink and the phone's background turned pink through fast refresh, then reverted without committing.
- CI caught a type error invisible locally: a git-ignored generated file declared CSS module types, so `import '../global.css'` failed in a clean checkout until a committed declaration was added.
