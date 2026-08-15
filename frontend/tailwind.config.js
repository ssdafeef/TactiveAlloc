/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        industrial: {
          50: '#fff8eb',
          100: '#ffefc6',
          200: '#ffde88',
          300: '#ffc84a',
          400: '#ffaf11',
          500: '#f99100', // Confident industrial orange/yellow
          600: '#cc6a00',
          700: '#a84c02',
          800: '#863a0a',
          900: '#6d300e',
        },
        slate: {
          850: '#151e2e',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
