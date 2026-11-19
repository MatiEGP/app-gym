import { eq, sql } from 'drizzle-orm';

import journal from './migrations/meta/_journal.json';
import { appMeta } from './schema';
import { createTestDb } from './test-db';

describe('createTestDb', () => {
  it('applies every committed migration to a fresh in-memory database', async () => {
    const db = await createTestDb();

    const applied = db.all<{ created_at: number }>(
      sql`select created_at from __drizzle_migrations order by id`,
    );

    expect(applied.map((row) => Number(row.created_at))).toEqual(
      journal.entries.map((entry) => entry.when),
    );
  });

  it('round-trips an app_meta row', async () => {
    const db = await createTestDb();

    db.insert(appMeta).values({ key: 'seed_version', value: '1' }).run();
    const row = db.select().from(appMeta).where(eq(appMeta.key, 'seed_version')).get();

    expect(row).toEqual({ key: 'seed_version', value: '1', updatedAt: expect.any(Date) });
  });

  it('gives every call its own empty database', async () => {
    const first = await createTestDb();
    first.insert(appMeta).values({ key: 'seed_version', value: '1' }).run();

    const second = await createTestDb();

    expect(second.select().from(appMeta).all()).toEqual([]);
  });
});
