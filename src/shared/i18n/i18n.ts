import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { es } from './locales/es';
import { FALLBACK_LANGUAGE, resolveLanguage, SUPPORTED_LANGUAGES } from './resolve-language';

export const resources = {
  es: { translation: es },
} as const;

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getLocales()),
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  // Resources are bundled, so initialize synchronously: the first render already has copy.
  initAsync: false,
  interpolation: { escapeValue: false }, // React already escapes rendered text.
  // In development a missing key must never fail silently: warn and render a visible marker.
  saveMissing: __DEV__,
  missingKeyHandler: (_languages, _namespace, key) => {
    console.warn(`[i18n] Missing translation key: ${key}`);
  },
  parseMissingKeyHandler: (key) => (__DEV__ ? `[missing: ${key}]` : key),
});
