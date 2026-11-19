import type { Equipment } from './equipment';
import type { MuscleGroup } from './muscle-group';

/** Seeded exercises ship with the app and are read-only; custom ones are created by the user. */
export type ExerciseOrigin = 'seeded' | 'custom';

export type Exercise = {
  id: string;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment | null;
  origin: ExerciseOrigin;
};

const COMBINING_MARKS = /[̀-ͯ]/g;

/** Comparable form of a name: lowercase, without accents or surrounding spaces. */
export function normalizeExerciseName(name: string): string {
  return name.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();
}

/** Returns a new array sorted by name, ignoring case and accents. */
export function sortExercisesByName<T extends { name: string }>(exercises: readonly T[]): T[] {
  return exercises
    .map((exercise) => ({ exercise, key: normalizeExerciseName(exercise.name) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ exercise }) => exercise);
}

/** Keeps the exercises whose name contains the query, ignoring case, accents, and outer spaces. */
export function filterExercisesByName<T extends { name: string }>(
  exercises: readonly T[],
  query: string,
): T[] {
  const needle = normalizeExerciseName(query);
  if (needle === '') return [...exercises];
  return exercises.filter((exercise) => normalizeExerciseName(exercise.name).includes(needle));
}

/** Keeps the exercises whose primary muscle group is the given one; `null` keeps them all. */
export function filterExercisesByMuscleGroup<T extends { primaryMuscleGroup: MuscleGroup }>(
  exercises: readonly T[],
  group: MuscleGroup | null,
): T[] {
  if (group === null) return [...exercises];
  return exercises.filter((exercise) => exercise.primaryMuscleGroup === group);
}
