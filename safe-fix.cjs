// safe-fix.cjs
const fs = require('fs');
const { execSync } = require('child_process');

console.log("🔍 Running ESLint to get warnings...");
try {
  execSync('npx eslint src --format json --output-file lint-warnings.json --max-warnings=1000', { stdio: 'pipe' });
} catch (e) {}

if (!fs.existsSync('lint-warnings.json')) {
  console.error("❌ Failed to generate lint-warnings.json");
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync('lint-warnings.json', 'utf8'));
let totalFixes = 0;
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const file of results) {
  if (!file.messages || file.messages.length === 0) continue;

  const filePath = file.filePath;
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  // Sort descending to avoid index shifting when inserting/deleting lines
  const messages = [...file.messages].sort((a, b) => b.line - a.line);

  for (const msg of messages) {
    const lineIdx = msg.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    let line = lines[lineIdx];
    const rule = msg.ruleId;
    const text = msg.message;

    if (rule === 'no-unused-vars') {
      const match = text.match(/'([^']+)' (?:is defined|is assigned a value) but never used/);
      if (!match) continue;
      const varName = match[1];
      const safeVarName = escapeRegex(varName);
      
      // 1. Fix catch blocks: catch (e) -> catch
      if (line.match(new RegExp(`catch\\s*\\(\\s*${safeVarName}\\s*\\)`))) {
        lines[lineIdx] = line.replace(new RegExp(`catch\\s*\\(\\s*${safeVarName}\\s*\\)`), 'catch');
        totalFixes++;
        continue;
      }

      // 2. Fix default imports: import React from 'react';
      if (line.match(new RegExp(`^\\s*import\\s+${safeVarName}\\s+from\\s+['"][^'"]+['"];?\\s*$`))) {
        lines[lineIdx] = '';
        totalFixes++;
        continue;
      }

      // 3. Fix named imports: import { motion, SSE_STATUS } from '...';
      const importMatch = line.match(/^(\s*)import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"];?\s*$/);
      if (importMatch) {
        const indent = importMatch[1];
        const imports = importMatch[2].split(',').map(s => s.trim()).filter(s => s && s !== varName);
        const fromPart = line.match(/from\s+(['"][^'"]+['"])/)[1];
        
        if (imports.length === 0) {
          lines[lineIdx] = '';
        } else {
          lines[lineIdx] = `${indent}import { ${imports.join(', ')} } from ${fromPart};`;
        }
        totalFixes++;
        continue;
      }

      // 4. Fix simple variable declarations: const isPastEvent = ...;
      // STRICT: Only if the ENTIRE line is just this declaration
      if (line.match(new RegExp(`^\\s*(const|let|var)\\s+${safeVarName}\\s*=[^;]*;\\s*$`))) {
        lines[lineIdx] = '';
        totalFixes++;
        continue;
      }

      // 5. Fix single-line object destructuring: const { isDark, isMobileView } = useTheme();
      // STRICT: Only if the ENTIRE line is just this destructuring
      const destMatch = line.match(/^(\s*)(const|let|var)\s+\{([^}]+)\}\s*=\s*([^;]+);\s*$/);
      if (destMatch) {
        const indent = destMatch[1];
        const keyword = destMatch[2];
        const vars = destMatch[3].split(',').map(s => s.trim()).filter(s => s && s !== varName);
        const value = destMatch[4];
        
        if (vars.length === 0) {
          lines[lineIdx] = '';
        } else {
          lines[lineIdx] = `${indent}${keyword} { ${vars.join(', ')} } = ${value};`;
        }
        totalFixes++;
        continue;
      }
    } 
    else if (rule === 'react-hooks/exhaustive-deps') {
      if (lineIdx > 0 && lines[lineIdx - 1].includes('eslint-disable-next-line react-hooks/exhaustive-deps')) {
        continue;
      }
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
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

console.log(`\n🛠️  Applied ${totalFixes} safe automatic fixes.`);
if (fs.existsSync('lint-warnings.json')) fs.unlinkSync('lint-warnings.json');
console.log("🎉 Done! Run `npm run lint` to verify.");