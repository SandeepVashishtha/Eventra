const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const brands = ['Twitter', 'Github', 'Linkedin', 'Facebook', 'Instagram', 'Youtube', 'Twitch'];
  let addedImports = [];

  for (const brand of brands) {
    if (content.includes(brand) && content.match(new RegExp(`import\\s+{[^}]*\\b${brand}\\b[^}]*}\\s+from\\s+['"]lucide-react['"]`))) {
      content = content.replace(new RegExp(`(import\\s+{[^}]*)(\\b${brand}\\b\\s*,?\\s*)([^}]*}\\s+from\\s+['"]lucide-react['"])`), (match, p1, p2, p3) => {
          return p1 + p3;
      });
      addedImports.push(`import { Fa${brand} as ${brand} } from "react-icons/fa";`);
      changed = true;
    }
  }

  if (changed) {
    content = addedImports.join('\n') + '\n' + content;
    // clean up empty imports or dangling commas
    content = content.replace(/,\s*}/g, '}').replace(/{\s*,/g, '{').replace(/import\s*{\s*}\s*from\s+['"]lucide-react['"];?\n?/g, '');
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
});
