/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0056b3',
          'blue-dark': '#003d80',
          'blue-light': '#1a6fc4',
          orange: '#ff6a00',
          'orange-dark': '#cc5500',
          'orange-light': '#ff8533',
        },
        // Keep bni-red as alias for backward compat during transition
        bni: {
          red: '#0056b3',
          'red-dark': '#003d80',
          'red-light': '#1a6fc4',
        },
      },
    },
  },
  plugins: [],
}
