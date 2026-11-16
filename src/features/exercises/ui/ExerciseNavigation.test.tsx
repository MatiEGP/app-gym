import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import ExerciseDetailRoute from '@/app/exercises/[id]';
import CatalogRoute from '@/app/index';

import { getExercise, listExercises, type Exercise } from '../application';

// Real Expo Router navigation between the real catalog and detail routes. Only data access is
// mocked: `ui/` may not import the database, not even in tests.
jest.mock('../application', () => ({
  listExercises: jest.fn(),
  getExercise: jest.fn(),
  filterExercisesByName: jest.requireActual('../domain/exercise').filterExercisesByName,
  filterExercisesByMuscleGroup:
    jest.requireActual('../domain/exercise').filterExercisesByMuscleGroup,
  MUSCLE_GROUPS: jest.requireActual('../domain/muscle-group').MUSCLE_GROUPS,
}));

const bench: Exercise = {
  id: 'bench',
  name: 'Press de banca con barra',
  primaryMuscleGroup: 'chest',
  secondaryMuscleGroups: ['triceps'],
  equipment: 'barbell',
  origin: 'seeded',
};

const benchRow = { name: 'Press de banca con barra, Pecho' };

describe('catalog and detail navigation', () => {
  beforeEach(() => {
    jest.mocked(listExercises).mockReturnValue([bench]);
    jest.mocked(getExercise).mockImplementation((id) => (id === bench.id ? bench : undefined));
  });

  it('opens the details of a tapped exercise and returns to the catalog on back', async () => {
    await renderRouter(
      {
        _layout: () => <Stack />,
        index: CatalogRoute,
        'exercises/[id]': ExerciseDetailRoute,
      },
      { initialUrl: '/' },
    );

    await fireEvent.press(screen.getByRole('button', benchRow));

    expect(screen).toHavePathname('/exercises/bench');
    expect(await screen.findByText('Equipamiento')).toBeOnTheScreen();
    expect(screen.getByText('Barra')).toBeOnTheScreen();

    await testRouter.back('/');

    expect(screen.queryByText('Equipamiento')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', benchRow)).toBeOnTheScreen();
  });
});
