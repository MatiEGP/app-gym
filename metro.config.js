// NativeWind v4 setup (nativewind@4.2.7 docs, EXPO_SDK_57.md).
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle migrations are .sql files imported from src/shared/db/migrations.
config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, {
  input: './src/global.css',
});
