/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'geraldo-primary': '#33A6B8',
        'geraldo-secondary': '#49C2D4',
        'geraldo-accent': '#A6E3ED',
        'geraldo-dark': '#0f2d57',
        'geraldo-text': '#2D3748',
        'geraldo-bg': '#F7FAFC',
        'geraldo-soft': '#EBF8FA',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'float':        'float 3.5s ease-in-out infinite',
        'float-slow':   'float 5s ease-in-out infinite',
        'float-med':    'float 4s ease-in-out 0.5s infinite',
        'pulse-ring':   'pulseRing 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.7s ease-out both',
        'fade-in':      'fadeIn 0.8s ease-out both',
        'count-up':     'countUp 0.5s ease-out both',
        'shimmer':      'shimmer 2s linear infinite',
        'particle':     'particle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%':     { transform: 'translateY(-16px) rotate(1.5deg)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(37,211,102,0.5)' },
          '70%':  { boxShadow: '0 0 0 14px rgba(37,211,102,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37,211,102,0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        particle: {
          '0%,100%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '50%':     { transform: 'translateY(-20px) scale(1.2)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
