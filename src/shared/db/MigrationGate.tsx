import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useEffectEvent, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { db } from './client';
import migrations from './migrations/migrations';

type Props = {
  children: ReactNode;
  /** Runs once after migrations succeed and before the app renders, e.g. to seed data. */
  onMigrated?: () => void;
};

type StartupStatus = 'pending' | 'ready' | 'failed';

/** Applies pending local migrations, then the post-migration step, before rendering the app. */
export function MigrationGate({ children, onMigrated }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StartupStatus>('pending');
  const runPostMigrationStep = useEffectEvent(() => onMigrated?.());

  useEffect(() => {
    migrate(db, migrations)
      .then(runPostMigrationStep)
      .then(
        () => setStatus('ready'),
        (error: unknown) => {
          console.error('[db] Startup failed', error);
          setStatus('failed');
        },
      );
  }, []);

  if (status === 'failed') {
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

  if (status === 'pending') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t(($) => $.db.migrating)} />
      </View>
    );
  }

  return children;
}
