import { Text, View } from 'react-native';

// Temporary shell screen until the first feature screen exists (M1).
// The app name is a brand name, so it is not an i18n key.
export function PlaceholderScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-primary">App Gym</Text>
    </View>
  );
}
