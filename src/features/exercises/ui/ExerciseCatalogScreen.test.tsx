import { render, screen } from '@testing-library/react-native';

import { listExercises, type Exercise } from '../application';
import { ExerciseCatalogScreen } from './ExerciseCatalogScreen';

// UI never touches the DB: the use case is mocked here. Seeding, sorting, and storage are
// covered against a real in-memory SQLite in application/catalog.test.ts.
jest.mock('../application', () => ({ listExercises: jest.fn() }));

const mockedListExercises = jest.mocked(listExercises);

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

describe('ExerciseCatalogScreen', () => {
  it('shows every exercise with its Spanish muscle group label, in the order of the use case', async () => {
    mockedListExercises.mockReturnValue([
      exercise({ id: '1', name: 'Curl de bíceps con mancuernas', primaryMuscleGroup: 'biceps' }),
      exercise({ id: '2', name: 'Hiperextensiones', primaryMuscleGroup: 'lower_back' }),
      exercise({ id: '3', name: 'Press de banca con barra', primaryMuscleGroup: 'chest' }),
    ]);

    await render(<ExerciseCatalogScreen />);

    const rows = screen.getAllByLabelText(/, /);
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual([
      'Curl de bíceps con mancuernas, Bíceps',
      'Hiperextensiones, Zona lumbar',
      'Press de banca con barra, Pecho',
    ]);
    expect(screen.getByText('Press de banca con barra')).toBeOnTheScreen();
    expect(screen.getByText('Zona lumbar')).toBeOnTheScreen();
  });
});
