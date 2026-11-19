import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen, testRouter, within } from 'expo-router/testing-library';

import ExerciseDetailRoute from '@/app/exercises/[id]';
import EditExerciseRoute from '@/app/exercises/edit/[id]';
import CatalogRoute from '@/app/index';

import type { Equipment, Exercise, MuscleGroup } from '../application';

// Stateful fake of the feature's public API: it validates through the real domain rule and
// keeps the edited exercises, so the flow runs through the real routes and screens.
const mockStore: { exercises: Exercise[] } = { exercises: [] };

jest.mock('../application', () => ({
  listExercises: () => {
    const { sortExercisesByName: sort } = jest.requireActual('../domain/exercise');
    return sort(mockStore.exercises);
  },
  getExercise: (id: string) => mockStore.exercises.find((e) => e.id === id),
  updateCustomExercise: (
    id: string,
    input: {
      name: string;
      primaryMuscleGroup: MuscleGroup | null;
      secondaryMuscleGroups: MuscleGroup[];
      equipment: Equipment | null;
    },
  ) => {
    const { validateNewExercise: validate } = jest.requireActual('../domain/new-exercise');
    const current = mockStore.exercises.find((e) => e.id === id);
    if (!current || current.origin !== 'custom') return { ok: false, errors: ['notEditable'] };
    const errors = validate(
      input,
      mockStore.exercises.filter((e) => e.id !== id),
    );
    if (errors.length > 0 || input.primaryMuscleGroup === null) return { ok: false, errors };
    const exercise: Exercise = {
      ...current,
      name: input.name.trim(),
      primaryMuscleGroup: input.primaryMuscleGroup,
      secondaryMuscleGroups: input.secondaryMuscleGroups,
      equipment: input.equipment,
    };
    mockStore.exercises = mockStore.exercises.map((e) => (e.id === id ? exercise : e));
    return { ok: true, exercise };
  },
  filterExercisesByName: jest.requireActual('../domain/exercise').filterExercisesByName,
  filterExercisesByMuscleGroup:
    jest.requireActual('../domain/exercise').filterExercisesByMuscleGroup,
  MUSCLE_GROUPS: jest.requireActual('../domain/muscle-group').MUSCLE_GROUPS,
  EQUIPMENT: jest.requireActual('../domain/equipment').EQUIPMENT,
  cleanSecondaryMuscleGroups:
    jest.requireActual('../domain/new-exercise').cleanSecondaryMuscleGroups,
}));

const routes = {
  _layout: () => <Stack />,
  index: CatalogRoute,
  'exercises/[id]': ExerciseDetailRoute,
  'exercises/edit/[id]': EditExerciseRoute,
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

describe('editing a custom exercise', () => {
  beforeEach(() => {
    mockStore.exercises = [bench, row];
  });

  it('saves the new name and group, returns to the detail, and shows them in the catalog', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/row' });

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar' }));
    expect(screen).toHavePathname('/exercises/edit/row');
    expect(screen.getByDisplayValue('Remo con mancuerna')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Nombre del ejercicio'), 'Remo unilateral');
    await fireEvent.press(
      within(screen.getByLabelText('Grupo muscular principal')).getByRole('button', {
        name: 'Espalda alta',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen).toHavePathname('/exercises/row');
    expect(await screen.findByText('Remo unilateral')).toBeOnTheScreen();
    expect(screen.getByText('Espalda alta')).toBeOnTheScreen();
  });

  it('shows the new name in the catalog after editing from the catalog', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Remo con mancuerna, Dorsales, Propio' }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: 'Editar' }));
    await fireEvent.changeText(screen.getByLabelText('Nombre del ejercicio'), 'Remo unilateral');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen).toHavePathname('/exercises/row');

    expect(await screen.findByText('Remo unilateral')).toBeOnTheScreen();
    await testRouter.back('/');

    expect(screen).toHavePathname('/');
    expect(
      await screen.findByRole('button', { name: 'Remo unilateral, Dorsales, Propio' }),
    ).toBeOnTheScreen();
  });

  it('keeps the form and shows the duplicate error when taking another name', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/edit/row' });

    await fireEvent.changeText(
      screen.getByLabelText('Nombre del ejercicio'),
      'press de banca con barra',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen).toHavePathname('/exercises/edit/row');
    expect(screen.getByText('Ya existe un ejercicio con ese nombre')).toBeOnTheScreen();
  });

  it('offers no edit button on the detail of a seeded exercise', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/bench' });

    expect(await screen.findByText('Press de banca con barra')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
  });

  it('shows a message instead of the form for a seeded exercise', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/edit/bench' });

    expect(await screen.findByText('Este ejercicio no se puede editar')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull();
  });
});
