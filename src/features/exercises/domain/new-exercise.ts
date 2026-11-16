import { normalizeExerciseName } from './exercise';
import type { Equipment } from './equipment';
import { MUSCLE_GROUPS, type MuscleGroup } from './muscle-group';

export type NewExerciseInput = {
  name: string;
  primaryMuscleGroup: MuscleGroup | null;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment | null;
};

/** Secondary groups without the primary one and without duplicates, in muscle group list order. */
export function cleanSecondaryMuscleGroups(
  primary: MuscleGroup | null,
  secondary: readonly MuscleGroup[],
): MuscleGroup[] {
  return MUSCLE_GROUPS.filter((group) => group !== primary && secondary.includes(group));
}

export type NewExerciseError = 'nameRequired' | 'muscleGroupRequired' | 'duplicateName';

/**
 * Rules for a new custom exercise: a name after trimming, a primary muscle group, and a name that
 * is not already taken by an active exercise (ignoring case, accents, and surrounding spaces).
 */
export function validateNewExercise(
  input: Pick<NewExerciseInput, 'name' | 'primaryMuscleGroup'>,
  activeExercises: readonly { name: string }[],
): NewExerciseError[] {
  const errors: NewExerciseError[] = [];
  const name = normalizeExerciseName(input.name);

  if (name === '') {
    errors.push('nameRequired');
  }
  if (input.primaryMuscleGroup === null) {
    errors.push('muscleGroupRequired');
  }
  if (name !== '' && activeExercises.some((e) => normalizeExerciseName(e.name) === name)) {
    errors.push('duplicateName');
  }
  return errors;
}
