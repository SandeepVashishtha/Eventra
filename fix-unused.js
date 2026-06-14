const fs = require('fs');

const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));

report.forEach(file => {
  if (file.messages.length === 0) return;
  
  let content = fs.readFileSync(file.filePath, 'utf8');
  let lines = content.split('\n');
  
  // Sort messages by line descending to not mess up line numbers when deleting
  const messages = file.messages.sort((a, b) => b.line - a.line);
  
  messages.forEach(msg => {
    if (msg.ruleId === 'no-unused-vars') {
      const match = msg.message.match(/'([^']+)' is defined but never used/);
      if (match) {
        const varName = match[1];
        if (varName === 'React') {
          // If the line is exactly import React from 'react'
          const lineContent = lines[msg.line - 1];
          if (/import\s+React\s+from\s+['"]react['"];?/.test(lineContent)) {
             lines.splice(msg.line - 1, 1);
          } else if (/import\s+React\s*,\s*\{/.test(lineContent)) {
             lines[msg.line - 1] = lineContent.replace(/React\s*,\s*/, '');
          }
        }
      }
    }
  });
  
  fs.writeFileSync(file.filePath, lines.join('\n'));
});
