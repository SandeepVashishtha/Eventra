import { defineConfig, loadEnv, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function sriCspPlugin() {
  return {
    name: "vite-plugin-sri-csp",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        const scriptHashes = new Set();
        const styleHashes = new Set();
        let modifiedHtml = html;

        const getSri = (content) => {
          const sha384 = crypto.createHash("sha384").update(content).digest("base64");
          return `sha384-${sha384}`;
        };

        const getSha256 = (content) => {
          return crypto.createHash("sha256").update(content).digest("base64");
        };

        // 1. Process script tags with src
        modifiedHtml = modifiedHtml.replace(/<script([^>]*?)src="([^"]+)"([^>]*?)><\/script>/gi, (match, before, src, after) => {
          let integrity = "";
          let fileContent = "";

          if (src.startsWith("/") || src.startsWith("%PUBLIC_URL%")) {
            const cleanSrc = src.replace("%PUBLIC_URL%", "").replace(/^\//, "");
            const bundleAsset = Object.values(ctx.bundle).find(
              (asset) => asset.fileName === cleanSrc || asset.fileName === "assets/" + cleanSrc || cleanSrc === asset.fileName
            );

            if (bundleAsset) {
              fileContent = bundleAsset.code || bundleAsset.source || "";
            } else {
              const publicPath = path.join(process.cwd(), "public", cleanSrc);
              if (fs.existsSync(publicPath)) {
                fileContent = fs.readFileSync(publicPath);
              }
            }
          }

          if (fileContent) {
            integrity = getSri(fileContent);
            const sha256 = getSha256(fileContent);
            scriptHashes.add(`'sha256-${sha256}'`);
          } else if (src.includes("@emailjs/browser")) {
            integrity = "sha384-pBj/7oiucDFbOVhWYmMWoRIiwvBksmGk0wIadn/MRKsml75X/SFoY7TC20va52ui";
            scriptHashes.add("'sha256-8QrT2ylraJQ3kKS+i3RVeBanCz8as7rf+8GYkfgVA8s='");
          }

          let newTag = "<script" + before + `src="${src}"`;
          if (integrity) {
            newTag += ` integrity="${integrity}"`;
            if (!before.includes("crossorigin") && !after.includes("crossorigin")) {
              newTag += ' crossorigin="anonymous"';
            }
          }
          newTag += after + "></script>";
          return newTag;
        });

        // 2. Process link stylesheet tags
        modifiedHtml = modifiedHtml.replace(/<link([^>]*?)href="([^"]+)"([^>]*?)>/gi, (match, before, href, after) => {
          if (!before.includes("stylesheet") && !after.includes("stylesheet")) {
            return match;
          }

          let integrity = "";
          let fileContent = "";

          if (href.startsWith("/") || href.startsWith("%PUBLIC_URL%")) {
            const cleanHref = href.replace("%PUBLIC_URL%", "").replace(/^\//, "");
            const bundleAsset = Object.values(ctx.bundle).find(
              (asset) => asset.fileName === cleanHref || asset.fileName === "assets/" + cleanHref || cleanHref === asset.fileName
            );

            if (bundleAsset) {
              fileContent = bundleAsset.code || bundleAsset.source || "";
            } else {
              const publicPath = path.join(process.cwd(), "public", cleanHref);
              if (fs.existsSync(publicPath)) {
                fileContent = fs.readFileSync(publicPath);
              }
            }
          }

          if (fileContent) {
            integrity = getSri(fileContent);
            const sha256 = getSha256(fileContent);
            styleHashes.add(`'sha256-${sha256}'`);
          }

          let newTag = "<link" + before + `href="${href}"`;
          if (integrity) {
            newTag += ` integrity="${integrity}"`;
            if (!before.includes("crossorigin") && !after.includes("crossorigin")) {
              newTag += ' crossorigin="anonymous"';
            }
          }
          newTag += after + ">";
          return newTag;
        });

        // 3. Inject strict CSP into Content-Security-Policy meta tag
        const defaultSrc = "'self'";
        const scriptSrc = [
          "'self'",
          ...scriptHashes,
          "https://accounts.google.com/gsi/client"
        ].join(" ");

        const styleSrc = [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://accounts.google.com/gsi/style"
        ].join(" ");

        const imgSrc = "'self' data: https:";
        const connectSrc = [
          "'self'",
          "http://localhost:8080",
          "http://127.0.0.1:8080",
          "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net",
          "https://accounts.google.com",
          "https://www.googleapis.com",
          "https://api.emailjs.com",
          "https://api.github.com"
        ].join(" ");

        const fontSrc = "'self' data: https://fonts.gstatic.com";
        const frameSrc = "'self' https://accounts.google.com";
        const baseUri = "'self'";
        const formAction = "'self'";

        const cspString = [
          `default-src ${defaultSrc}`,
          `script-src ${scriptSrc}`,
          `style-src ${styleSrc}`,
          `img-src ${imgSrc}`,
          `connect-src ${connectSrc}`,
          `font-src ${fontSrc}`,
          `frame-src ${frameSrc}`,
          `base-uri ${baseUri}`,
          `form-action ${formAction}`
        ].join("; ");

        modifiedHtml = modifiedHtml.replace(
          /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*\/?>/i,
          `<meta http-equiv="Content-Security-Policy" content="${cspString}" />`
        );

        return modifiedHtml;
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
      sriCspPlugin(),
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
