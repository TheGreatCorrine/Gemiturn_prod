/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          main: '#0078d4',
          dark: '#004c8c',
        },
        secondary: {
          light: '#76d275',
          main: '#43a047',
          dark: '#00701a',
        },
      },
    },
  },
  plugins: [],
  important: true,
} 