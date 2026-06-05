import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js,tsx,ts}",
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    rolldownOptions: {
      input: {},
    },
  },
  oxc: {
    transform: false,
  },
});