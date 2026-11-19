import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { deleteCustomExercise, getExercise } from '../application';

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
  const router = useRouter();
  const [exercise, setExercise] = useState(() => getExercise(id));
  useFocusEffect(useCallback(() => setExercise(getExercise(id)), [id]));

  const confirmDelete = () =>
    Alert.alert(
      t(($) => $.exercises.detail.deleteTitle),
      t(($) => $.exercises.detail.deleteMessage),
      [
        { text: t(($) => $.exercises.detail.deleteCancel), style: 'cancel' },
        {
          text: t(($) => $.exercises.detail.deleteConfirm),
          style: 'destructive',
          onPress: () => {
            if (deleteCustomExercise(id).ok) router.back();
          },
        },
      ],
    );

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
      {exercise.origin === 'custom' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/exercises/edit/[id]', params: { id } })}
          className="mt-4 items-center self-start rounded-xl bg-surface px-4 py-2"
        >
          <Text className="text-base font-semibold text-primary">
            {t(($) => $.exercises.detail.edit)}
          </Text>
        </Pressable>
      )}
      {exercise.origin === 'custom' && (
        <Pressable
          accessibilityRole="button"
          onPress={confirmDelete}
          className="mt-2 items-center self-start rounded-xl bg-surface px-4 py-2"
        >
          <Text className="text-base font-semibold text-danger">
            {t(($) => $.exercises.detail.delete)}
          </Text>
        </Pressable>
      )}
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
