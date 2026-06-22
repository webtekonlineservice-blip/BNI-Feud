/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bni: {
          red: '#CC0000',
          'red-dark': '#990000',
          'red-light': '#FF3333',
        },
      },
    },
  },
  plugins: [],
}
