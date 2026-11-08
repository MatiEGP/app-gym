// NativeWind v4 setup (nativewind@4.2.7 docs, EXPO_SDK_57.md).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
