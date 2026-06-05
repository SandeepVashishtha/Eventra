const fs = require('fs').promises;
const path = require('path');

async function getFiles(dir) {
  let r = [];
  for (const f of await fs.readdir(dir)) {
    const full = path.join(dir, f);
    const stat = await fs.stat(full);
    if (stat.isDirectory() && f !== 'node_modules') r = r.concat(await getFiles(full));
    else if (f.endsWith('.js') || f.endsWith('.jsx')) r.push(full);
  }
  return r;
}

// Helper to strip out comments and string literals to prevent regex false positives
function cleanCodeForRegex(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
    .replace(/\/\/.*/g, '')            // Remove single-line comments
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '')   // Remove single-quoted strings safely
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '')   // Remove double-quoted strings safely
    .replace(/`[\s\S]*?`/g, '');       // Remove template literals
}

const files = getFiles('src');
const issues = [];

for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  let rel = path.relative(process.cwd(), f);
  rel = rel.split(path.sep).join('/');
  
  // Check for duplicate render() in class components
  const renderMatches = [...code.matchAll(/^\s*render\s*\(\s*\)\s*\{/gm)];
  if (renderMatches.length > 1) {
    hasDuplicateRender = true;
    break;
  }

  console.log('Issues found:', issues.length);
  issues.forEach(i => console.log(i));
}

main().catch(err => {
  console.error('scan-issues failed:', err);
  process.exit(1);
});
