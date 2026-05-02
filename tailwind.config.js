/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0f1117',
          surface: '#1a1d26',
          card: '#22263a',
          border: '#2e3350',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
        },
        priority: {
          urgent: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#22c55e',
        },
        status: {
          todo: '#6366f1',
          progress: '#f59e0b',
          done: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}