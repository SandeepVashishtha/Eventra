import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { transformWithOxc } from "vite";

const JSX_HINT_RE = /<[A-Za-z][A-Za-z0-9.]*[\s\n\r/>]|<>/;

export default defineConfig({
  plugins: [
    {
      name: "jsx-in-js",
      enforce: "pre",
      async transform(code, id) {
        if (!/[/\\]src[/\\].*\.js$/.test(id)) return null;
        if (!JSX_HINT_RE.test(code)) return null;
        return transformWithOxc(code, id, { lang: "jsx" });
      },
    },
    react({
      include: /\.(jsx|tsx)$/,
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["src/**/*.spec.{js,jsx}", "tests/**"],
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/Pages"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@context": path.resolve(__dirname, "src/context"),
    },
  },
});
