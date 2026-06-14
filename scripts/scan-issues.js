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

// RECTIFIED EXECUTION BLOCK
getFiles('src').then(async (files) => {
  const issues = [];

  await Promise.all(
    files.map(async (f) => {
      try {
        const code = await fs.promises.readFile(f, 'utf8');
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
      } catch (err) {
        // Silently catch or handle unreadable files
      }
    })
  );

  console.log('Issues found:', issues.length);
  issues.forEach(i => console.log(i));
});
