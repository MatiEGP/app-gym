import {
  filterExercisesByMuscleGroup,
  filterExercisesByName,
  normalizeExerciseName,
  sortExercisesByName,
} from './exercise';
import type { MuscleGroup } from './muscle-group';

describe('filterExercisesByMuscleGroup', () => {
  type Item = {
    name: string;
    primaryMuscleGroup: MuscleGroup;
    secondaryMuscleGroups: MuscleGroup[];
  };
  const exercises: Item[] = [
    { name: 'Curl', primaryMuscleGroup: 'biceps', secondaryMuscleGroups: [] },
    { name: 'Press de banca', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['triceps'] },
    { name: 'Extensión', primaryMuscleGroup: 'triceps', secondaryMuscleGroups: [] },
    { name: 'Fondos', primaryMuscleGroup: 'triceps', secondaryMuscleGroups: ['chest'] },
  ];
  const names = (list: Item[]) => list.map((exercise) => exercise.name);

  it('keeps only exercises whose primary group is the selected one, not secondary matches', () => {
    expect(names(filterExercisesByMuscleGroup(exercises, 'triceps'))).toEqual([
      'Extensión',
      'Fondos',
    ]);
  });

  it('returns every exercise, as a new array, when no group is selected', () => {
    const all = filterExercisesByMuscleGroup(exercises, null);

    expect(names(all)).toEqual(names(exercises));
    expect(all).not.toBe(exercises);
  });

  it('returns an empty array when no exercise has that primary group', () => {
    expect(filterExercisesByMuscleGroup(exercises, 'calves')).toEqual([]);
  });
});

describe('filterExercisesByName', () => {
  const exercises = [
    { name: 'Curl de bíceps' },
    { name: 'Extensión de tríceps' },
    { name: 'Press francés para TRÍCEPS' },
  ];
  const names = (list: { name: string }[]) => list.map((exercise) => exercise.name);

  it('matches by containment ignoring case and accents', () => {
    const expected = ['Extensión de tríceps', 'Press francés para TRÍCEPS'];

    expect(names(filterExercisesByName(exercises, 'triceps'))).toEqual(expected);
    expect(names(filterExercisesByName(exercises, 'TRÍCEPS'))).toEqual(expected);
    expect(names(filterExercisesByName(exercises, 'ension de'))).toEqual(['Extensión de tríceps']);
  });

  it('returns every exercise, as a new array, for an empty or spaces-only query', () => {
    const empty = filterExercisesByName(exercises, '');
    const spaces = filterExercisesByName(exercises, '   ');

    expect(names(empty)).toEqual(names(exercises));
    expect(names(spaces)).toEqual(names(exercises));
    expect(empty).not.toBe(exercises);
  });

  it('ignores surrounding spaces in the query', () => {
    expect(names(filterExercisesByName(exercises, '  curl  '))).toEqual(['Curl de bíceps']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterExercisesByName(exercises, 'sentadilla')).toEqual([]);
  });

  it('preserves the order of the input', () => {
    expect(names(filterExercisesByName(exercises, 'de'))).toEqual([
      'Curl de bíceps',
      'Extensión de tríceps',
    ]);
  });
});

describe('normalizeExerciseName', () => {
  it('ignores case, accents, and surrounding spaces', () => {
    expect(normalizeExerciseName('  Extensión de TRÍCEPS ')).toBe('extension de triceps');
  });
});

describe('sortExercisesByName', () => {
  it('sorts by name ignoring case and accents', () => {
    const exercises = [
      { name: 'Remo con barra' },
      { name: 'Banca inclinada' },
      { name: 'Ábdominales' },
      { name: 'elevación de talones' },
      { name: 'Abducción de cadera' },
      { name: 'Elevación' },
    ];

    expect(sortExercisesByName(exercises).map((exercise) => exercise.name)).toEqual([
      'Ábdominales',
      'Abducción de cadera',
      'Banca inclinada',
      'Elevación',
      'elevación de talones',
      'Remo con barra',
    ]);
  });

  it('returns a new array and leaves the input untouched', () => {
    const exercises = [{ name: 'Sentadilla' }, { name: 'Curl' }];

    const sorted = sortExercisesByName(exercises);

    expect(sorted).not.toBe(exercises);
    expect(exercises.map((exercise) => exercise.name)).toEqual(['Sentadilla', 'Curl']);
  });
});
