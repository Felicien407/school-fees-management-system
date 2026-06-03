/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        sfms: {
          ink: '#0f172a',
          mist: '#f1f5f9',
          accent: '#0d9488',
          accentDark: '#0f766e',
        },
      },
    },
  },
  plugins: [],
};
