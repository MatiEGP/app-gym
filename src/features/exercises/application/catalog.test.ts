import { sql } from 'drizzle-orm';

import type { AppDatabase } from '@/shared/db/database';
import { createTestDb } from '@/shared/db/test-db';

import { SEEDED_EXERCISES } from '../domain/seeded-exercises';
import { createSqliteExerciseRepository } from '../infrastructure/sqlite-exercise-repository';
import { createCustomExercise, getExercise, listExercises, seedExerciseCatalog } from './catalog';

type StoredRow = {
  id: string;
  user_id: string | null;
  updated_at: number | null;
  deleted_at: number | null;
  origin: string;
};

// Independent oracle for the expected order: ICU collation, ignoring case and accents.
const collator = new Intl.Collator('es', { sensitivity: 'base' });

describe('exercise catalog', () => {
  let db: AppDatabase;
  let repository: ReturnType<typeof createSqliteExerciseRepository>;

  beforeEach(async () => {
    db = await createTestDb();
    repository = createSqliteExerciseRepository(db);
  });

  it('lists every seeded exercise with its primary muscle group, sorted by name ignoring case and accents', () => {
    seedExerciseCatalog(repository);

    const listed = listExercises(repository);

    const expected = [...SEEDED_EXERCISES].sort((a, b) => collator.compare(a.name, b.name));
    expect(listed.map(({ name, primaryMuscleGroup }) => ({ name, primaryMuscleGroup }))).toEqual(
      expected.map(({ name, primaryMuscleGroup }) => ({ name, primaryMuscleGroup })),
    );
  });

  it('keeps the same exercises and ids, without duplicates, when seeding again', () => {
    seedExerciseCatalog(repository);
    const firstIds = listExercises(repository).map((exercise) => exercise.id);

    seedExerciseCatalog(repository);
    const secondIds = listExercises(repository).map((exercise) => exercise.id);

    expect(secondIds).toEqual(firstIds);
    expect(secondIds).toHaveLength(SEEDED_EXERCISES.length);
  });

  it('stores seeded exercises with their fixed ids, sync columns, and seeded origin', () => {
    seedExerciseCatalog(repository);

    const rows = db.all<StoredRow>(
      sql`select id, user_id, updated_at, deleted_at, origin from exercises order by id`,
    );

    expect(rows.map((row) => row.id)).toEqual(
      SEEDED_EXERCISES.map((exercise) => exercise.id).sort(),
    );
    for (const row of rows) {
      expect(row).toEqual({
        id: row.id,
        user_id: null,
        updated_at: expect.any(Number),
        deleted_at: null,
        origin: 'seeded',
      });
      expect(row.updated_at).toBeGreaterThan(0);
    }
  });

  it('gets an exercise by id with all its fields', () => {
    seedExerciseCatalog(repository);
    const [seeded] = SEEDED_EXERCISES;

    expect(getExercise(repository, seeded.id)).toEqual({ ...seeded, origin: 'seeded' });
    expect(getExercise(repository, 'not-an-exercise')).toBeUndefined();
  });

  it('leaves soft-deleted exercises out of the list', () => {
    seedExerciseCatalog(repository);
    const [deleted] = SEEDED_EXERCISES;
    db.run(sql`update exercises set deleted_at = ${Date.now()} where id = ${deleted.id}`);

    const listedIds = listExercises(repository).map((exercise) => exercise.id);

    expect(listedIds).not.toContain(deleted.id);
    expect(listedIds).toHaveLength(SEEDED_EXERCISES.length - 1);
  });
});

describe('createCustomExercise', () => {
  let db: AppDatabase;
  let repository: ReturnType<typeof createSqliteExerciseRepository>;
  const savedAt = new Date('2026-03-01T10:00:00.000Z');
  const deps = { newId: () => 'custom-1', now: () => savedAt };

  const countRows = () => db.all<{ n: number }>(sql`select count(*) as n from exercises`)[0].n;

  beforeEach(async () => {
    db = await createTestDb();
    repository = createSqliteExerciseRepository(db);
    seedExerciseCatalog(repository);
  });

  it('stores the exercise with a generated id, the trimmed name, the save time, and custom origin', () => {
    const result = createCustomExercise(
      repository,
      {
        name: '  Remo con mancuerna  ',
        primaryMuscleGroup: 'lats',
        secondaryMuscleGroups: [],
        equipment: null,
      },
      deps,
    );

    expect(result).toEqual({
      ok: true,
      exercise: {
        id: 'custom-1',
        name: 'Remo con mancuerna',
        primaryMuscleGroup: 'lats',
        secondaryMuscleGroups: [],
        equipment: null,
        origin: 'custom',
      },
    });
    const rows = db.all<StoredRow & { name: string; primary_muscle_group: string }>(
      sql`select id, name, primary_muscle_group, user_id, updated_at, deleted_at, origin from exercises where id = 'custom-1'`,
    );
    expect(rows).toEqual([
      {
        id: 'custom-1',
        name: 'Remo con mancuerna',
        primary_muscle_group: 'lats',
        user_id: null,
        updated_at: savedAt.getTime(),
        deleted_at: null,
        origin: 'custom',
      },
    ]);
  });

  it('lists the new exercise in alphabetical position among the seeded ones, marked as custom', () => {
    createCustomExercise(
      repository,
      {
        name: 'Zancadas con salto',
        primaryMuscleGroup: 'quads',
        secondaryMuscleGroups: [],
        equipment: null,
      },
      deps,
    );
    createCustomExercise(
      repository,
      {
        name: 'Aaa primero',
        primaryMuscleGroup: 'abs',
        secondaryMuscleGroups: [],
        equipment: null,
      },
      { ...deps, newId: () => 'custom-2' },
    );

    const listed = listExercises(repository);

    const sortedNames = listed.map((exercise) => exercise.name);
    expect(sortedNames).toEqual([...sortedNames].sort((a, b) => collator.compare(a, b)));
    expect(listed[0]).toMatchObject({ name: 'Aaa primero', origin: 'custom' });
    expect(listed.find((exercise) => exercise.id === 'custom-1')?.origin).toBe('custom');
    expect(listed).toHaveLength(SEEDED_EXERCISES.length + 2);
  });

  it.each([
    [
      'an empty name',
      {
        name: '',
        primaryMuscleGroup: 'chest' as const,
        secondaryMuscleGroups: [],
        equipment: null,
      },
      ['nameRequired'],
    ],
    [
      'a whitespace-only name',
      {
        name: '  ',
        primaryMuscleGroup: 'chest' as const,
        secondaryMuscleGroups: [],
        equipment: null,
      },
      ['nameRequired'],
    ],
    [
      'no muscle group',
      { name: 'Remo', primaryMuscleGroup: null, secondaryMuscleGroups: [], equipment: null },
      ['muscleGroupRequired'],
    ],
    [
      'the name of a seeded exercise, ignoring case, accents, and spaces',
      {
        name: ' press de BANCA con barra ',
        primaryMuscleGroup: 'chest' as const,
        secondaryMuscleGroups: [],
        equipment: null,
      },
      ['duplicateName'],
    ],
  ])('stores nothing and returns the errors for %s', (_label, input, errors) => {
    const before = countRows();

    expect(createCustomExercise(repository, input, deps)).toEqual({ ok: false, errors });

    expect(countRows()).toBe(before);
  });

  it('rejects the name of an existing custom exercise', () => {
    createCustomExercise(
      repository,
      { name: 'Remo', primaryMuscleGroup: 'lats', secondaryMuscleGroups: [], equipment: null },
      deps,
    );

    const result = createCustomExercise(
      repository,
      { name: 'remo', primaryMuscleGroup: 'lats', secondaryMuscleGroups: [], equipment: null },
      { ...deps, newId: () => 'custom-2' },
    );

    expect(result).toEqual({ ok: false, errors: ['duplicateName'] });
  });

  it('does not treat the name of a soft-deleted exercise as a duplicate', () => {
    const [deleted] = SEEDED_EXERCISES;
    db.run(sql`update exercises set deleted_at = ${Date.now()} where id = ${deleted.id}`);

    const result = createCustomExercise(
      repository,
      {
        name: deleted.name,
        primaryMuscleGroup: deleted.primaryMuscleGroup,
        secondaryMuscleGroups: [],
        equipment: null,
      },
      deps,
    );

    expect(result.ok).toBe(true);
  });

  describe('optional attributes', () => {
    type AttributeRow = { secondary_muscle_groups: string; equipment: string | null };
    const readAttributes = () =>
      db.all<AttributeRow>(
        sql`select secondary_muscle_groups, equipment from exercises where id = 'custom-1'`,
      );

    it('stores the secondary muscle groups and the equipment', () => {
      const result = createCustomExercise(
        repository,
        {
          name: 'Remo',
          primaryMuscleGroup: 'lats',
          secondaryMuscleGroups: ['biceps', 'forearms'],
          equipment: 'cable',
        },
        deps,
      );

      expect(result.ok).toBe(true);
      expect(readAttributes()).toEqual([
        { secondary_muscle_groups: '["biceps","forearms"]', equipment: 'cable' },
      ]);
      expect(getExercise(repository, 'custom-1')).toMatchObject({
        secondaryMuscleGroups: ['biceps', 'forearms'],
        equipment: 'cable',
      });
    });

    it('creates the exercise when both are left empty', () => {
      const result = createCustomExercise(
        repository,
        { name: 'Remo', primaryMuscleGroup: 'lats', secondaryMuscleGroups: [], equipment: null },
        deps,
      );

      expect(result.ok).toBe(true);
      expect(readAttributes()).toEqual([{ secondary_muscle_groups: '[]', equipment: null }]);
    });

    it('does not store the primary group as secondary', () => {
      createCustomExercise(
        repository,
        {
          name: 'Remo',
          primaryMuscleGroup: 'lats',
          secondaryMuscleGroups: ['lats', 'biceps'],
          equipment: null,
        },
        deps,
      );

      expect(readAttributes()).toEqual([
        { secondary_muscle_groups: '["biceps"]', equipment: null },
      ]);
    });
  });
});
