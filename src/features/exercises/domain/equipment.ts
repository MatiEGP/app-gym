// Fixed equipment list. An exercise has at most one; labels are i18n keys.
export const EQUIPMENT = [
  'barbell',
  'ez_bar',
  'dumbbell',
  'kettlebell',
  'machine',
  'smith_machine',
  'cable',
  'band',
  'bodyweight',
  'other',
] as const;

export type Equipment = (typeof EQUIPMENT)[number];

export function isEquipment(value: string): value is Equipment {
  return (EQUIPMENT as readonly string[]).includes(value);
}
