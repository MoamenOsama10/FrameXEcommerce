/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floatFrame: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        floatFrameSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(15px) rotate(-4deg)' },
        },
      },
      animation: {
        floatFrame: 'floatFrame 6s ease-in-out infinite',
        floatFrameSlow: 'floatFrameSlow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}