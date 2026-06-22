export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      sm: '768px',
      lg: '1280px',
    },
    extend: {
      colors: {
        primary: '#1A1A2E',
        accent: '#E94560',
        gold: '#F5A623',
        price: '#1D4ED8',
        cream: '#F8F5F0',
        'text-dark': '#1A1A1A',
        'text-muted': '#6B6B6B',
        status: {
          delivered: {
            bg: '#D1FAE5',
            text: '#065F46',
          },
          pending: {
            bg: '#FEF3C7',
            text: '#92400E',
          },
          cancelled: {
            bg: '#FEE2E2',
            text: '#991B1B',
          },
          shipped: {
            bg: '#DBEAFE',
            text: '#1E40AF',
          },
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};