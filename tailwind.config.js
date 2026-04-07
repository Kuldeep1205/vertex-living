/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  corePlugins: {
    // Disable Tailwind's base/reset styles so existing CSS is not affected
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
