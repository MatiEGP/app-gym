import { render, screen } from '@testing-library/react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Text } from 'react-native';

import { MigrationGate } from './MigrationGate';

// The migrator is mocked: these tests cover what the gate renders for each migration state.
jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({ useMigrations: jest.fn() }));
jest.mock('./client', () => ({ db: {} }));
jest.mock('./migrations/migrations', () => ({
  __esModule: true,
  default: { journal: { entries: [] }, migrations: {} },
}));

const mockedUseMigrations = jest.mocked(useMigrations);

function renderGate() {
  return render(
    <MigrationGate>
      <Text>App content</Text>
    </MigrationGate>,
  );
}

describe('MigrationGate', () => {
  it('shows a loading state and hides the app while migrations are pending', async () => {
    mockedUseMigrations.mockReturnValue({ success: false, error: undefined });

    await renderGate();

    expect(screen.getByLabelText('Preparando la base de datos')).toBeOnTheScreen();
    expect(screen.queryByText('App content')).not.toBeOnTheScreen();
  });

  it('renders the app once migrations succeed', async () => {
    mockedUseMigrations.mockReturnValue({ success: true, error: undefined });

    await renderGate();

    expect(screen.getByText('App content')).toBeOnTheScreen();
  });

  it('shows a Spanish error screen instead of crashing when a migration fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedUseMigrations.mockReturnValue({
      success: false,
      error: new Error('table already exists'),
    });

    await renderGate();

    expect(screen.getByText('No se pudo preparar la base de datos')).toBeOnTheScreen();
    expect(
      screen.getByText('Cerrá la app y volvé a abrirla. Si el problema sigue, reinstalala.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('App content')).not.toBeOnTheScreen();
    error.mockRestore();
  });
});
