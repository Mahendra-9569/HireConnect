import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(236, 72, 153, 0.15), 0 0 70px rgba(56, 189, 248, 0.12)'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top left, rgba(236,72,153,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(56,189,248,0.18), transparent 26%)'
      }
    }
  },
  plugins: [forms]
}
