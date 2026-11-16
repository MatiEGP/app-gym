import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

import { MUSCLE_GROUPS, type MuscleGroup } from '../application';

type Props = {
  selected: MuscleGroup | null;
  onChange: (group: MuscleGroup | null) => void;
};

/** A row of chips, one per muscle group. Pressing the selected chip clears the filter. */
export function MuscleGroupFilter({ selected, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerClassName="gap-2 px-4 py-2"
      accessibilityLabel={t(($) => $.exercises.catalog.muscleGroupFilterLabel)}
    >
      {MUSCLE_GROUPS.map((group) => {
        const isSelected = group === selected;
        return (
          <Pressable
            key={group}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(isSelected ? null : group)}
            className={`rounded-full px-4 py-2 ${isSelected ? 'bg-primary' : 'bg-surface'}`}
          >
            <Text className={isSelected ? 'text-surface' : 'text-text'}>
              {t(($) => $.exercises.muscleGroups[group])}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
