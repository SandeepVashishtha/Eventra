/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables class-based dark mode

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      screens: {
        xs: '380px',
      },

      // =========================
      // FONT SIZES
      // =========================
      fontSize: {

        // Body & Navigation
        body: ['16px', '24px'],
        nav: ['16px', '24px'],

        // Headings
        h1: ['32px', '40px'],
        h2: ['28px', '36px'],
        h3: ['24px', '32px'],
        h4: ['22px', '28px'],
        h5: ['20px', '26px'],
        h6: ['18px', '24px'],
      },

      // =========================
      // CUSTOM COLORS
      // =========================
      colors: {

        // Backgrounds
        bg: 'var(--bg-color)',
        'bg-secondary': 'var(--bg-secondary-color)',

        // Text Colors
        text: 'var(--text-color)',
        'text-light': 'var(--text-color-light)',

        // Borders
        border: 'var(--border-color)',

        // Cards
        'card-bg': 'var(--card-bg-color)',

        // Buttons
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',

        // Navbar & Sidebar
        navbar: 'var(--navbar-color)',
        sidebar: 'var(--sidebar-color)',
      },

      spacing: {
        'safe-top': 'var(--safe-area-top)',
        'safe-right': 'var(--safe-area-right)',
        'safe-bottom': 'var(--safe-area-bottom)',
        'safe-left': 'var(--safe-area-left)',
      },

      minHeight: {
        svh: '100svh',
        dvh: '100dvh',
      },

      height: {
        svh: '100svh',
        dvh: '100dvh',
      },

      maxWidth: {
        drawer: 'min(92vw, 24rem)',
      },

      // =========================
      // TRANSITIONS
      // =========================
      transitionProperty: {
        colors:
          'background-color, border-color, color, fill, stroke',
      },

      // =========================
      // BOX SHADOWS
      // =========================
      boxShadow: {
        card: '0 4px 10px rgba(0,0,0,0.08)',
      },

      // =========================
      // BORDER RADIUS
      // =========================
      borderRadius: {
        xl2: '1rem',
      },

      // =========================
      // ANIMATIONS
      // =========================
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
    },
  },

  plugins: [],
};
