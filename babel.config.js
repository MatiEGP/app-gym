// NativeWind v4 setup (nativewind@4.2.7 docs, EXPO_SDK_57.md).
// inline-import bundles Drizzle's .sql migrations as strings (Drizzle docs, Expo SQLite).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
