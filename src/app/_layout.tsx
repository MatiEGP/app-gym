import '../global.css';
import '@/shared/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { MigrationGate } from '@/shared/db/MigrationGate';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <MigrationGate>
        <Stack screenOptions={{ headerShown: false }} />
      </MigrationGate>
    </>
  );
}
