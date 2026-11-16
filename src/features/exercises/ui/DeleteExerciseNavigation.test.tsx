import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Alert, type AlertButton } from 'react-native';

import ExerciseDetailRoute from '@/app/exercises/[id]';
import CatalogRoute from '@/app/index';

import type { Exercise } from '../application';

// Stateful fake of the feature's public API: deleting removes the exercise from the store, so the
// flow runs through the real routes and screens.
const mockStore: { exercises: Exercise[] } = { exercises: [] };

jest.mock('../application', () => ({
  listExercises: () => {
    const { sortExercisesByName: sort } = jest.requireActual('../domain/exercise');
    return sort(mockStore.exercises);
  },
  getExercise: (id: string) => mockStore.exercises.find((e) => e.id === id),
  deleteCustomExercise: (id: string) => {
    const current = mockStore.exercises.find((e) => e.id === id);
    if (!current || current.origin !== 'custom') return { ok: false, error: 'notDeletable' };
    mockStore.exercises = mockStore.exercises.filter((e) => e.id !== id);
    return { ok: true };
  },
  filterExercisesByName: jest.requireActual('../domain/exercise').filterExercisesByName,
  filterExercisesByMuscleGroup:
    jest.requireActual('../domain/exercise').filterExercisesByMuscleGroup,
  MUSCLE_GROUPS: jest.requireActual('../domain/muscle-group').MUSCLE_GROUPS,
}));

const routes = {
  _layout: () => <Stack />,
  index: CatalogRoute,
  'exercises/[id]': ExerciseDetailRoute,
};

const bench: Exercise = {
  id: 'bench',
  name: 'Press de banca con barra',
  primaryMuscleGroup: 'chest',
  secondaryMuscleGroups: ['triceps'],
  equipment: 'barbell',
  origin: 'seeded',
};
const row: Exercise = {
  id: 'row',
  name: 'Remo con mancuerna',
  primaryMuscleGroup: 'lats',
  secondaryMuscleGroups: [],
  equipment: null,
  origin: 'custom',
};

function pressedAlertButton(label: string): AlertButton {
  const spy = jest.mocked(Alert.alert);
  const buttons = spy.mock.calls[spy.mock.calls.length - 1][2] ?? [];
  const button = buttons.find((b) => b.text === label);
  if (!button) throw new Error(`No alert button "${label}"`);
  return button;
}

describe('deleting a custom exercise', () => {
  beforeEach(() => {
    mockStore.exercises = [bench, row];
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('removes it from the catalog, search, and filters after confirming', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Remo con mancuerna, Dorsales, Propio' }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: 'Eliminar' }));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(pressedAlertButton('Cancelar').style).toBe('cancel');
    const confirm = pressedAlertButton('Eliminar');
    expect(confirm.style).toBe('destructive');
    await (async () => confirm.onPress?.())();

    expect(
      await screen.findByRole('button', { name: 'Press de banca con barra, Pecho' }),
    ).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(screen.queryByText(/Remo con mancuerna/)).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Buscar ejercicio por nombre'), 'remo');
    expect(screen.queryByText(/Remo con mancuerna/)).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Buscar ejercicio por nombre'), '');
    await fireEvent.press(screen.getByRole('button', { name: 'Dorsales' }));
    expect(screen.queryByText(/Remo con mancuerna/)).toBeNull();
  });

  it('keeps the exercise and the detail when cancelling', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/row' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Eliminar' }));

    await (async () => pressedAlertButton('Cancelar').onPress?.())();

    expect(screen).toHavePathname('/exercises/row');
    expect(screen.getByText('Remo con mancuerna')).toBeOnTheScreen();
    expect(mockStore.exercises).toContain(row);
  });

  it('offers no delete button on the detail of a seeded exercise', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/bench' });

    expect(await screen.findByText('Press de banca con barra')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull();
  });
});
