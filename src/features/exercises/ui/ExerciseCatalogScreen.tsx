import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  filterExercisesByMuscleGroup,
  filterExercisesByName,
  listExercises,
  type MuscleGroup,
} from '../application';
import { ExerciseListItem } from './ExerciseListItem';
import { MuscleGroupFilter } from './MuscleGroupFilter';

/**
 * The exercise catalog, sorted by name, with a name search and a primary muscle group filter.
 * Reads the catalog once on mount.
 */
export function ExerciseCatalogScreen() {
  const { t } = useTranslation();
  const [exercises] = useState(listExercises);
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const visibleExercises = useMemo(
    () => filterExercisesByMuscleGroup(filterExercisesByName(exercises, search), muscleGroup),
    [exercises, search, muscleGroup],
  );

  return (
    <View className="flex-1 bg-background">
      <TextInput
        className="mx-4 mt-2 rounded-lg bg-surface px-4 py-3 text-text"
        value={search}
        onChangeText={setSearch}
        placeholder={t(($) => $.exercises.catalog.searchPlaceholder)}
        accessibilityLabel={t(($) => $.exercises.catalog.searchLabel)}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <MuscleGroupFilter selected={muscleGroup} onChange={setMuscleGroup} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="py-2"
        keyboardShouldPersistTaps="handled"
      >
        {visibleExercises.length === 0 ? (
          <Text className="px-4 py-6 text-center text-textMuted">
            {t(($) => $.exercises.catalog.noResults)}
          </Text>
        ) : (
          visibleExercises.map((exercise) => (
            <ExerciseListItem key={exercise.id} exercise={exercise} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
