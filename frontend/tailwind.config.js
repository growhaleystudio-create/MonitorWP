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
        primary: {
          teal: '#187DB4',
          light: '#2292CE',
          dark: '#0F4F73',
          bg: '#EEF7FC',
        },
        accent: {
          gold: '#FFD23F',
          light: '#FFE47A',
          dark: '#E6B800',
        },
        coral: {
          DEFAULT: '#EF6C4A',
          light: '#FF8A6A',
          dark: '#D45233',
        },
        cream: '#FFF8E7',
        sky: '#5DADE2',
        surface: {
          base: '#EFF8F7',
          card: '#FFFFFF',
        },
        success: '#27AE60',
        error: '#E74C3C',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,0,0,0.08)',
        'md': '0 4px 16px rgba(0,0,0,0.12)',
        'lg': '0 8px 32px rgba(0,0,0,0.16)',
        'card': '0 4px 20px rgba(24,125,180,0.1)',
        'coral-glow': '0 4px 20px rgba(239,108,74,0.35)',
        'teal-glow': '0 4px 20px rgba(24,125,180,0.3)',
        'accent-glow': '0 4px 20px rgba(255,210,63,0.4)',
        'sky-glow': '0 4px 16px rgba(93,173,226,0.3)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      animation: {
        'crown-bounce': 'crown-bounce 1.5s infinite ease-in-out',
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
        'boom-pulse': 'boom-pulse 2s infinite ease-in-out',
      },
      keyframes: {
        'crown-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-6px) rotate(-3deg)' },
          '75%': { transform: 'translateY(-6px) rotate(3deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.85' },
        },
        'boom-pulse': {
          '0%, 100%': { boxShadow: '0 4px 20px rgba(239,108,74,0.35)', borderColor: 'rgba(239,108,74,0.5)' },
          '50%': { boxShadow: '0 4px 30px rgba(239,108,74,0.6)', borderColor: 'rgba(239,108,74,1)' },
        }
      }
    },
  },
  plugins: [],
}
