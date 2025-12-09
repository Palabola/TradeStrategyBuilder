/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
  conttent: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Add the package to content scanning
    "./node_modules/@palabola86/trade-strategy-builder/dist/**/*.{js,mjs}",
  ]
}

export default config
