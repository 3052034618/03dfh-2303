/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8EBF0',
          100: '#C5CBD9',
          200: '#8E9BB7',
          300: '#576C95',
          400: '#2E4470',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070A19',
        },
        ice: {
          50: '#EBF4FF',
          100: '#D6E9FF',
          200: '#ADD3FF',
          300: '#85BDFF',
          400: '#4A9EFF',
          500: '#2B87F0',
          600: '#1A6FD4',
          700: '#1357A8',
          800: '#0D3F7C',
          900: '#082750',
        },
        amber: {
          50: '#FFF8EB',
          100: '#FEECC7',
          200: '#FDD88E',
          300: '#FCC455',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#6B3A0A',
          900: '#452A07',
        },
        surface: {
          primary: '#F8F9FC',
          card: '#FFFFFF',
          hover: '#F1F3F8',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        '6': '6px',
      },
    },
  },
  plugins: [],
};
