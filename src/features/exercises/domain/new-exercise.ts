import { normalizeExerciseName } from './exercise';
import type { MuscleGroup } from './muscle-group';

export type NewExerciseInput = {
  name: string;
  primaryMuscleGroup: MuscleGroup | null;
};

export type NewExerciseError = 'nameRequired' | 'muscleGroupRequired' | 'duplicateName';

/**
 * Rules for a new custom exercise: a name after trimming, a primary muscle group, and a name that
 * is not already taken by an active exercise (ignoring case, accents, and surrounding spaces).
 */
export function validateNewExercise(
  input: NewExerciseInput,
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
