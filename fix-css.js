const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'user', 'UserDashboard.css');
let css = fs.readFileSync(filePath, 'utf8');

// Replace light mode colors with CSS variables
css = css.replace(/background:\s*#f8fafc;/g, 'background: var(--bg-color);');
css = css.replace(/background:\s*#fff;/g, 'background: var(--card-bg-color);');
css = css.replace(/background-color:\s*#fff;/g, 'background-color: var(--card-bg-color);');
css = css.replace(/color:\s*#111827;/g, 'color: var(--text-color);');
css = css.replace(/color:\s*#374151;/g, 'color: var(--text-color);');
css = css.replace(/color:\s*#6b7280;/g, 'color: var(--text-color-light);');
css = css.replace(/color:\s*#9ca3af;/g, 'color: var(--text-color-light);');
css = css.replace(/border-color:\s*#e5e7eb;/g, 'border-color: var(--border-color);');
css = css.replace(/border:\s*1px\s+solid\s+#e5e7eb;/g, 'border: 1px solid var(--border-color);');
css = css.replace(/border-bottom:\s*1px\s+solid\s+#e5e7eb;/g, 'border-bottom: 1px solid var(--border-color);');
css = css.replace(/border-right:\s*1px\s+solid\s+#e5e7eb;/g, 'border-right: 1px solid var(--border-color);');
css = css.replace(/border-top:\s*1px\s+solid\s+#e5e7eb;/g, 'border-top: 1px solid var(--border-color);');

// Remove all .dark overrides since CSS variables handle it now!
css = css.replace(/\.dark\s+\.[^{]+\{\s*[^}]+\s*\}/g, '/* removed dark mode override (handled by CSS variables) */');

fs.writeFileSync(filePath, css, 'utf8');
console.log("Successfully refactored UserDashboard.css to use CSS variables!");
