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
        background: "#0F0F14",
        surface: "#1A1A24",
        card: "#22222F",
        border: "#2E2E3E",
        primary: "#7C6FFF",
        accent: "#FF6B6B",
        muted: "#6B6B8A",
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0C0",
          muted: "#6B6B8A",
        },
        category: {
          food: "#FF6B6B",
          transport: "#4ECDC4",
          shopping: "#FFE66D",
          bills: "#A8E6CF",
          entertainment: "#FF8B94",
          health: "#88D8C0",
          travel: "#FFA07A",
          other: "#C3A6FF",
        },
      },
      fontFamily: {
        sans: ["SpaceMono-Regular"],
      },
    },
  },
  plugins: [],
};
