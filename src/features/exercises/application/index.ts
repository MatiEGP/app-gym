import { db } from '@/shared/db/client';

import { createSqliteExerciseRepository } from '../infrastructure/sqlite-exercise-repository';
import * as catalog from './catalog';

// Public API of the exercises feature: its use cases bound to the app database (ADR 0017).
// UI and other features import only from here.
const repository = createSqliteExerciseRepository(db);

export const listExercises = () => catalog.listExercises(repository);
export const getExercise = (id: string) => catalog.getExercise(repository, id);
export const seedExerciseCatalog = () => catalog.seedExerciseCatalog(repository);
export { filterExercisesByName } from '../domain/exercise';

export type { Equipment } from '../domain/equipment';
export type { Exercise, ExerciseOrigin } from '../domain/exercise';
export type { MuscleGroup } from '../domain/muscle-group';
