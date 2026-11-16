import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import ExerciseDetailRoute from '@/app/exercises/[id]';
import CreateExerciseRoute from '@/app/exercises/new';
import CatalogRoute from '@/app/index';

import type { Equipment, Exercise, MuscleGroup } from '../application';

// Stateful fake of the feature's public API: it validates through the real domain rule and
// keeps the created exercises, so the flow runs through the real routes and screens.
const mockStore: { exercises: Exercise[] } = { exercises: [] };

jest.mock('../application', () => ({
  listExercises: () => {
    const { sortExercisesByName: sort } = jest.requireActual('../domain/exercise');
    return sort(mockStore.exercises);
  },
  getExercise: (id: string) => mockStore.exercises.find((e) => e.id === id),
  createCustomExercise: (input: {
    name: string;
    primaryMuscleGroup: MuscleGroup | null;
    secondaryMuscleGroups: MuscleGroup[];
    equipment: Equipment | null;
  }) => {
    const { validateNewExercise: validate } = jest.requireActual('../domain/new-exercise');
    const errors = validate(input, mockStore.exercises);
    if (errors.length > 0 || input.primaryMuscleGroup === null) return { ok: false, errors };
    const exercise: Exercise = {
      id: `custom-${mockStore.exercises.length}`,
      name: input.name.trim(),
      primaryMuscleGroup: input.primaryMuscleGroup,
      secondaryMuscleGroups: input.secondaryMuscleGroups,
      equipment: input.equipment,
      origin: 'custom',
    };
    mockStore.exercises = [...mockStore.exercises, exercise];
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
  'exercises/new': CreateExerciseRoute,
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

describe('creating a custom exercise', () => {
  beforeEach(() => {
    mockStore.exercises = [bench];
  });

  it('saves a new exercise, returns to the catalog, and lists it in order marked as custom', async () => {
    await renderRouter(routes, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Nuevo ejercicio' }));
    expect(screen).toHavePathname('/exercises/new');

    await fireEvent.changeText(screen.getByLabelText('Nombre del ejercicio'), '  Abdominales  ');
    await fireEvent.press(
      within(screen.getByLabelText('Grupo muscular principal')).getByRole('button', {
        name: 'Abdominales',
      }),
    );
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
    await fireEvent.press(
      within(screen.getByLabelText('Grupo muscular principal')).getByRole('button', {
        name: 'Pecho',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('Ya existe un ejercicio con ese nombre')).toBeOnTheScreen();
    expect(mockStore.exercises).toEqual([bench]);
  });

  it('saves the secondary muscle groups and the equipment and shows them in the detail', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Nuevo ejercicio' }));

    await fireEvent.changeText(screen.getByLabelText('Nombre del ejercicio'), 'Remo en polea');
    const primary = within(screen.getByLabelText('Grupo muscular principal'));
    const secondary = within(screen.getByLabelText('Grupos musculares secundarios'));
    const equipment = within(screen.getByLabelText('Equipamiento'));
    await fireEvent.press(primary.getByRole('button', { name: 'Dorsales' }));
    await fireEvent.press(secondary.getByRole('button', { name: 'Bíceps' }));
    await fireEvent.press(secondary.getByRole('button', { name: 'Antebrazos' }));
    await fireEvent.press(equipment.getByRole('button', { name: 'Polea' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen).toHavePathname('/');
    await fireEvent.press(screen.getByRole('button', { name: 'Remo en polea, Dorsales, Propio' }));
    expect(await screen.findByText('Bíceps, Antebrazos')).toBeOnTheScreen();
    expect(screen.getByText('Polea')).toBeOnTheScreen();
  });

  it('does not offer the primary group as secondary and drops it from the secondary selection', async () => {
    await renderRouter(routes, { initialUrl: '/exercises/new' });
    const primary = within(screen.getByLabelText('Grupo muscular principal'));
    const secondary = within(screen.getByLabelText('Grupos musculares secundarios'));

    await fireEvent.press(primary.getByRole('button', { name: 'Pecho' }));
    expect(secondary.queryByRole('button', { name: 'Pecho' })).toBeNull();
    expect(secondary.getByRole('button', { name: 'Tríceps' })).toBeOnTheScreen();

    await fireEvent.press(secondary.getByRole('button', { name: 'Tríceps' }));
    await fireEvent.press(primary.getByRole('button', { name: 'Tríceps' }));
    expect(secondary.queryByRole('button', { name: 'Tríceps' })).toBeNull();
    expect(secondary.getByRole('button', { name: 'Pecho' })).toBeOnTheScreen();
    expect(secondary.getByRole('button', { name: 'Pecho' })).not.toBeSelected();
  });

  it('saves with only a name and a primary group', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Nuevo ejercicio' }));

    await fireEvent.changeText(screen.getByLabelText('Nombre del ejercicio'), 'Plancha');
    await fireEvent.press(
      within(screen.getByLabelText('Grupo muscular principal')).getByRole('button', {
        name: 'Abdominales',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen).toHavePathname('/');
    expect(mockStore.exercises.at(-1)).toMatchObject({
      name: 'Plancha',
      secondaryMuscleGroups: [],
      equipment: null,
    });
  });
});
