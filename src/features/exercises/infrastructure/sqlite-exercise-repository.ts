import { eq, isNull } from 'drizzle-orm';

import type { AppDatabase } from '@/shared/db/database';
import { exercises } from '@/shared/db/schema';

import type { ExerciseRepository } from '../application/exercise-repository';
import { isEquipment, type Equipment } from '../domain/equipment';
import type { Exercise } from '../domain/exercise';
import { isMuscleGroup, type MuscleGroup } from '../domain/muscle-group';

type ExerciseRow = typeof exercises.$inferSelect;

function toMuscleGroup(value: string): MuscleGroup {
  if (!isMuscleGroup(value)) throw new Error(`Unknown muscle group in the database: ${value}`);
  return value;
}

function toEquipment(value: string | null): Equipment | null {
  if (value === null) return null;
  if (!isEquipment(value)) throw new Error(`Unknown equipment in the database: ${value}`);
  return value;
}

function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    primaryMuscleGroup: toMuscleGroup(row.primaryMuscleGroup),
    secondaryMuscleGroups: row.secondaryMuscleGroups.map(toMuscleGroup),
    equipment: toEquipment(row.equipment),
    origin: row.origin,
  };
}

export function createSqliteExerciseRepository(db: AppDatabase): ExerciseRepository {
  return {
    listActive() {
      return db.select().from(exercises).where(isNull(exercises.deletedAt)).all().map(toExercise);
    },

    findById(id) {
      const row = db.select().from(exercises).where(eq(exercises.id, id)).get();
      return row ? toExercise(row) : undefined;
    },

    insertMissingSeeded(seeded) {
      if (seeded.length === 0) return;
      const updatedAt = new Date();
      db.insert(exercises)
        .values(seeded.map((exercise) => ({ ...exercise, origin: 'seeded' as const, updatedAt })))
        .onConflictDoNothing({ target: exercises.id })
        .run();
    },
  };
}
