import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CreateExerciseScreen } from '@/features/exercises/ui/CreateExerciseScreen';

export default function NewExerciseRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t(($) => $.exercises.create.title) }} />
      <CreateExerciseScreen />
    </>
  );
}
