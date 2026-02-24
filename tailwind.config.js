/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9f4',
          100: '#dcf1e5',
          200: '#bbe3cd',
          300: '#8acead',
          400: '#54b285',
          500: '#2f9464',
          600: '#1f7850',
          700: '#196041',
          800: '#174d36',
          900: '#14402d',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
