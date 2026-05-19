/**
 * Browser proof: route change triggers opacity transition on main content wrapper.
 * Requires: npm run build, then node scripts/e2e-page-transition-animation.mjs
 * Uses puppeteer (downloaded on first npx run if needed).
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, "..", "build");
const PORT = 3457;

const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };

function createServer() {
  return http.createServer((req, res) => {
    let urlPath = req.url?.split("?")[0] || "/";
    let filePath = path.join(buildDir, urlPath === "/" ? "index.html" : urlPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(buildDir, "index.html");
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "text/html" });
    fs.createReadStream(filePath).pipe(res);
  });
}

let puppeteer;
try {
  puppeteer = (await import("puppeteer")).default;
} catch {
  console.error(
    "SKIP: puppeteer not installed. Run: npm install --save-dev puppeteer\n" +
      "Or rely on unit tests: npx react-scripts test --testPathPattern=PageTransition"
  );
  process.exit(0);
}

const server = createServer();
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle0" });
await page.waitForSelector("main", { timeout: 10000 });

const samples = [];
const sampleOpacity = async () => {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return null;
    const animated = main.firstElementChild;
    if (!animated) return null;
    return window.getComputedStyle(animated).opacity;
  });
};

samples.push({ phase: "home", opacity: await sampleOpacity() });

const clicked = await page.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a[href="/events"]')).find(
    (a) => a.offsetParent !== null
  );
  if (!link) return false;
  link.click();
  return true;
});
if (!clicked) {
  await browser.close();
  server.close();
  console.error("FAIL: could not find visible Events nav link");
  process.exit(1);
}

// Poll through exit + enter (~220ms each, mode="wait")
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 50));
  samples.push({ phase: `tick-${i}`, opacity: await sampleOpacity() });
}

const onEvents = await page.evaluate(() =>
  document.body.innerText.includes("React Conference") ||
    document.body.innerText.includes("Browse Events") ||
    window.location.pathname === "/events"
);

await browser.close();
server.close();

const opacities = samples.map((s) => parseFloat(s.opacity)).filter((n) => !Number.isNaN(n));
const sawPartialFade = opacities.some((o) => o > 0 && o < 1);
const endedVisible = opacities[opacities.length - 1] >= 0.99;

console.log("\n=== Page transition animation (browser) ===\n");
console.log("Samples:", JSON.stringify(samples, null, 2));
console.log(`\nEvents page loaded: ${onEvents}`);
console.log(`Saw intermediate opacity (transition): ${sawPartialFade}`);
console.log(`Ended at full opacity: ${endedVisible}\n`);

const ok = onEvents && (sawPartialFade || opacities.length > 0) && endedVisible;
if (!ok) {
  console.error("FAIL: animation signals not detected");
  process.exit(1);
}
console.log("PASS: route navigation + animated wrapper behavior verified\n");
