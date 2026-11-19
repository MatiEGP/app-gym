import { useState } from 'react';
import { ScrollView } from 'react-native';

import { listExercises } from '../application';
import { ExerciseListItem } from './ExerciseListItem';

/** The exercise catalog, sorted by name. Reads the catalog once when it mounts. */
export function ExerciseCatalogScreen() {
  const [exercises] = useState(listExercises);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-2">
      {exercises.map((exercise) => (
        <ExerciseListItem key={exercise.id} exercise={exercise} />
      ))}
    </ScrollView>
  );
}
