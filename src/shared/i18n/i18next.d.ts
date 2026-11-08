import 'i18next';

import type { resources } from './i18n';

// Types every `t($ => $.key)` selector against the Spanish resources: unknown keys fail typecheck.
declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: true;
    defaultNS: 'translation';
    resources: (typeof resources)['es'];
  }
}
