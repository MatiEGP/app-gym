import { sql } from 'drizzle-orm';

import type { AppDatabase } from '@/shared/db/database';
import { createTestDb } from '@/shared/db/test-db';

import { SEEDED_EXERCISES } from '../domain/seeded-exercises';
import { createSqliteExerciseRepository } from '../infrastructure/sqlite-exercise-repository';
import {
  createCustomExercise,
  getExercise,
  seedExerciseCatalog,
  updateCustomExercise,
} from './catalog';

describe('updateCustomExercise', () => {
  let db: AppDatabase;
  let repository: ReturnType<typeof createSqliteExerciseRepository>;
  const createdAt = new Date('2026-03-01T10:00:00.000Z');
  const editedAt = new Date('2026-03-02T12:00:00.000Z');
  const input = {
    name: 'Remo con mancuerna',
    primaryMuscleGroup: 'lats' as const,
    secondaryMuscleGroups: [],
    equipment: null,
  };

  const row = (id: string) =>
    db.all<{ id: string; name: string; primary_muscle_group: string; updated_at: number }>(
      sql`select id, name, primary_muscle_group, updated_at from exercises where id = ${id}`,
    )[0];
  const rowCount = () => db.all<{ n: number }>(sql`select count(*) as n from exercises`)[0].n;

  beforeEach(async () => {
    db = await createTestDb();
    repository = createSqliteExerciseRepository(db);
    seedExerciseCatalog(repository);
    createCustomExercise(repository, input, { newId: () => 'custom-1', now: () => createdAt });
  });

  it('stores the new values with the same id and advances updated_at', () => {
    const result = updateCustomExercise(
      repository,
      'custom-1',
      {
        name: '  Remo unilateral ',
        primaryMuscleGroup: 'upper_back',
        secondaryMuscleGroups: ['upper_back', 'biceps'],
        equipment: 'dumbbell',
      },
      { now: () => editedAt },
    );

    const expected = {
      id: 'custom-1',
      name: 'Remo unilateral',
      primaryMuscleGroup: 'upper_back',
      secondaryMuscleGroups: ['biceps'],
      equipment: 'dumbbell',
      origin: 'custom',
    };
    expect(result).toEqual({ ok: true, exercise: expected });
    expect(getExercise(repository, 'custom-1')).toEqual(expected);
    expect(row('custom-1').updated_at).toBe(editedAt.getTime());
    expect(row('custom-1').updated_at).toBeGreaterThan(createdAt.getTime());
  });

  it('accepts keeping its own name, also with different case and accents', () => {
    const result = updateCustomExercise(
      repository,
      'custom-1',
      { ...input, name: ' REMO con mancuérna ' },
      { now: () => editedAt },
    );

    expect(result.ok).toBe(true);
    expect(row('custom-1').name).toBe('REMO con mancuérna');
  });

  it('rejects the name of another active exercise and stores nothing', () => {
    const result = updateCustomExercise(
      repository,
      'custom-1',
      { ...input, name: 'press de banca con barra' },
      { now: () => editedAt },
    );

    expect(result).toEqual({ ok: false, errors: ['duplicateName'] });
    expect(row('custom-1').name).toBe('Remo con mancuerna');
    expect(row('custom-1').updated_at).toBe(createdAt.getTime());
  });

  it('rejects an empty name and a missing primary group and stores nothing', () => {
    const result = updateCustomExercise(
      repository,
      'custom-1',
      { ...input, name: '   ', primaryMuscleGroup: null },
      { now: () => editedAt },
    );

    expect(result).toEqual({ ok: false, errors: ['nameRequired', 'muscleGroupRequired'] });
    expect(row('custom-1')).toMatchObject({
      name: 'Remo con mancuerna',
      primary_muscle_group: 'lats',
      updated_at: createdAt.getTime(),
    });
  });

  it('rejects editing a seeded exercise as notEditable and leaves its row unchanged', () => {
    const seededId = SEEDED_EXERCISES[0].id;
    const before = row(seededId);

    const result = updateCustomExercise(
      repository,
      seededId,
      { ...input, name: 'Otro nombre' },
      { now: () => editedAt },
    );

    expect(result).toEqual({ ok: false, errors: ['notEditable'] });
    expect(row(seededId)).toEqual(before);
  });

  it('rejects an unknown id as notEditable and stores nothing', () => {
    const result = updateCustomExercise(repository, 'missing', input, { now: () => editedAt });

    expect(result).toEqual({ ok: false, errors: ['notEditable'] });
    expect(rowCount()).toBe(SEEDED_EXERCISES.length + 1);
  });
});
