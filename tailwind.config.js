/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: 1,
            textShadow: "0 0 20px rgba(66, 153, 225, 0.5)",
          },
          "50%": {
            opacity: 0.5,
            textShadow: "0 0 10px rgba(66, 153, 225, 0.2)",
          },
        },
      },
      colors: {
        gemini: {
          dark: "#0a0a0a",
          light: "#ffffff",
          primary: "#4facfe",
          secondary: "#00f2fe",
          accent: "#a855f7",
        },
      },
    },
  },
  plugins: [],
};
