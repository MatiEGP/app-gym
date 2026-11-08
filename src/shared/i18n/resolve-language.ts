export const SUPPORTED_LANGUAGES = ['es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const FALLBACK_LANGUAGE: SupportedLanguage = 'es';

type DeviceLocale = { languageCode: string | null };

function isSupported(code: string | null): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

/** First supported language in the device's preference order, else Spanish. */
export function resolveLanguage(locales: readonly DeviceLocale[]): SupportedLanguage {
  return locales.map((locale) => locale.languageCode).find(isSupported) ?? FALLBACK_LANGUAGE;
}
