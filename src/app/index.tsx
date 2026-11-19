import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExerciseCatalogScreen } from '@/features/exercises/ui/ExerciseCatalogScreen';

export default function IndexRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t(($) => $.exercises.catalog.title) }} />
      <ExerciseCatalogScreen />
    </>
  );
}
