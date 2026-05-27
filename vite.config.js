import { defineConfig, loadEnv, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
      {
        name: "transform-jsx-in-js",
        enforce: "pre",
        async transform(code, id) {
          if (!id.match(/src[\\/].*\.js$/)) {
            return null;
          }
          return await transformWithOxc(code, id, {
            lang: "jsx",
          });
        },
      },
    ],
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
      open: true,
    },
    build: {
      outDir: "build",
      sourcemap: false,
    },
  };
});
