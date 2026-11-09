# 0010. Typed i18n keys, with Spanish as the fallback language

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** MatiEGP
- **Related:** [#11](https://github.com/MatiEGP/app-gym/issues/11)

## Context and problem statement

The app's interface is in Spanish, while code, commits, and docs are in English. Adding English later should not require hunting for hardcoded strings across every screen, and a mistyped translation key should never ship as broken text. The phone's language may not be Spanish. How do we manage user-facing copy?

## Decision drivers

- No hardcoded user-facing strings; copy grouped by screen or feature.
- A wrong key must fail before the app runs.
- A missing translation must be visible during development, never silent.
- Spanish for any device language until other languages exist.
- Copy available on the first render (no loading flash).

## Considered options

1. i18next + react-i18next + expo-localization, with typed selector keys
2. i18next with plain string keys
3. Hardcoded Spanish strings, extracted later

## Decision outcome

**Chosen: i18next with typed selector keys.** Spanish resources live in `src/shared/i18n/locales/es.ts`; components read them as `t(($) => $.placeholder.subtitle)`, and module augmentation types every selector against the Spanish resources. Resources are bundled and initialized synchronously. The language is the first supported device language, else Spanish. In development, a missing key renders `[missing: key]` and logs a warning; in production it falls back to the key.

### Consequences

- **Good:** a typo in a key fails `pnpm typecheck`, and therefore CI.
- **Good:** adding a language means adding a resource file and its code to the supported list.
- **Bad / trade-offs:** selectors are more verbose than string keys.
- **Bad / trade-offs:** typed selectors must be enabled explicitly in the type declarations; without it, TypeScript rejects the selector syntax.
- **Follow-ups:** English resources when needed; the brand name "App Gym" stays untranslated.

## Pros and cons of the options

### Typed selectors

- ✅ Compile-time key checking with editor autocompletion.
- ✅ The direction i18next itself is taking: selector typing is the default since v26.
- ❌ More verbose call sites.

### String keys

- ✅ Familiar and short.
- ❌ Typing for string keys is planned for deprecation by i18next; typos reach runtime.

### Hardcoded strings

- ✅ Fastest at first.
- ❌ Expensive extraction later; violates the project rule of no hardcoded copy.

## Evidence

- Implementation and tests for all four criteria (Spanish copy by key, Spanish fallback for `en`, `pt`, `null`, and empty locales, visible missing keys): [PR #27](https://github.com/MatiEGP/app-gym/pull/27).
- Typo probe: `$.placeholder.subtitel` → `TS2551: Property 'subtitel' does not exist`.
- The Android bundle contains the Spanish copy.
