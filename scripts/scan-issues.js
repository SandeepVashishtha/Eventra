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

async function main() {
  const files = await getFiles('src');
  const issues = [];

  for (const f of files) {
    const code = await fs.readFile(f, 'utf8');
    let rel = path.relative(process.cwd(), f);
    rel = rel.split(path.sep).join('/');
    const cleanCode = cleanCodeForRegex(code);

    // To fix separate classes legitimately having render(), we split by 'class ' keyword
    // and check if any individual class body contains more than one render() definition
    const classes = cleanCode.split(/\bclass\s+/);
    let hasDuplicateRender = false;

    // Skip the first split element as it's the code before any class definition
    for (let i = 1; i < classes.length; i++) {
      const renderMatches = [...classes[i].matchAll(/\brender\s*\(\s*\)\s*\{/g)];
      if (renderMatches.length > 1) {
        hasDuplicateRender = true;
        break;
      }
    }

    if (hasDuplicateRender) {
      issues.push('DUPLICATE_RENDER: ' + rel);
    }

    // Check for duplicate export default on code stripped of comments and strings
    const exportMatches = [...cleanCode.matchAll(/\bexport\s+default\b/g)];
    if (exportMatches.length > 1) {
      issues.push('DUPLICATE_EXPORT: ' + rel);
    }
  }

  console.log('Issues found:', issues.length);
  issues.forEach(i => console.log(i));
}

main().catch(err => {
  console.error('scan-issues failed:', err);
  process.exit(1);
});
