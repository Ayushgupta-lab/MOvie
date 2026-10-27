/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#060911',
          900: '#0B0F1B',
          850: '#0F1527',
          800: '#141C33',
          700: '#1E2945',
          600: '#2A385E',
          500: '#3D4F7C',
        },
        brand: {
          purple: '#8B5CF6',
          violet: '#7C3AED',
          neon: '#A855F7',
          pink: '#EC4899',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          gold: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(139, 92, 246, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
