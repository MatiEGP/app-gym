// Design tokens: the single source of truth for theme values.
// tailwind.config.ts maps them to utility classes (e.g. `bg-background`, `text-primary`);
// use the classes in components and import these values only where a class cannot be used.
export const colors = {
  primary: '#208AEF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
} as const;
