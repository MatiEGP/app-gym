import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import type { Exercise } from '../application';

type Props = {
  exercise: Pick<Exercise, 'name' | 'primaryMuscleGroup' | 'origin'>;
  onPress: () => void;
};

/** One catalog row: the exercise name and its primary muscle group, read as one element. */
export function ExerciseListItem({ exercise, onPress }: Props) {
  const { t } = useTranslation();
  const muscleGroup = t(($) => $.exercises.muscleGroups[exercise.primaryMuscleGroup]);
  const isCustom = exercise.origin === 'custom';
  const badge = t(($) => $.exercises.catalog.customBadge);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      accessibilityLabel={
        isCustom ? `${exercise.name}, ${muscleGroup}, ${badge}` : `${exercise.name}, ${muscleGroup}`
      }
      className="mx-4 my-1 rounded-xl bg-surface px-4 py-3"
    >
      <Text className="text-base font-semibold text-text">{exercise.name}</Text>
      <Text className="mt-0.5 text-sm text-textMuted">{muscleGroup}</Text>
      {isCustom ? (
        <Text className="mt-1 self-start rounded-full bg-background px-2 py-0.5 text-xs text-primary">
          {badge}
        </Text>
      ) : null}
    </Pressable>
  );
}
