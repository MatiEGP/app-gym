import { render, screen } from '@testing-library/react-native';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { Text } from 'react-native';

import { MigrationGate } from './MigrationGate';

// The migrator is mocked: these tests cover what the gate renders for each startup state.
jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({ migrate: jest.fn() }));
jest.mock('./client', () => ({ db: {} }));
jest.mock('./migrations/migrations', () => ({
  __esModule: true,
  default: { journal: { entries: [] }, migrations: {} },
}));

const mockedMigrate = jest.mocked(migrate);

function renderGate(onMigrated?: () => void) {
  return render(
    <MigrationGate onMigrated={onMigrated}>
      <Text>App content</Text>
    </MigrationGate>,
  );
}

describe('MigrationGate', () => {
  beforeEach(() => {
    mockedMigrate.mockReset();
  });

  it('shows a loading state and hides the app while migrations are pending', async () => {
    mockedMigrate.mockReturnValue(new Promise(() => {}));

    await renderGate();

    expect(screen.getByLabelText('Preparando la base de datos')).toBeOnTheScreen();
    expect(screen.queryByText('App content')).not.toBeOnTheScreen();
  });

  it('renders the app once migrations succeed', async () => {
    mockedMigrate.mockResolvedValue(undefined);

    await renderGate();

    expect(await screen.findByText('App content')).toBeOnTheScreen();
  });

  it('shows a Spanish error screen instead of crashing when a migration fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedMigrate.mockRejectedValue(new Error('table already exists'));

    await renderGate();

    expect(await screen.findByText('No se pudo preparar la base de datos')).toBeOnTheScreen();
    expect(
      screen.getByText('Cerrá la app y volvé a abrirla. Si el problema sigue, reinstalala.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('App content')).not.toBeOnTheScreen();
    error.mockRestore();
  });

  it('runs the post-migration step once before rendering the app', async () => {
    mockedMigrate.mockResolvedValue(undefined);
    const onMigrated = jest.fn();

    await renderGate(onMigrated);

    expect(await screen.findByText('App content')).toBeOnTheScreen();
    expect(onMigrated).toHaveBeenCalledTimes(1);
  });

  it('does not run the post-migration step while migrations are pending', async () => {
    mockedMigrate.mockReturnValue(new Promise(() => {}));
    const onMigrated = jest.fn();

    await renderGate(onMigrated);

    expect(onMigrated).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Preparando la base de datos')).toBeOnTheScreen();
  });

  it('shows the Spanish error screen when the post-migration step fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedMigrate.mockResolvedValue(undefined);

    await renderGate(() => {
      throw new Error('seed failed');
    });

    expect(await screen.findByText('No se pudo preparar la base de datos')).toBeOnTheScreen();
    expect(screen.queryByText('App content')).not.toBeOnTheScreen();
    error.mockRestore();
  });
});
