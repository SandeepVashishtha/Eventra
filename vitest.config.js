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
        if (!/[/\\](src|tests)[/\\].*\.js$/.test(id)) return null;
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
    include: [
      "src/**/*.test.{js,jsx,ts,tsx}",
      "tests/navbar.keyboard.test.js",
      "tests/**/*.test.mjs",
    ],
    exclude: [
      "src/**/*.spec.{js,jsx}",
      "tests/e2e/**",
      "tests/helpers/**",
      "tests/loaders/**",
    ],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/**/*.test.{js,jsx}",
        "src/setupTests.js",
        "src/__tests__/**",
      ],
    },
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    retry: 0,
    bail: 0,
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
