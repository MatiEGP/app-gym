import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EditExerciseScreen } from '@/features/exercises/ui/EditExerciseScreen';

export default function EditExerciseRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t(($) => $.exercises.edit.title) }} />
      <EditExerciseScreen id={id} />
    </>
  );
}
