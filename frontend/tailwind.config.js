/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ESAB-like brand colors: bold industrial yellow and black accents
        primary: {
          50: '#FFF9DB',
          100: '#FFF3B0',
          200: '#FFE66D',
          300: '#FFD84D',
          400: '#FFCD1A',
          500: '#FFD100', // ESAB yellow
          600: '#E6BC00',
          700: '#CCA800',
          800: '#B39500',
          900: '#8A7300',
          950: '#5C4D00',
        },
        ink: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b2b2b2',
          400: '#7f7f7f',
          500: '#4c4c4c',
          600: '#262626',
          700: '#1a1a1a',
          800: '#0d0d0d',
          900: '#000000',
          950: '#000000',
        }
      }
    },
  },
  plugins: [],
}
