const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

function getFiles(dir) {
  let r = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '__tests__' && f !== '__mocks__') {
      r = r.concat(getFiles(full));
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      r.push(full);
    }
  }
  return r;
}

const files = getFiles(path.join(process.cwd(), 'src'));
const errors = [];

for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  const rel = f.replace(process.cwd() + path.sep, '');
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'optionalChaining', 'nullishCoalescingOperator'],
      errorRecovery: false,
    });
  } catch (e) {
    errors.push({ file: rel, line: e.loc?.line, col: e.loc?.column, msg: e.message?.split('\n')[0] });
  }
}

console.log('Syntax errors found:', errors.length);
errors.forEach(e => console.log(`[L${e.line}:C${e.col}] ${e.file} — ${e.msg}`));
