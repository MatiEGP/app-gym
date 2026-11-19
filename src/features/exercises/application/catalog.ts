import { sortExercisesByName, type Exercise } from '../domain/exercise';
import {
  validateNewExercise,
  type NewExerciseError,
  type NewExerciseInput,
} from '../domain/new-exercise';
import { SEEDED_EXERCISES } from '../domain/seeded-exercises';
import type { ExerciseRepository } from './exercise-repository';

/** Active exercises sorted by name, ignoring case and accents. */
export function listExercises(repository: ExerciseRepository): Exercise[] {
  return sortExercisesByName(repository.listActive());
}

export function getExercise(repository: ExerciseRepository, id: string): Exercise | undefined {
  return repository.findById(id);
}

/** Stores the seeded exercises missing on this device. Safe to run on every app start. */
export function seedExerciseCatalog(repository: ExerciseRepository): void {
  repository.insertMissingSeeded(SEEDED_EXERCISES);
}

export type CreateCustomExerciseResult =
  { ok: true; exercise: Exercise } | { ok: false; errors: NewExerciseError[] };

/** Validates and stores a custom exercise; on errors nothing is stored. */
export function createCustomExercise(
  repository: ExerciseRepository,
  input: NewExerciseInput,
  deps: { newId: () => string; now: () => Date },
): CreateCustomExerciseResult {
  const errors = validateNewExercise(input, repository.listActive());
  if (errors.length > 0 || input.primaryMuscleGroup === null) return { ok: false, errors };

  const exercise: Exercise = {
    id: deps.newId(),
    name: input.name.trim(),
    primaryMuscleGroup: input.primaryMuscleGroup,
    secondaryMuscleGroups: [],
    equipment: null,
    origin: 'custom',
  };
  repository.insertCustom(exercise, deps.now());
  return { ok: true, exercise };
}
