/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        clinical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        hospital: {
          blue: '#0284c7',
          navy: '#0f172a',
          slate: '#1e293b',
          card: '#0f172a',
          accent: '#06b6d4',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'clinical': '0 10px 30px -5px rgba(13, 148, 136, 0.15)',
        'glow-teal': '0 0 25px rgba(20, 184, 166, 0.3)',
        'glow-blue': '0 0 25px rgba(2, 132, 199, 0.3)',
      }
    },
  },
  plugins: [],
}
