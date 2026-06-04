import { defineConfig, loadEnv, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Quick regex to detect JSX syntax — lets us skip transformWithOxc
// on plain .js files that have no JSX (the common case).
const JSX_HINT_RE = /<[A-Za-z][A-Za-z0-9.]*[\s\n\r/>]|<>/;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // Intercept .js files BEFORE vite:oxc / builtin:vite-transform so JSX
      // inside them is compiled correctly in both dev and production builds.
      // index.jsx / App.jsx are now .jsx so they don't need this path.
      // Only the remaining .js files that still contain JSX hit the transform.
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
        // Only .jsx/.tsx — .js files are handled above
        include: /\.(jsx|tsx)$/,
      }),
    ],

    // Path aliases — cleaner imports and faster resolution
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

    server: {
      port: 3000,
      open: false,
      hmr: { overlay: true },
    },

    // Pre-bundle heavy deps once → node_modules/.vite/deps
    optimizeDeps: {
      rolldownOptions: {
        moduleTypes: {
          ".js": "jsx",
        },
      },
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-router-dom",
        "framer-motion",
        "lucide-react",
        "react-icons",
        "@heroicons/react/24/solid",
        "@heroicons/react/24/outline",
        "axios",
        "date-fns",
        "recharts",
        "react-toastify",
        "react-hot-toast",
        "dompurify",
        "fuse.js",
        "react-helmet-async",
        "react-intersection-observer",
        "react-countup",
        "idb-keyval",
        "aos",
      ],
    },

    build: {
      outDir: "build",
      sourcemap: false,
      minify: "esbuild",
      // Disable CSS minification — lightningcss (Vite 8 default) cannot parse
      // the custom Tailwind `short` screen: (max-height: 520px) media query.
      cssMinify: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // manualChunks must be a function in Vite 8 / Rolldown
          manualChunks(id) {
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router-dom/") ||
              id.includes("node_modules/react-router/")
            ) {
              return "vendor-react";
            }
            if (id.includes("node_modules/framer-motion/")) {
              return "vendor-motion";
            }
            if (id.includes("node_modules/recharts/")) {
              return "vendor-charts";
            }
            if (
              id.includes("node_modules/lucide-react/") ||
              id.includes("node_modules/react-icons/")
            ) {
              return "vendor-icons";
            }
            if (
              id.includes("node_modules/react-toastify/") ||
              id.includes("node_modules/react-hot-toast/") ||
              id.includes("node_modules/aos/")
            ) {
              return "vendor-ui";
            }
          },
        },
      },
    },

    css: {
      devSourcemap: false,
    },
  };
});
