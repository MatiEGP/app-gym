import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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
 * Reloads the catalog whenever the screen regains focus, so a new custom exercise shows up.
 */
export function ExerciseCatalogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [exercises, setExercises] = useState(listExercises);
  useFocusEffect(useCallback(() => setExercises(listExercises()), []));
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
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/exercises/new')}
        className="mx-4 mt-2 items-center rounded-xl bg-primary px-4 py-3"
      >
        <Text className="text-base font-semibold text-surface">
          {t(($) => $.exercises.catalog.newExercise)}
        </Text>
      </Pressable>
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
            <ExerciseListItem
              key={exercise.id}
              exercise={exercise}
              onPress={() =>
                router.push({ pathname: '/exercises/[id]', params: { id: exercise.id } })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
