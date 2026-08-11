/**
 * Bundle Size Analysis Script
 *
 * Analyzes the production build output and reports file sizes.
 * Used by the bundle-analysis CI workflow to track bundle
 * size changes across PRs.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../../build");
const KB = 1024;
const MB = KB * KB;

function formatSize(bytes) {
  if (bytes >= MB) {
    return (bytes / MB).toFixed(2) + " MB";
  }
  if (bytes >= KB) {
    return (bytes / KB).toFixed(1) + " KB";
  }
  return bytes + " B";
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function analyze() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error("Build directory not found at:", BUILD_DIR);
    console.error("Run `npm run build` first.");
    process.exit(1);
  }

  const allFiles = walkDir(BUILD_DIR);
  const jsFiles = allFiles.filter((f) => f.endsWith(".js"));
  const cssFiles = allFiles.filter((f) => f.endsWith(".css"));
  const otherFiles = allFiles.filter(
    (f) => !f.endsWith(".js") && !f.endsWith(".css")
  );

  const jsSize = jsFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  const cssSize = cssFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  const otherSize = otherFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  const totalSize = jsSize + cssSize + otherSize;

  const assetsDir = path.join(BUILD_DIR, "assets");
  const chunks = [];
  if (fs.existsSync(assetsDir)) {
    const assetFiles = walkDir(assetsDir).filter(
      (f) => f.endsWith(".js") || f.endsWith(".css")
    );
    for (const file of assetFiles) {
      const size = fs.statSync(file).size;
      const name = path.basename(file);
      chunks.push({ name, size, sizeFormatted: formatSize(size) });
    }
  }

  chunks.sort((a, b) => b.size - a.size);

  console.log("\n=== Bundle Size Report ===\n");
  console.log(`Total build size:  ${formatSize(totalSize)}`);
  console.log(`JavaScript:        ${formatSize(jsSize)} (${jsFiles.length} files)`);
  console.log(`CSS:               ${formatSize(cssSize)} (${cssFiles.length} files)`);
  console.log(`Other assets:      ${formatSize(otherSize)} (${otherFiles.length} files)`);
  console.log(`\nTop chunks by size:`);
  console.log("─".repeat(80));

  let cumSize = 0;
  for (const chunk of chunks.slice(0, 15)) {
    cumSize += chunk.size;
    const pct = ((chunk.size / totalSize) * 100).toFixed(1);
    console.log(
      `${chunk.name.padEnd(60)} ${chunk.sizeFormatted.padStart(10)}  ${pct.padStart(5)}%`
    );
  }

  if (chunks.length > 15) {
    const remaining = chunks.length - 15;
    const remainingSize = chunks.slice(15).reduce((s, c) => s + c.size, 0);
    console.log(
      `${`... and ${remaining} more chunks`.padEnd(60)} ${formatSize(remainingSize).padStart(10)}`
    );
  }

  console.log("─".repeat(80));
  console.log(`${"Total".padEnd(60)} ${formatSize(totalSize).padStart(10)}    100%`);
  console.log("");

  // Machine-readable summary for GitHub Actions
  const summary = {
    totalSize,
    totalSizeFormatted: formatSize(totalSize),
    jsSize,
    cssSize,
    jsFiles: jsFiles.length,
    cssFiles: cssFiles.length,
    chunkCount: chunks.length,
    largestChunk: chunks[0] || null,
  };

  const summaryPath = path.join(BUILD_DIR, "bundle-size-report.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`Machine-readable report saved to: ${summaryPath}`);
}

analyze();
