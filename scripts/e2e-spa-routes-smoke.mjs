/**
 * Serves production build and checks key SPA routes return index.html (200).
 * Run after: npm run build
 * Usage: node scripts/e2e-spa-routes-smoke.mjs
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, "..", "build");
const PORT = 3456;

const ROUTES = ["/", "/events", "/hackathons", "/projects", "/about", "/faq", "/login"];

const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function createServer() {
  return http.createServer((req, res) => {
    let urlPath = req.url?.split("?")[0] || "/";
    let filePath = path.join(buildDir, urlPath === "/" ? "index.html" : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(buildDir, "index.html");
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

function fetchPath(pathname) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${PORT}${pathname}`, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      })
      .on("error", reject);
  });
}

const server = createServer();
await new Promise((resolve) => server.listen(PORT, resolve));

let failed = 0;
console.log(`\n=== SPA route smoke test (port ${PORT}) ===\n`);

for (const route of ROUTES) {
  const { status, body } = await fetchPath(route);
  const hasRoot = body.includes('id="root"');
  const ok = status === 200 && hasRoot;
  console.log(`${ok ? "PASS" : "FAIL"}  GET ${route} → ${status}, root=${hasRoot}`);
  if (!ok) failed++;
}

server.close();
console.log(failed ? `\n${failed} route(s) failed\n` : "\nAll routes OK\n");
process.exit(failed ? 1 : 0);
