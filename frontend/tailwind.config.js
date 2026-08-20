/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0E14',
          800: '#151921',
          700: '#1E2430',
          600: '#2A3241'
        },
        brand: {
          red: '#F6465D',
          green: '#0ECB81',
          blue: '#2962FF',
          gold: '#F0B90B'
        }
      }
    },
  },
  plugins: [],
}
