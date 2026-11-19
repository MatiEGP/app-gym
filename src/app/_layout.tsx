import '../global.css';
import '@/shared/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { seedExerciseCatalog } from '@/features/exercises/application';
import { MigrationGate } from '@/shared/db/MigrationGate';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <MigrationGate onMigrated={seedExerciseCatalog}>
        <Stack screenOptions={{ headerShown: false }} />
      </MigrationGate>
    </>
  );
}
