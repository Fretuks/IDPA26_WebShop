/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f8fafc',
        brand: '#0f766e',
        sand: '#f4efe7',
        coral: '#f97316'
      },
      boxShadow: {
        card: '0 18px 45px rgba(15, 23, 42, 0.08)'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
