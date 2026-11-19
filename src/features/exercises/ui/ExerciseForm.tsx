import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  cleanSecondaryMuscleGroups,
  EQUIPMENT,
  MUSCLE_GROUPS,
  type Equipment,
  type MuscleGroup,
  type NewExerciseError,
  type NewExerciseInput,
} from '../application';
import { ChipSelect } from './ChipSelect';
import { MuscleGroupFilter } from './MuscleGroupFilter';

const EMPTY: NewExerciseInput = {
  name: '',
  primaryMuscleGroup: null,
  secondaryMuscleGroups: [],
  equipment: null,
};

type Props = {
  initialValues?: NewExerciseInput;
  submitLabel: string;
  /** Saves the input; returns the errors to show, or nothing when it succeeded. */
  onSubmit: (input: NewExerciseInput) => NewExerciseError[] | void;
};

/** Form body shared by creating and editing a custom exercise. */
export function ExerciseForm({ initialValues = EMPTY, submitLabel, onSubmit }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialValues.name);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(
    initialValues.primaryMuscleGroup,
  );
  const [secondary, setSecondary] = useState<MuscleGroup[]>(initialValues.secondaryMuscleGroups);
  const [equipment, setEquipment] = useState<Equipment | null>(initialValues.equipment);
  const [errors, setErrors] = useState<NewExerciseError[]>([]);

  function save() {
    const result = onSubmit({
      name,
      primaryMuscleGroup: muscleGroup,
      secondaryMuscleGroups: secondary,
      equipment,
    });
    if (result) setErrors(result);
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
        <Text className="text-base font-semibold text-surface">{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}
