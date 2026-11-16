import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { createCustomExercise, type MuscleGroup, type NewExerciseError } from '../application';
import { MuscleGroupFilter } from './MuscleGroupFilter';

/** Form to add a custom exercise: a name and a primary muscle group. Goes back on success. */
export function CreateExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [errors, setErrors] = useState<NewExerciseError[]>([]);

  function save() {
    const result = createCustomExercise({ name, primaryMuscleGroup: muscleGroup });
    if (result.ok) {
      router.back();
    } else {
      setErrors(result.errors);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="py-2"
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        className="mx-4 mt-2 rounded-lg bg-surface px-4 py-3 text-text"
        value={name}
        onChangeText={setName}
        placeholder={t(($) => $.exercises.create.namePlaceholder)}
        accessibilityLabel={t(($) => $.exercises.create.nameLabel)}
      />
      <Text className="mx-4 mt-4 text-sm text-textMuted">
        {t(($) => $.exercises.create.muscleGroupLabel)}
      </Text>
      <MuscleGroupFilter selected={muscleGroup} onChange={setMuscleGroup} />
      <View className="mx-4 mt-2 gap-1" accessibilityLiveRegion="polite">
        {errors.map((error) => (
          <Text key={error} className="text-sm text-danger">
            {t(($) => $.exercises.create.errors[error])}
          </Text>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={save}
        className="mx-4 mt-4 items-center rounded-xl bg-primary px-4 py-3"
      >
        <Text className="text-base font-semibold text-surface">
          {t(($) => $.exercises.create.save)}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
