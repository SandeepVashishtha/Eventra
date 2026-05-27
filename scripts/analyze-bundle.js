#!/usr/bin/env node
/**
 * Webpack Bundle Analyzer Configuration
 * Inspects and segments build chunks for optimization.
 *
 * Usage: 
 *   ANALYZE=true npm run build
 *   node scripts/analyze-bundle.js (post-build analysis)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const STATIC_DIR = path.join(BUILD_DIR, 'static', 'js');

if (!fs.existsSync(STATIC_DIR)) {
  console.error('? Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('\n?? Bundle Analysis Report\n');
console.log('='.repeat(60));

const files = fs.readdirSync(STATIC_DIR)
  .filter(f => f.endsWith('.js'))
  .map(f => ({
    name: f,
    size: fs.statSync(path.join(STATIC_DIR, f)).size,
  }))
  .sort((a, b) => b.size - a.size);

let totalSize = 0;
for (const file of files) {
  const sizeKB = (file.size / 1024).toFixed(2);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const bar = '¦'.repeat(Math.min(Math.ceil(file.size / 10240), 40));
  
  console.log(`\n  ${file.name}`);
  console.log(`  Size: ${sizeKB} KB (${sizeMB} MB)`);
  console.log(`  ${bar}`);
  
  totalSize += file.size;
  
  // Warning for chunks > 500KB
  if (file.size > 512000) {
    console.log(`  ??  WARNING: This chunk exceeds 500KB. Consider code splitting.`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n  Total JS bundle size: ${(totalSize / 1024).toFixed(2)} KB (${(totalSize / (1024 * 1024)).toFixed(2)} MB)`);

if (totalSize > 1048576) {
  console.log('  ??  Total bundle exceeds 1MB. Review for optimization opportunities.\n');
} else {
  console.log('  ? Bundle size is within acceptable limits.\n');
}
