// NativeWind v4 + Tailwind CSS 3. Loaded by Tailwind through jiti, so it can require the TypeScript tokens.
// Theme values come from src/shared/ui/tokens.ts; add new tokens there, not here.
const { colors } = require('./src/shared/ui/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};
