// Fixed muscle group taxonomy. Fine-grained so the M6 muscle map can group them for display
// without re-tagging stored exercises. Adding a group needs a release; labels are i18n keys.
export const MUSCLE_GROUPS = [
  'chest',
  'lats',
  'upper_back',
  'traps',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'lower_back',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
  'adductors',
  'abductors',
  'cardio',
  'full_body',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export function isMuscleGroup(value: string): value is MuscleGroup {
  return (MUSCLE_GROUPS as readonly string[]).includes(value);
}
