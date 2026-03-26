/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: "#0A0A0A",
        accent: {
          violet: "#8B5CF6",
          blue: "#3B82F6",
          cyan: "#06B6D4",
        },
        glass: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};
