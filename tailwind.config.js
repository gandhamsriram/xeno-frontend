/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crmBg: '#0F1117',
        crmCard: '#1A1D27',
        crmAccent: '#6C63FF',
        crmSuccess: '#22C55E',
        crmWarning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
