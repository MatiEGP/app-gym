import { sql } from 'drizzle-orm';

import type { AppDatabase } from '@/shared/db/database';
import { createTestDb } from '@/shared/db/test-db';

import { SEEDED_EXERCISES } from '../domain/seeded-exercises';
import { createSqliteExerciseRepository } from '../infrastructure/sqlite-exercise-repository';
import { getExercise, listExercises, seedExerciseCatalog } from './catalog';

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
