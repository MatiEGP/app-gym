import { cleanSecondaryMuscleGroups, validateNewExercise } from './new-exercise';

const active = [{ name: 'Press de banca con barra' }, { name: 'Sentadilla' }];

describe('validateNewExercise', () => {
  it('accepts a name with a muscle group', () => {
    expect(validateNewExercise({ name: 'Remo', primaryMuscleGroup: 'lats' }, active)).toEqual([]);
  });

  it('requires a name', () => {
    expect(validateNewExercise({ name: '', primaryMuscleGroup: 'lats' }, active)).toEqual([
      'nameRequired',
    ]);
  });

  it('treats a whitespace-only name as empty', () => {
    expect(validateNewExercise({ name: '   \t ', primaryMuscleGroup: 'lats' }, active)).toEqual([
      'nameRequired',
    ]);
  });

  it('requires a muscle group', () => {
    expect(validateNewExercise({ name: 'Remo', primaryMuscleGroup: null }, active)).toEqual([
      'muscleGroupRequired',
    ]);
  });

  it('reports both errors when the name and the muscle group are missing', () => {
    expect(validateNewExercise({ name: ' ', primaryMuscleGroup: null }, active)).toEqual([
      'nameRequired',
      'muscleGroupRequired',
    ]);
  });

  it.each([
    ['case', 'SENTADILLA'],
    ['accents', 'Séntádilla'],
    ['surrounding spaces', '  Sentadilla  '],
    ['all of them', ' press DE bánca CON barra '],
  ])('rejects a name equal to an active one ignoring %s', (_label, name) => {
    expect(validateNewExercise({ name, primaryMuscleGroup: 'quads' }, active)).toEqual([
      'duplicateName',
    ]);
  });

  it('does not flag a name that only contains an existing one', () => {
    expect(
      validateNewExercise({ name: 'Sentadilla búlgara', primaryMuscleGroup: 'quads' }, active),
    ).toEqual([]);
  });
});

describe('cleanSecondaryMuscleGroups', () => {
  it('removes the primary group', () => {
    expect(cleanSecondaryMuscleGroups('chest', ['chest', 'triceps'])).toEqual(['triceps']);
  });

  it('removes duplicates and keeps the order of the muscle group list', () => {
    expect(cleanSecondaryMuscleGroups('lats', ['biceps', 'chest', 'biceps'])).toEqual([
      'chest',
      'biceps',
    ]);
  });

  it('keeps every group when there is no primary yet', () => {
    expect(cleanSecondaryMuscleGroups(null, ['abs', 'chest'])).toEqual(['chest', 'abs']);
  });
});
