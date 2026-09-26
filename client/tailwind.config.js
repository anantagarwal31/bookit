/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans these files and keeps only the classes we actually use,
  // which is why the final CSS bundle stays small.
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      // Our brand colour. Using `brand-600` everywhere instead of a hard-coded
      // indigo means the whole app can be re-themed from this one block.
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },

  plugins: [],
};