// Architecture boundaries from AGENTS.md, enforced by eslint.config.js.
// Runs in the Jest "tooling" project (plain Node). Each case lints a one-line import as if it lived at `file`.
const { ESLint } = require('eslint');

// The real config is passed in directly: ESLint loads config files with a dynamic import(), which Jest's VM rejects.
const eslint = new ESLint({
  cwd: __dirname,
  overrideConfigFile: true,
  overrideConfig: require('./eslint.config.js'),
});

async function restrictedImports(file, source) {
  const [result] = await eslint.lintText(`import '${source}';\n`, { filePath: file });
  return result.messages
    .filter((message) => message.ruleId === 'no-restricted-imports')
    .map((message) => message.message);
}

const domainFile = 'src/features/routines/domain/routine.ts';
const uiFile = 'src/features/routines/ui/RoutineList.tsx';

describe('domain layer', () => {
  it.each([
    'react',
    'react-native',
    'expo-crypto',
    'expo-sqlite/next',
    '@expo/vector-icons',
    'drizzle-orm',
    'drizzle-orm/sqlite-core',
    '@supabase/supabase-js',
    '@/shared/db/client',
    '@/shared/sync/outbox',
  ])('rejects framework and data access import "%s"', async (source) => {
    expect((await restrictedImports(domainFile, source)).length).toBeGreaterThan(0);
  });

  it.each(['./set', '../domain/set'])('allows pure local import "%s"', async (source) => {
    expect(await restrictedImports(domainFile, source)).toEqual([]);
  });
});

describe('cross-feature imports', () => {
  it.each([
    '@/features/exercises/domain/exercise',
    '@/features/exercises/infrastructure/exercise-repository',
    '@/features/exercises/ui/ExercisePicker',
    '@/features/exercises',
  ])('rejects another feature internal module "%s"', async (source) => {
    expect((await restrictedImports(uiFile, source)).length).toBeGreaterThan(0);
  });

  it.each([
    '@/features/exercises/application/list-exercises',
    '@/features/routines/domain/routine',
  ])('allows "%s" (other feature application layer or own feature)', async (source) => {
    expect(await restrictedImports(uiFile, source)).toEqual([]);
  });

  it('rejects relative imports that climb out of the current folder', async () => {
    expect(
      (await restrictedImports(uiFile, '../../exercises/domain/exercise')).length,
    ).toBeGreaterThan(0);
  });
});

describe('ui layer', () => {
  it.each([
    'drizzle-orm',
    'expo-sqlite',
    '@supabase/supabase-js',
    '@/shared/db/client',
    '@/shared/sync/outbox',
    '../infrastructure/routine-repository',
    '@/features/routines/infrastructure/routine-repository',
  ])('rejects DB or Supabase access "%s"', async (source) => {
    expect((await restrictedImports(uiFile, source)).length).toBeGreaterThan(0);
  });

  it.each(['../application/list-routines', 'react-native', '@/shared/ui/PlaceholderScreen'])(
    'allows "%s"',
    async (source) => {
      expect(await restrictedImports(uiFile, source)).toEqual([]);
    },
  );
});
