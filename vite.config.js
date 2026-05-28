import { defineConfig, loadEnv, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Lightweight check: does this code likely contain JSX syntax?
// Avoids calling transformWithOxc on plain .js files with no JSX.
const JSX_HINT_RE = /<[A-Za-z][A-Za-z0-9.]*[\s\n\r/>]|<>/;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // Must run BEFORE vite:oxc so JSX in .js files is handled correctly.
      // Uses a quick regex pre-check so non-JSX .js files are skipped cheaply.
      {
        name: "jsx-in-js",
        enforce: "pre",
        async transform(code, id) {
          // Only apply to .js files inside src/ — not node_modules
          if (!/[/\\]src[/\\].*\.js$/.test(id)) return null;
          // Skip files that don't appear to have JSX (fast path)
          if (!JSX_HINT_RE.test(code)) return null;
          // Transform JSX → JS using Vite's built-in OXC with JSX enabled
          return transformWithOxc(code, id, { lang: "jsx" });
        },
      },
      react({
        include: /\.(jsx|tsx)$/,
      }),
    ],

    // Path aliases — also speeds up module resolution
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

    envPrefix: ["VITE_", "REACT_APP_"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.PUBLIC_URL": JSON.stringify(""),
      ...Object.keys(env)
        .filter((key) => key.startsWith("REACT_APP_") || key.startsWith("VITE_"))
        .reduce((prev, key) => {
          prev[`process.env.${key}`] = JSON.stringify(env[key]);
          return prev;
        }, {}),
    },

    server: {
      port: 3000,
      open: false,
      hmr: {
        overlay: true,
      },
    },

    // Pre-bundle heavy deps once → stored in node_modules/.vite/deps
    // Eliminates per-request transform cost for these packages
    optimizeDeps: {
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
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },

    build: {
      outDir: "build",
      sourcemap: false,
      minify: "esbuild",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-motion": ["framer-motion"],
            "vendor-charts": ["recharts"],
            "vendor-icons": ["lucide-react", "react-icons"],
            "vendor-ui": ["react-toastify", "react-hot-toast", "aos"],
          },
        },
      },
    },

    css: {
      devSourcemap: false,
    },
  };
});
