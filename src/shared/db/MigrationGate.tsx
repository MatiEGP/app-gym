import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { db } from './client';
import migrations from './migrations/migrations';

type Props = { children: ReactNode };

/** Applies pending local migrations before rendering the app. */
export function MigrationGate({ children }: Props) {
  const { t } = useTranslation();
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) console.error('[db] Migration failed', error);
  }, [error]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-xl font-bold text-text">
          {t(($) => $.db.migrationError.title)}
        </Text>
        <Text className="mt-2 text-center text-base text-textMuted">
          {t(($) => $.db.migrationError.description)}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t(($) => $.db.migrating)} />
      </View>
    );
  }

  return children;
}
