// Change the require at the top to include promises, or just use fs.promises directly:
const fs = require('fs');
const path = require('path');

// RECTIFIED ASYNC CRAWLER
async function getFiles(dir) {
  try {
    const files = await fs.promises.readdir(dir);
    const ObjectPromises = files.map(async (f) => {
      const full = path.join(dir, f);
      const stat = await fs.promises.stat(full);
      
      if (stat.isDirectory() && f !== 'node_modules') {
        return getFiles(full);
      } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
        return full;
      }
      return [];
    });
    
    const results = await Promise.all(ObjectPromises);
    return results.flat();
  } catch (err) {
    return [];
  }
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
});
