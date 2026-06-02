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
        body: ['var(--font-body-lg)', 'var(--lh-body)'],
        nav: ['var(--font-nav)', 'var(--lh-heading)'],

        // Headings
        h1: ['var(--font-h1)', 'var(--lh-heading)'],
        h2: ['var(--font-h2)', 'var(--lh-heading)'],
        h3: ['var(--font-h3)', 'var(--lh-heading)'],
        h4: ['var(--font-h4)', 'var(--lh-heading)'],
        h5: ['var(--font-h5)', 'var(--lh-heading)'],
        h6: ['var(--font-h6)', 'var(--lh-heading)'],

        // Subtitles
        'subtitle-lg': ['var(--font-subtitle-lg)', '1.6'],
        'subtitle-md': ['var(--font-subtitle-md)', '1.55'],

        // Body variations
        'body-lg': ['var(--font-body-lg)', 'var(--lh-body)'],
        'body-md': ['var(--font-body-md)', '1.5'],
        'body-sm': ['var(--font-body-sm)', '1.4'],
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
        'premium-sm': 'var(--shadow-premium-sm)',
        'premium-md': 'var(--shadow-premium-md)',
        'premium-lg': 'var(--shadow-premium-lg)',
        'glow-sm': 'var(--shadow-glow-sm)',
        'glow-md': 'var(--shadow-glow-md)',
        'glow-lg': 'var(--shadow-glow-lg)',
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
