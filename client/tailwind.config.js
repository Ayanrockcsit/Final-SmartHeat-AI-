/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sun: {
          50: "#FFF9F0",
          100: "#FFEFD9",
          200: "#FFDCAE",
          300: "#FFC57D",
          400: "#FFA94D",
          500: "#FB8B24",
          600: "#E86F13",
          700: "#C1560E",
        },
        sky: {
          50: "#F0F7FB",
          100: "#DCEDF6",
          200: "#B6DAEC",
          300: "#89C2DD",
          400: "#5AA3C7",
          500: "#3A82A8",
        },
        ink: {
          50: "#F7F8F9",
          100: "#EEF0F2",
          400: "#7C8894",
          600: "#4B5763",
          800: "#28313A",
          900: "#1B2229",
        },
        risk: {
          low: "#4CA37A",
          moderate: "#D9B23C",
          high: "#E8862E",
          veryhigh: "#DA5A3A",
          extreme: "#B8302E",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(28, 41, 51, 0.18)",
      },
    },
  },
  plugins: [],
};
