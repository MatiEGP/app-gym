import { Stack, useLocalSearchParams } from 'expo-router';

import { ExerciseDetailScreen } from '@/features/exercises/ui/ExerciseDetailScreen';

// The header only provides the back arrow: the screen shows the exercise name as its heading.
export default function ExerciseDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <ExerciseDetailScreen id={id} />
    </>
  );
}
