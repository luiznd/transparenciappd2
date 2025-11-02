
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontSize: {
        'base': '0.725rem', // Define a base de 10px para fonte
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
          light: '#A5B4FC',
        },
        secondary: {
          DEFAULT: '#14B8A6',
          dark: '#0F766E',
          light: '#99F6E4',
        },
        accent: {
          DEFAULT: '#F97316',
          light: '#FDBA74',
          dark: '#EA580C',
        },
        background: '#F3F4F6',
        card: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#4B5563'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'medium': '0 6px 12px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animatecss')({
      classes: ['animate__animated', 'animate__fadeIn', 'animate__bounce'],
      settings: { animatedSpeed: 500 },
      variants: ['responsive'],
    }),
  ],
};

