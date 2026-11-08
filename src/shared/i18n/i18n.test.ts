import { i18n } from './i18n';
import { resolveLanguage } from './resolve-language';

describe('resolveLanguage', () => {
  it.each([
    [[{ languageCode: 'es' }], 'es'],
    [[{ languageCode: 'en' }], 'es'],
    [[{ languageCode: 'pt' }, { languageCode: 'es' }], 'es'],
    [[{ languageCode: null }], 'es'],
    [[], 'es'],
  ])('resolves device locales %j to %s (Spanish is the fallback)', (locales, expected) => {
    expect(resolveLanguage(locales)).toBe(expected);
  });
});

describe('i18n instance', () => {
  it('serves Spanish copy by key', () => {
    expect(i18n.language).toBe('es');
    expect(i18n.t(($) => $.placeholder.subtitle)).toBe('Tu compañero de entrenamiento');
  });

  it('makes a missing key visible instead of failing silently', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const text = i18n.t('placeholder.doesNotExist' as never);

    expect(text).toContain('placeholder.doesNotExist');
    expect(text).toMatch(/missing/i);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('placeholder.doesNotExist'));
    warn.mockRestore();
  });
});
