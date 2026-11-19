import { render, screen } from '@testing-library/react-native';

import { getExercise, type Exercise } from '../application';
import { ExerciseDetailScreen } from './ExerciseDetailScreen';

// UI never touches the DB: the use case is mocked here.
jest.mock('../application', () => ({
  getExercise: jest.fn(),
}));

const mockedGetExercise = jest.mocked(getExercise);

function exercise(overrides: Partial<Exercise>): Exercise {
  return {
    id: 'id',
    name: 'Name',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: [],
    equipment: null,
    origin: 'seeded',
    ...overrides,
  };
}

describe('ExerciseDetailScreen', () => {
  it('shows the name, primary and secondary muscle groups, and equipment in Spanish', async () => {
    mockedGetExercise.mockReturnValue(
      exercise({
        id: 'bench',
        name: 'Press de banca con barra',
        primaryMuscleGroup: 'chest',
        secondaryMuscleGroups: ['triceps', 'shoulders'],
        equipment: 'barbell',
      }),
    );

    await render(<ExerciseDetailScreen id="bench" />);

    expect(mockedGetExercise).toHaveBeenCalledWith('bench');
    expect(screen.getByText('Press de banca con barra')).toBeOnTheScreen();
    expect(screen.getByText('Grupo muscular principal')).toBeOnTheScreen();
    expect(screen.getByText('Pecho')).toBeOnTheScreen();
    expect(screen.getByText('Grupos musculares secundarios')).toBeOnTheScreen();
    expect(screen.getByText('Tríceps, Hombros')).toBeOnTheScreen();
    expect(screen.getByText('Equipamiento')).toBeOnTheScreen();
    expect(screen.getByText('Barra')).toBeOnTheScreen();
  });

  it('does not render the secondary groups or equipment sections when there are none', async () => {
    mockedGetExercise.mockReturnValue(exercise({ name: 'Dominadas', primaryMuscleGroup: 'lats' }));

    await render(<ExerciseDetailScreen id="id" />);

    expect(screen.getByText('Dominadas')).toBeOnTheScreen();
    expect(screen.getByText('Grupo muscular principal')).toBeOnTheScreen();
    expect(screen.queryByText('Grupos musculares secundarios')).not.toBeOnTheScreen();
    expect(screen.queryByText('Equipamiento')).not.toBeOnTheScreen();
  });

  it('shows a not-found message for an unknown id', async () => {
    mockedGetExercise.mockReturnValue(undefined);

    await render(<ExerciseDetailScreen id="missing" />);

    expect(screen.getByText('No encontramos este ejercicio')).toBeOnTheScreen();
    expect(screen.queryByText('Grupo muscular principal')).not.toBeOnTheScreen();
  });
});
