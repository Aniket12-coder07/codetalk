/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F4',
          100: '#F5F1E8',
          200: '#EDE5D5',
        },
        neo: {
          yellow: '#FFC107',
          orange: '#FF8A00',
          green: '#22C55E',
          red: '#F43F5E',
          purple: '#8B5CF6',
          blue: '#3B82F6',
          gray: '#94A3B8',
          dark: '#121212',
        }
      },
      fontFamily: {
        sans: ['"Poppins"', '"Nunito"', 'sans-serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-hover': '2px 2px 0px 0px #000000',
      },
      borderRadius: {
        'neo': '18px',
        'neo-lg': '22px',
        'neo-sm': '12px',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
}
