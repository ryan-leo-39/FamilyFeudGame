/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'ff-blue': '#0a1628',
        'ff-navy': '#0d2044',
        'ff-gold': '#f5a623',
        'ff-gold-dark': '#c8841a',
        'ff-red': '#c0392b',
        'ff-green': '#27ae60',
        'ff-tile': '#1a3a6b',
        'ff-tile-revealed': '#2563eb',
      },
      fontFamily: {
        'game': ['"Arial Black"', '"Arial Bold"', 'Gadget', 'sans-serif'],
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(-8px)' },
          '80%': { transform: 'translateX(8px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        flipIn: 'flipIn 0.4s ease-out forwards',
        shake: 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}

