// NativeWind v4 setup (nativewind@4.2.7 docs, EXPO_SDK_57.md).
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(getDefaultConfig(__dirname), {
  input: './src/global.css',
});
