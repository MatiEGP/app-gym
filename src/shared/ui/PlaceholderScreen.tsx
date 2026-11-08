import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

// Temporary shell screen until the first feature screen exists (M1).
// The app name is a brand name, so it is not an i18n key.
export function PlaceholderScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-primary">App Gym</Text>
      <Text className="mt-2 text-base text-textMuted">{t(($) => $.placeholder.subtitle)}</Text>
    </View>
  );
}
