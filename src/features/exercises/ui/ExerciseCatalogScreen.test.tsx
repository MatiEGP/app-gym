import { fireEvent, render, screen } from '@testing-library/react-native';

import { listExercises, type Exercise } from '../application';
import { ExerciseCatalogScreen } from './ExerciseCatalogScreen';

// UI never touches the DB: the use case is mocked here. Seeding, sorting, and storage are
// covered against a real in-memory SQLite in application/catalog.test.ts. The filter is pure
// and stays real.
jest.mock('../application', () => ({
  listExercises: jest.fn(),
  filterExercisesByName: jest.requireActual('../domain/exercise').filterExercisesByName,
}));

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

  describe('search', () => {
    const rowLabels = () =>
      screen.queryAllByLabelText(/, /).map((row) => row.props.accessibilityLabel);

    beforeEach(() => {
      mockedListExercises.mockReturnValue([
        exercise({ id: '1', name: 'Curl de bíceps', primaryMuscleGroup: 'biceps' }),
        exercise({ id: '2', name: 'Extensión de tríceps', primaryMuscleGroup: 'triceps' }),
        exercise({ id: '3', name: 'Press de banca', primaryMuscleGroup: 'chest' }),
      ]);
    });

    it('lists only exercises whose name contains the text, ignoring case and accents', async () => {
      await render(<ExerciseCatalogScreen />);

      await fireEvent.changeText(screen.getByPlaceholderText('Buscar ejercicio'), 'triceps');

      expect(rowLabels()).toEqual(['Extensión de tríceps, Tríceps']);
    });

    it('shows the full list for a spaces-only search', async () => {
      await render(<ExerciseCatalogScreen />);

      await fireEvent.changeText(screen.getByPlaceholderText('Buscar ejercicio'), '   ');

      expect(rowLabels()).toHaveLength(3);
    });

    it('shows an empty-state message when nothing matches and restores the list when cleared', async () => {
      await render(<ExerciseCatalogScreen />);
      const input = screen.getByPlaceholderText('Buscar ejercicio');

      await fireEvent.changeText(input, 'sentadilla');

      expect(screen.getByText('No se encontraron ejercicios')).toBeOnTheScreen();
      expect(rowLabels()).toEqual([]);

      await fireEvent.changeText(input, '');

      expect(screen.queryByText('No se encontraron ejercicios')).not.toBeOnTheScreen();
      expect(rowLabels()).toHaveLength(3);
    });
  });
});
