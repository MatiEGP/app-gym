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
  /** Inserts a user-created exercise: no owner yet (`user_id` null) and not deleted. */
  insertCustom(exercise: Exercise, updatedAt: Date): void;
  /** Overwrites the editable fields of a custom exercise; seeded or unknown ids are untouched. */
  updateCustom(exercise: Exercise, updatedAt: Date): void;
  /** Soft-deletes an active custom exercise (sets `deleted_at` and `updated_at`); others are untouched. */
  softDeleteCustom(id: string, deletedAt: Date): void;
}
