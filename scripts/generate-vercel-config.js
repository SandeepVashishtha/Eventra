#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_BACKEND_URL =
  "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";

function resolveBackendUrl() {
  const envVar = process.env.BACKEND_URL || process.env.VITE_API_URL;
  if (!envVar) return DEFAULT_BACKEND_URL;
  const url = envVar.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

function buildConfig(backendUrl) {
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8")
  );

  for (const rewrite of vercelConfig.rewrites) {
    if (rewrite.destination && rewrite.destination.includes(DEFAULT_BACKEND_URL)) {
      rewrite.destination = rewrite.destination.replace(
        DEFAULT_BACKEND_URL,
        backendUrl
      );
    }
  }

  for (const headerGroup of vercelConfig.headers) {
    for (const header of headerGroup.headers) {
      if (
        header.key === "Content-Security-Policy" &&
        header.value
      ) {
        header.value = header.value.replace(
          DEFAULT_BACKEND_URL,
          backendUrl
        );
      }
    }
  }

  vercelConfig.env = vercelConfig.env || {};
  vercelConfig.env.BACKEND_URL = backendUrl;

  return vercelConfig;
}

function main() {
  const backendUrl = resolveBackendUrl();
  console.log(`[generate-vercel-config] Backend URL: ${backendUrl}`);

  const config = buildConfig(backendUrl);
  const outputPath = path.join(ROOT, "vercel.json");

  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`[generate-vercel-config] Updated: ${outputPath}`);

  const count = JSON.stringify(config).split(DEFAULT_BACKEND_URL).length - 1;
  if (count > 0) {
    console.warn(
      `[generate-vercel-config] Warning: ${count} hardcoded reference(s) to default backend URL remain.`
    );
  }
}

main();
