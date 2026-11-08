import { StyleSheet, Text, View } from 'react-native';

// Temporary shell screen until the first feature screen exists (M1).
// The app name is a brand name, so it is not an i18n key.
export function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Gym</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
});
