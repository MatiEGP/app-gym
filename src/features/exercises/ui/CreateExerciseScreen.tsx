import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  cleanSecondaryMuscleGroups,
  createCustomExercise,
  EQUIPMENT,
  MUSCLE_GROUPS,
  type Equipment,
  type MuscleGroup,
  type NewExerciseError,
} from '../application';
import { ChipSelect } from './ChipSelect';
import { MuscleGroupFilter } from './MuscleGroupFilter';

/** Form to add a custom exercise: name, primary group, optional secondary groups and equipment. */
export function CreateExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [secondary, setSecondary] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [errors, setErrors] = useState<NewExerciseError[]>([]);

  function save() {
    const result = createCustomExercise({
      name,
      primaryMuscleGroup: muscleGroup,
      secondaryMuscleGroups: secondary,
      equipment,
    });
    if (result.ok) {
      router.back();
    } else {
      setErrors(result.errors);
    }
  }

  function choosePrimary(group: MuscleGroup | null) {
    setMuscleGroup(group);
    setSecondary((current) => cleanSecondaryMuscleGroups(group, current));
  }

  function toggleSecondary(group: MuscleGroup) {
    setSecondary((current) =>
      current.includes(group) ? current.filter((g) => g !== group) : [...current, group],
    );
  }

  const secondaryOptions = MUSCLE_GROUPS.filter((group) => group !== muscleGroup).map((group) => ({
    value: group,
    label: t(($) => $.exercises.muscleGroups[group]),
  }));
  const equipmentOptions = EQUIPMENT.map((item) => ({
    value: item,
    label: t(($) => $.exercises.equipment[item]),
  }));

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
      <MuscleGroupFilter
        selected={muscleGroup}
        onChange={choosePrimary}
        label={t(($) => $.exercises.create.muscleGroupLabel)}
      />
      <Text className="mx-4 mt-4 text-sm text-textMuted">
        {t(($) => $.exercises.create.secondaryMuscleGroupsLabel)}
      </Text>
      <ChipSelect
        label={t(($) => $.exercises.create.secondaryMuscleGroupsLabel)}
        options={secondaryOptions}
        isSelected={(group) => secondary.includes(group)}
        onPress={toggleSecondary}
      />
      <Text className="mx-4 mt-4 text-sm text-textMuted">
        {t(($) => $.exercises.create.equipmentLabel)}
      </Text>
      <ChipSelect
        label={t(($) => $.exercises.create.equipmentLabel)}
        options={equipmentOptions}
        isSelected={(item) => item === equipment}
        onPress={(item) => setEquipment(item === equipment ? null : item)}
      />
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
