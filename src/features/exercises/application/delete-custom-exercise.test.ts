import { sql } from 'drizzle-orm';

import type { AppDatabase } from '@/shared/db/database';
import { createTestDb } from '@/shared/db/test-db';

import { SEEDED_EXERCISES } from '../domain/seeded-exercises';
import { createSqliteExerciseRepository } from '../infrastructure/sqlite-exercise-repository';
import {
  createCustomExercise,
  deleteCustomExercise,
  getExercise,
  listExercises,
  seedExerciseCatalog,
} from './catalog';

describe('deleteCustomExercise', () => {
  let db: AppDatabase;
  let repository: ReturnType<typeof createSqliteExerciseRepository>;
  const createdAt = new Date('2026-03-01T10:00:00.000Z');
  const deletedAt = new Date('2026-03-02T12:00:00.000Z');
  const input = {
    name: 'Remo con mancuerna',
    primaryMuscleGroup: 'lats' as const,
    secondaryMuscleGroups: [],
    equipment: null,
  };

  const row = (id: string) =>
    db.all<{ id: string; updated_at: number; deleted_at: number | null }>(
      sql`select id, updated_at, deleted_at from exercises where id = ${id}`,
    )[0];
  const rowCount = () => db.all<{ n: number }>(sql`select count(*) as n from exercises`)[0].n;

  beforeEach(async () => {
    db = await createTestDb();
    repository = createSqliteExerciseRepository(db);
    seedExerciseCatalog(repository);
    createCustomExercise(repository, input, { newId: () => 'custom-1', now: () => createdAt });
  });

  it('soft-deletes: the row stays with deleted_at set and updated_at advanced', () => {
    const result = deleteCustomExercise(repository, 'custom-1', { now: () => deletedAt });

    expect(result).toEqual({ ok: true });
    expect(row('custom-1').deleted_at).toBe(deletedAt.getTime());
    expect(row('custom-1').updated_at).toBe(deletedAt.getTime());
    expect(row('custom-1').updated_at).toBeGreaterThan(createdAt.getTime());
    expect(rowCount()).toBe(SEEDED_EXERCISES.length + 1);
    expect(getExercise(repository, 'custom-1')?.name).toBe('Remo con mancuerna');
  });

  it('removes the exercise from the listing', () => {
    deleteCustomExercise(repository, 'custom-1', { now: () => deletedAt });

    expect(listExercises(repository).map((e) => e.id)).not.toContain('custom-1');
    expect(listExercises(repository)).toHaveLength(SEEDED_EXERCISES.length);
  });

  it('rejects a seeded exercise and leaves its row unchanged', () => {
    const seededId = SEEDED_EXERCISES[0].id;
    const before = row(seededId);

    const result = deleteCustomExercise(repository, seededId, { now: () => deletedAt });

    expect(result).toEqual({ ok: false, error: 'notDeletable' });
    expect(row(seededId)).toEqual(before);
  });

  it('rejects an unknown id', () => {
    const result = deleteCustomExercise(repository, 'missing', { now: () => deletedAt });

    expect(result).toEqual({ ok: false, error: 'notDeletable' });
    expect(rowCount()).toBe(SEEDED_EXERCISES.length + 1);
  });

  it('rejects deleting twice and keeps the first deletion time', () => {
    deleteCustomExercise(repository, 'custom-1', { now: () => deletedAt });

    const result = deleteCustomExercise(repository, 'custom-1', {
      now: () => new Date('2026-03-03T09:00:00.000Z'),
    });

    expect(result).toEqual({ ok: false, error: 'notDeletable' });
    expect(row('custom-1').deleted_at).toBe(deletedAt.getTime());
    expect(row('custom-1').updated_at).toBe(deletedAt.getTime());
  });

  it('lets a new exercise reuse the name of a deleted one', () => {
    deleteCustomExercise(repository, 'custom-1', { now: () => deletedAt });

    const result = createCustomExercise(repository, input, {
      newId: () => 'custom-2',
      now: () => deletedAt,
    });

    expect(result.ok).toBe(true);
    expect(listExercises(repository).map((e) => e.id)).toContain('custom-2');
  });
});
