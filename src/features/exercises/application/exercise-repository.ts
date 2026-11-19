import type { Exercise } from '../domain/exercise';
import type { SeededExercise } from '../domain/seeded-exercises';

/** Port the use cases depend on; `infrastructure/` implements it over SQLite. */
export interface ExerciseRepository {
  /** Exercises that are not soft-deleted, in no particular order. */
  listActive(): Exercise[];
  /** Any stored exercise, soft-deleted or not, so past workouts can still show it. */
  findById(id: string): Exercise | undefined;
  /** Inserts the seeded exercises that are not stored yet; existing rows are left untouched. */
  insertMissingSeeded(exercises: readonly SeededExercise[]): void;
}
