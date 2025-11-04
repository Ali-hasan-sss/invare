/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f7f0",
          100: "#ccf0e1",
          200: "#99e1c3",
          300: "#66d2a5",
          400: "#33c387",
          500: "#8BC540", // Lime Green
          600: "#6f9e33",
          700: "#537726",
          800: "#374f1a",
          900: "#1b280d",
          950: "#0e1406",
        },
        secondary: {
          50: "#e6f4f9",
          100: "#cce9f3",
          200: "#99d3e7",
          300: "#66bddb",
          400: "#33a7cf",
          500: "#3A95C4", // Sky Blue
          600: "#2e779d",
          700: "#225976",
          800: "#173c4f",
          900: "#0b1e28",
          950: "#060f14",
        },
        accent: {
          50: "#f5f0f8",
          100: "#ebe1f1",
          200: "#d7c3e3",
          300: "#c3a5d5",
          400: "#af87c7",
          500: "#854A97", // Purple
          600: "#6a3b79",
          700: "#502c5b",
          800: "#351e3d",
          900: "#1b0f1f",
          950: "#0e080f",
        },
        brand: {
          dark: "#646464", // Gray (Diamond)
          blue: "#3A95C4", // Sky Blue
          gray: "#646464", // Gray (Diamond)
          lightGray: "#8a8a8a",
          wood: "#f5f5dc",
          green: "#8BC540", // Lime Green
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Cairo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
