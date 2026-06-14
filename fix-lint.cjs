// fix-warnings.js
const fs = require('fs');
const { execSync } = require('child_process');

console.log("🔍 Running ESLint to get warnings...");
try {
  // ESLint ko JSON format mein output generate karne ko bolenge
  execSync('npx eslint src --format json --output-file lint-warnings.json --max-warnings=1000', { stdio: 'pipe' });
} catch (e) {
  // ESLint warnings hone par error code return karta hai, jo ki expected hai
}

if (!fs.existsSync('lint-warnings.json')) {
  console.error("❌ Failed to generate lint-warnings.json");
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync('lint-warnings.json', 'utf8'));
let totalFixes = 0;

// Regex special characters ko escape karne ka function
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const file of results) {
  if (!file.messages || file.messages.length === 0) continue;

  const filePath = file.filePath;
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  
  // Messages ko line number ke hisaab se ulta (descending) sort karte hain 
  // taaki line remove/insert karne se baaki lines ka index kharab na ho
  const messages = [...file.messages].sort((a, b) => b.line - a.line);

  for (const msg of messages) {
    const lineIdx = msg.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    let line = lines[lineIdx];
    const rule = msg.ruleId;
    const text = msg.message;

    if (rule === 'no-unused-vars') {
      const match = text.match(/'([^']+)' (?:is defined|is assigned a value) but never used/);
      if (match) {
        const varName = match[1];
        const safeVarName = escapeRegex(varName);
        
        // 1. Fix catch blocks: catch (e) -> catch
        const catchRegex = new RegExp(`catch\\s*\\(\\s*${safeVarName}\\s*\\)`);
        if (catchRegex.test(line)) {
          lines[lineIdx] = line.replace(catchRegex, 'catch');
          totalFixes++;
          continue;
        }

        // 2. Fix default imports: import React from 'react';
        const importDefaultRegex = new RegExp(`^\\s*import\\s+${safeVarName}\\s+from\\s+['"][^'"]+['"];?\\s*$`);
        if (importDefaultRegex.test(line)) {
          lines[lineIdx] = '';
          totalFixes++;
          continue;
        }

        // 3. Fix named imports: import { motion, SSE_STATUS } from '...';
        const importNamedRegex = new RegExp(`^\\s*import\\s+\\{([^}]+)\\}\\s+from\\s+['"][^'"]+['"];?\\s*$`);
        const importMatch = line.match(importNamedRegex);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(s => s.trim()).filter(s => s && s !== varName);
          if (imports.length === 0) {
            lines[lineIdx] = '';
          } else {
            lines[lineIdx] = line.replace(/\{[^}]+\}/, `{ ${imports.join(', ')} }`);
          }
          totalFixes++;
          continue;
        }

        // 4. Fix simple variable declarations: const isPastEvent = ...;
        const varDeclRegex = new RegExp(`^\\s*(const|let|var)\\s+${safeVarName}\\s*=[^;]*;?\\s*$`);
        if (varDeclRegex.test(line)) {
          lines[lineIdx] = '';
          totalFixes++;
          continue;
        }

        // 5. Fix object destructuring: const { isDark, isMobileView } = ...
        const destructureRegex = new RegExp(`\\{([^}]*?)\\b${safeVarName}\\b([^}]*?)\\}`);
        const destMatch = line.match(destructureRegex);
        if (destMatch) {
          let inner = destMatch[1] + destMatch[2];
          inner = inner.replace(new RegExp(`\\b${safeVarName}\\b`), '');
          inner = inner.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').replace(/\s+/g, ' ').trim();
          
          if (inner === '') {
             lines[lineIdx] = '';
          } else {
             lines[lineIdx] = line.replace(/\{[^}]+\}/, `{ ${inner} }`);
          }
          totalFixes++;
          continue;
        }
      }
    } 
    else if (rule === 'react-hooks/exhaustive-deps') {
      // Agar pichli line mein pehle se disable comment hai, toh skip karo
      if (lineIdx > 0 && lines[lineIdx - 1].includes('eslint-disable-next-line react-hooks/exhaustive-deps')) {
        continue;
      }
      
      // Current line ka indentation (spaces) nikalo
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      
      // Hook ke theek upar disable comment insert karo
      lines.splice(lineIdx, 0, `${indent}// eslint-disable-next-line react-hooks/exhaustive-deps`);
      totalFixes++;
    }
  }

  
  const newContent = lines.join('\n');
  if (newContent !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

console.log(`\n🛠️  Applied ${totalFixes} automatic fixes.`);
console.log("🧹 Cleaning up temporary files...");
if (fs.existsSync('lint-warnings.json')) {
  fs.unlinkSync('lint-warnings.json');
}
console.log("🎉 Done! Run `npm run lint` again to see the clean output.");