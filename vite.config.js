import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        // Tell the React plugin to also handle .js files that contain JSX
        include: /\.(js|jsx|ts|tsx)$/,
      }),
    ],

    // Path aliases for cleaner imports (also speeds up module resolution)
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
      // Don't auto-open; let the user open when ready (shaves ~200–500ms off apparent startup)
      open: false,
      hmr: {
        overlay: true,
      },
    },

    // Pre-bundle these heavy deps once (stored in node_modules/.vite/deps)
    // so each import during dev doesn't trigger a fresh transform
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
      // Tell esbuild to treat .js files as JSX during dep scanning
      // (replaces the old custom transformWithOxc plugin)
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },

    build: {
      outDir: "build",
      sourcemap: false,
      // esbuild is 10–20× faster than terser
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
