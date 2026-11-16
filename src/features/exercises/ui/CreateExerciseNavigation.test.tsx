import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import CreateExerciseRoute from '@/app/exercises/new';
import CatalogRoute from '@/app/index';

import type { Exercise, MuscleGroup } from '../application';

// Stateful fake of the feature's public API: it validates through the real domain rule and
// keeps the created exercises, so the flow runs through the real routes and screens.
const mockStore: { exercises: Exercise[] } = { exercises: [] };

jest.mock('../application', () => ({
  listExercises: () => {
    const { sortExercisesByName: sort } = jest.requireActual('../domain/exercise');
    return sort(mockStore.exercises);
  },
  getExercise: jest.fn(),
  createCustomExercise: (input: { name: string; primaryMuscleGroup: MuscleGroup | null }) => {
    const { validateNewExercise: validate } = jest.requireActual('../domain/new-exercise');
    const errors = validate(input, mockStore.exercises);
    if (errors.length > 0 || input.primaryMuscleGroup === null) return { ok: false, errors };
    const exercise: Exercise = {
      id: `custom-${mockStore.exercises.length}`,
      name: input.name.trim(),
      primaryMuscleGroup: input.primaryMuscleGroup,
      secondaryMuscleGroups: [],
      equipment: null,
      origin: 'custom',
    };
    mockStore.exercises = [...mockStore.exercises, exercise];
    return { ok: true, exercise };
  },
  filterExercisesByName: jest.requireActual('../domain/exercise').filterExercisesByName,
  filterExercisesByMuscleGroup:
    jest.requireActual('../domain/exercise').filterExercisesByMuscleGroup,
  MUSCLE_GROUPS: jest.requireActual('../domain/muscle-group').MUSCLE_GROUPS,
}));

const routes = {
  _layout: () => <Stack />,
  index: CatalogRoute,
  'exercises/new': CreateExerciseRoute,
};

const bench: Exercise = {
  id: 'bench',
  name: 'Press de banca con barra',
  primaryMuscleGroup: 'chest',
  secondaryMuscleGroups: ['triceps'],
  equipment: 'barbell',
  origin: 'seeded',
};

describe('creating a custom exercise', () => {
  beforeEach(() => {
    mockStore.exercises = [bench];
  });

  it('saves a new exercise, returns to the catalog, and lists it in order marked as custom', async () => {
    await renderRouter(routes, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Nuevo ejercicio' }));
    expect(screen).toHavePathname('/exercises/new');

    await fireEvent.changeText(screen.getByLabelText('Nombre del ejercicio'), '  Abdominales  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Abdominales' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen).toHavePathname('/');
    const rows = screen.getAllByLabelText(/, /);
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual([
      'Abdominales, Abdominales, Propio',
      'Press de banca con barra, Pecho',
    ]);
  });

  it('shows Spanish validation messages and creates nothing when saving without a name', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/new' });

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen).toHavePathname('/exercises/new');
    expect(screen.getByText('Escribí un nombre')).toBeOnTheScreen();
    expect(screen.getByText('Elegí un grupo muscular')).toBeOnTheScreen();
    expect(mockStore.exercises).toEqual([bench]);
  });

  it('shows the duplicate error when the name already exists ignoring case and accents', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/new' });

    await fireEvent.changeText(
      screen.getByLabelText('Nombre del ejercicio'),
      ' PRESS de bánca con barra ',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Pecho' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('Ya existe un ejercicio con ese nombre')).toBeOnTheScreen();
    expect(mockStore.exercises).toEqual([bench]);
  });
});
