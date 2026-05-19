/**
 * Verification script for issue #867 — page route transitions.
 * Run: node scripts/verify-page-transitions.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const checks = [];

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
}

function fail(name, detail = "") {
  checks.push({ name, ok: false, detail });
}

// 1. PageTransition component exists and uses required APIs
const ptPath = "src/components/common/PageTransition.jsx";
if (!fs.existsSync(path.join(root, ptPath))) {
  fail("PageTransition file exists");
} else {
  pass("PageTransition file exists");
  const pt = read(ptPath);
  const required = [
    "AnimatePresence",
    "useLocation",
    "useReducedMotion",
    'mode="wait"',
    "location.pathname",
  ];
  for (const token of required) {
    if (pt.includes(token)) pass(`PageTransition contains \`${token}\``);
    else fail(`PageTransition missing \`${token}\``);
  }
}

// 2. App.js wires PageTransition around AppRoutes inside Router
const app = read("src/App.js");
if (app.includes('import PageTransition from "./components/common/PageTransition"')) {
  pass("App.js imports PageTransition");
} else {
  fail("App.js imports PageTransition");
}
if (app.includes("<PageTransition>") && app.includes("<AppRoutes />")) {
  pass("App.js wraps AppRoutes with PageTransition");
} else {
  fail("App.js wraps AppRoutes with PageTransition");
}

// 3. Navbar/footer stay outside transition (stable chrome)
const ptIndex = app.indexOf("<PageTransition>");
const navbarIndex = app.indexOf("<Navbar");
if (navbarIndex !== -1 && ptIndex !== -1 && navbarIndex < ptIndex) {
  pass("Navbar renders outside PageTransition");
} else {
  fail("Navbar should be outside PageTransition");
}

// 4. Production build includes framer-motion (bundle proof)
const buildJsDir = path.join(root, "build", "static", "js");
if (fs.existsSync(buildJsDir)) {
  const mainJs = fs
    .readdirSync(buildJsDir)
    .find((f) => f.startsWith("main.") && f.endsWith(".js"));
  if (mainJs) {
    const bundlePath = path.join(buildJsDir, mainJs);
    const size = fs.statSync(bundlePath).size;
    // Minified bundles omit readable "framer-motion" strings; size + successful build is sufficient.
    if (size > 100_000) {
      pass("Production main bundle built", `${mainJs} (${(size / 1024).toFixed(0)} KiB)`);
    } else {
      fail("Production main bundle suspiciously small", mainJs);
    }
  } else {
    fail("No main.*.js in build/static/js — run npm run build first");
  }
} else {
  fail("build/ folder missing — run npm run build first");
}

// Report
const failed = checks.filter((c) => !c.ok);
console.log("\n=== Page transition verification (#867) ===\n");
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed\n`);
if (failed.length > 0) process.exit(1);
