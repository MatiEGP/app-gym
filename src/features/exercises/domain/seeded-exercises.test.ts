import { EQUIPMENT } from './equipment';
import { normalizeExerciseName } from './exercise';
import { MUSCLE_GROUPS } from './muscle-group';
import { SEEDED_EXERCISES } from './seeded-exercises';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('starter catalog', () => {
  it('has at least one exercise for every muscle group', () => {
    const covered = new Set(SEEDED_EXERCISES.map((exercise) => exercise.primaryMuscleGroup));

    expect(MUSCLE_GROUPS.filter((group) => !covered.has(group))).toEqual([]);
  });

  it('has unique UUID ids and unique non-empty names, ignoring case and accents', () => {
    const ids = SEEDED_EXERCISES.map((exercise) => exercise.id);
    const names = SEEDED_EXERCISES.map((exercise) => normalizeExerciseName(exercise.name));

    expect(ids.filter((id) => !UUID.test(id))).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(names.filter((name) => name === '')).toEqual([]);
    expect(new Set(names).size).toBe(names.length);
  });

  it('uses known values, with secondary groups that exclude the primary one', () => {
    for (const exercise of SEEDED_EXERCISES) {
      expect(MUSCLE_GROUPS).toContain(exercise.primaryMuscleGroup);
      for (const group of exercise.secondaryMuscleGroups) expect(MUSCLE_GROUPS).toContain(group);
      expect(exercise.secondaryMuscleGroups).not.toContain(exercise.primaryMuscleGroup);
      if (exercise.equipment !== null) expect(EQUIPMENT).toContain(exercise.equipment);
    }
  });
});
