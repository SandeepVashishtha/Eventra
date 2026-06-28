const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walk(srcDir);

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match target="_blank" that does NOT have rel="noopener noreferrer" nearby.
  // We can just do a regex replace.
  // A safe regex: find target="_blank" and check if rel= is missing.
  // Actually, an easier way: replace all `target="_blank"` with `target="_blank" rel="noopener noreferrer"`.
  // But this might duplicate rel="noopener noreferrer".
  // So first, let's remove any existing rel="noopener noreferrer" that is right after target="_blank".
  
  // Or better, let's just use regex to replace target="_blank" when it's NOT followed by rel="noopener noreferrer".
  // Let's replace all combinations of target and rel, and standardise them.
  let original = content;
  
  // To avoid complex regex, we can just do:
  // 1. replace `target="_blank" rel="noopener noreferrer"` with `target="_blank"`
  // 2. replace `target="_blank" rel="noreferrer"` with `target="_blank"`
  // 3. replace `target="_blank"` with `target="_blank" rel="noopener noreferrer"`
  
  content = content.replace(/target="_blank"\s+rel="noopener noreferrer"/g, 'target="_blank"');
  content = content.replace(/target="_blank"\s+rel="noreferrer"/g, 'target="_blank"');
  content = content.replace(/target="_blank"/g, 'target="_blank" rel="noopener noreferrer"');
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Finished. Updated ${count} files.`);
