/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F97316",
          "orange-dark": "#EA580C",
          green: "#059669",
          "green-dark": "#047857",
          "green-light": "#D1FAE5",
          "orange-light": "#FFEDD5",
        }
      }
    },
  },
  plugins: [],
}
