/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',  

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  
  ],

  theme: {
    extend: {
      fontSize: {
        body: ['16px', '24px'],
        nav: ['16px', '24px'],
        h1: ['32px', '40px'],
        h2: ['28px', '36px'],
        h3: ['24px', '32px'],
        h4: ['22px', '28px'],
        h5: ['20px', '26px'],
        h6: ['18px', '24px'],
      },
      colors: {
        bg: 'var(--bg-color)',
        a: 'var(--text-color)',
        'text-light': 'var(--text-color-light)',
        border: 'var(--border-color)',
        'card-bg': 'var(--card-bg-color)',
      },
    },
  },

  plugins: [],
};
