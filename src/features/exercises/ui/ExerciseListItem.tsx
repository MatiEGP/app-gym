import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { Exercise } from '../application';

type Props = { exercise: Pick<Exercise, 'name' | 'primaryMuscleGroup'> };

/** One catalog row: the exercise name and its primary muscle group, read as one element. */
export function ExerciseListItem({ exercise }: Props) {
  const { t } = useTranslation();
  const muscleGroup = t(($) => $.exercises.muscleGroups[exercise.primaryMuscleGroup]);

  return (
    <View
      accessible
      accessibilityLabel={`${exercise.name}, ${muscleGroup}`}
      className="mx-4 my-1 rounded-xl bg-surface px-4 py-3"
    >
      <Text className="text-base font-semibold text-text">{exercise.name}</Text>
      <Text className="mt-0.5 text-sm text-textMuted">{muscleGroup}</Text>
    </View>
  );
}
