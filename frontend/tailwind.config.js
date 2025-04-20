/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edf8ff',
          100: '#d6edff',
          200: '#b5e0ff',
          300: '#83cfff',
          400: '#48b4ff',
          500: '#1f94ff',
          600: '#0076ff',
          700: '#0062df',
          800: '#0957b3',
          900: '#0d4a8a',
          950: '#0c2e58',
        },
      },
    },
  },
  plugins: [],
}
