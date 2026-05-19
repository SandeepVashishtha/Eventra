/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables class-based dark mode

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {

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
    },
  },

  plugins: [],
};