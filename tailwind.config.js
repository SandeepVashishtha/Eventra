/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Body & nav
        body: ['16px', '24px'], // font-size + line-height
        nav: ['16px', '24px'],
        // Headings
        h1: ['32px', '40px'],
        h2: ['28px', '36px'],
        h3: ['24px', '32px'],
        h4: ['22px', '28px'],
        h5: ['20px', '26px'],
        h6: ['18px', '24px'],
      },
      colors: {
        // optional: link CSS variables with Tailwind
        bg: 'var(--bg-color)',
        text: 'var(--text-color)',
        'text-light': 'var(--text-color-light)',
        border: 'var(--border-color)',
        'card-bg': 'var(--card-bg-color)',
      },
    },
  },
  plugins: [],
};
