import { normalizeExerciseName, sortExercisesByName } from './exercise';

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
