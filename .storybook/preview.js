import "../src/index.css";

/** @type { import('@storybook/react-webpack5').Preview } */
const preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark",  value: "#0f172a" },
        { name: "gray",  value: "#f3f4f6" },
      ],
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,

      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (sm)',
          styles: { width: '640px', height: '800px' },
        },
        tablet: {
          name: 'Tablet (md)',
          styles: { width: '768px', height: '1024px' },
        },
        laptop: {
          name: 'Laptop (lg)',
          styles: { width: '1024px', height: '768px' },
        },
        desktop: {
          name: 'Desktop (xl)',
          styles: { width: '1280px', height: '900px' },
        },
      },
    },
  },
};

export default preview;
