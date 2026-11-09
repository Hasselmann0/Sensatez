/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        sensatez: {
          gold: '#D4A872',
          'gold-dark': '#B8864B',
          bronze: '#5C3A21',
          'dark-bg': '#0D0D10',
          'dark-surface': '#151519',
          'dark-card': '#1C1C22',
          'dark-border': '#282832'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

