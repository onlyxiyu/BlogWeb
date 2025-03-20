/** @type {import('tailwindcss').Config} */
const siteConfig = require('./site.config');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: siteConfig.theme.colors,
      fontFamily: siteConfig.theme.fonts,
      maxWidth: siteConfig.theme.layout
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 