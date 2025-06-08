/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf4dc',
          200: '#bae8ba',
          300: '#86d786',
          400: '#4abe4a',
          500: '#2d8f2d',
          600: '#226b22',
          700: '#1d5a1d',
          800: '#1a4d1a',
          900: '#164016',
        },
        secondary: {
          50: '#f8f9f8',
          100: '#f0f2f0',
          200: '#e1e5e1',
          300: '#c8d0c8',
          400: '#a8b5a8',
          500: '#8a9a8a',
          600: '#6b7c6b',
          700: '#556555',
          800: '#465446',
          900: '#3a463a',
        },
        forest: {
          50: '#f0f4f0',
          100: '#e0e9e0',
          200: '#c2d4c2',
          300: '#9bb89b',
          400: '#6d936d',
          500: '#4a6b4a',
          600: '#3d5a3d',
          700: '#334d33',
          800: '#2a402a',
          900: '#233523',
        },
        earth: {
          50: '#f9f7f4',
          100: '#f2ede6',
          200: '#e3d9cc',
          300: '#d0c0a8',
          400: '#b8a082',
          500: '#a08665',
          600: '#8b7355',
          700: '#735f48',
          800: '#5e4f3e',
          900: '#4d4133',
        },
        darkforest: {
          50: '#f2f7f2',
          100: '#e6f0e6',
          200: '#c7e0c7',
          300: '#9bc99b',
          400: '#66a866',
          500: '#4d8a4d',
          600: '#3d6e3d',
          700: '#335833',
          800: '#2d4a2d',
          900: '#263f26',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 