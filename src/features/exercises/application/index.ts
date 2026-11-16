import * as Crypto from 'expo-crypto';

import { db } from '@/shared/db/client';

import { createSqliteExerciseRepository } from '../infrastructure/sqlite-exercise-repository';
import type { NewExerciseInput } from '../domain/new-exercise';
import * as catalog from './catalog';

// Public API of the exercises feature: its use cases bound to the app database (ADR 0017).
// UI and other features import only from here.
const repository = createSqliteExerciseRepository(db);

export const listExercises = () => catalog.listExercises(repository);
export const getExercise = (id: string) => catalog.getExercise(repository, id);
export const seedExerciseCatalog = () => catalog.seedExerciseCatalog(repository);
export const createCustomExercise = (input: NewExerciseInput) =>
  catalog.createCustomExercise(repository, input, {
    newId: Crypto.randomUUID,
    now: () => new Date(),
  });
export const updateCustomExercise = (id: string, input: NewExerciseInput) =>
  catalog.updateCustomExercise(repository, id, input, { now: () => new Date() });
export const deleteCustomExercise = (id: string) =>
  catalog.deleteCustomExercise(repository, id, { now: () => new Date() });
export { filterExercisesByMuscleGroup, filterExercisesByName } from '../domain/exercise';
export { cleanSecondaryMuscleGroups } from '../domain/new-exercise';
export { EQUIPMENT } from '../domain/equipment';
export { MUSCLE_GROUPS } from '../domain/muscle-group';

export type {
  CreateCustomExerciseResult,
  DeleteCustomExerciseResult,
  UpdateCustomExerciseResult,
} from './catalog';
export type { NewExerciseError, NewExerciseInput } from '../domain/new-exercise';
export type { Equipment } from '../domain/equipment';
export type { Exercise, ExerciseOrigin } from '../domain/exercise';
export type { MuscleGroup } from '../domain/muscle-group';
