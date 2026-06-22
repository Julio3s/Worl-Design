export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      sm: '768px',
      lg: '1280px',
    },
    extend: {
      colors: {
        primary: '#0F0F1A',
        'primary-light': '#1A1A2E',
        accent: '#E94560',
        gold: '#F5A623',
        price: '#3B82F6',
        cream: '#0F0F1A',
        'text-dark': '#F1F1F1',
        'text-muted': '#9CA3AF',
        surface: '#16162A',
        'surface-hover': '#1E1E3A',
        border: '#2A2A4A',
        status: {
          delivered: {
            bg: '#064E3B',
            text: '#86EFAC',
          },
          pending: {
            bg: '#78350F',
            text: '#FDE68A',
          },
          cancelled: {
            bg: '#7F1D1D',
            text: '#FCA5A5',
          },
          shipped: {
            bg: '#1E3A5F',
            text: '#93C5FD',
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