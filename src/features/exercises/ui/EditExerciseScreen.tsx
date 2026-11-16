import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { getExercise, updateCustomExercise, type NewExerciseInput } from '../application';
import { ExerciseForm } from './ExerciseForm';

type Props = { id: string };

/** Form to correct a custom exercise, prefilled with its values. Seeded ones cannot be edited. */
export function EditExerciseScreen({ id }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [exercise] = useState(() => getExercise(id));
  const [rejected, setRejected] = useState(false);

  if (!exercise || exercise.origin !== 'custom' || rejected) {
    return (
      <View className="flex-1 bg-background">
        <Text className="px-4 py-6 text-center text-textMuted">
          {t(($) => $.exercises.edit.notEditable)}
        </Text>
      </View>
    );
  }

  function save(input: NewExerciseInput) {
    const result = updateCustomExercise(id, input);
    if (result.ok) {
      router.back();
      return;
    }
    if (result.errors.includes('notEditable')) {
      setRejected(true);
      return;
    }
    return result.errors.filter((error) => error !== 'notEditable');
  }

  return (
    <ExerciseForm
      initialValues={{
        name: exercise.name,
        primaryMuscleGroup: exercise.primaryMuscleGroup,
        secondaryMuscleGroups: exercise.secondaryMuscleGroups,
        equipment: exercise.equipment,
      }}
      submitLabel={t(($) => $.exercises.create.save)}
      onSubmit={save}
    />
  );
}
