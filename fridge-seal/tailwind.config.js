/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d8ecff',
          200: '#b9dcff',
          300: '#8fc6ff',
          400: '#5ea9ff',
          500: '#2f8bff',
          600: '#0e6af1',
          700: '#0a55c2',
          800: '#0e489b',
          900: '#113e7f',
        },
        slateglass: 'rgba(15, 23, 42, 0.6)'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}