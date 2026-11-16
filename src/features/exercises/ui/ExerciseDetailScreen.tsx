import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import { getExercise } from '../application';

type Props = { id: string };

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="mt-6">
      <Text className="text-sm text-textMuted">{title}</Text>
      <Text className="mt-1 text-base text-text">{children}</Text>
    </View>
  );
}

/** Details of one exercise: name, muscle groups, and equipment. Empty sections are omitted. */
export function ExerciseDetailScreen({ id }: Props) {
  const { t } = useTranslation();
  const exercise = getExercise(id);

  if (!exercise) {
    return (
      <View className="flex-1 bg-background">
        <Text className="px-4 py-6 text-center text-textMuted">
          {t(($) => $.exercises.detail.notFound)}
        </Text>
      </View>
    );
  }

  const { equipment } = exercise;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-text">{exercise.name}</Text>
      <Section title={t(($) => $.exercises.detail.primaryMuscleGroup)}>
        {t(($) => $.exercises.muscleGroups[exercise.primaryMuscleGroup])}
      </Section>
      {exercise.secondaryMuscleGroups.length > 0 && (
        <Section title={t(($) => $.exercises.detail.secondaryMuscleGroups)}>
          {exercise.secondaryMuscleGroups
            .map((group) => t(($) => $.exercises.muscleGroups[group]))
            .join(', ')}
        </Section>
      )}
      {equipment !== null && (
        <Section title={t(($) => $.exercises.detail.equipment)}>
          {t(($) => $.exercises.equipment[equipment])}
        </Section>
      )}
    </ScrollView>
  );
}
