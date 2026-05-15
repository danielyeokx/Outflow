/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg:       '#0A0A0A',
        surface:  '#111111',
        elevated: '#181818',
        border:   '#2A2A2A',
      },
      fontFamily: {
        sans: ["SpaceMono-Regular"],
        mono: ["SpaceMono-Regular"],
      },
    },
  },
  plugins: [],
};
