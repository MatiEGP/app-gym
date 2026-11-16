import { sortExercisesByName, type Exercise } from '../domain/exercise';
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
