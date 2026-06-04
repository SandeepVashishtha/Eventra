const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let r = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules') r = r.concat(getFiles(full));
    else if (f.endsWith('.js') || f.endsWith('.jsx')) r.push(full);
  }
  return r;
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
    issues.push('DUPLICATE_RENDER: ' + rel);
  }
  
  // Check for duplicate export default
  const exportMatches = [...code.matchAll(/^export default /gm)];
  if (exportMatches.length > 1) {
    issues.push('DUPLICATE_EXPORT: ' + rel);
  }
}

console.log('Issues found:', issues.length);
issues.forEach(i => console.log(i));
