import fs from 'fs';
import { execSync } from 'child_process';

const branches = [
  {
    branch: 'fix/10388-offline-queue-missing-endpoint',
    message: 'fix: include missing endpoint in offline queue registration payload (#10388)',
    file: 'src/hooks/useEventRegistration.js',
    replacements: [
      {
        search: `            // Fixed: Removed undefined 'endpoint' variable which would cause a crash\n            eventId: parseInt(eventId),`,
        replace: `            // Fixed: Re-added valid endpoint to prevent offline queue drop (#10388)\n            endpoint: \`/api/events/\${eventId}/register\`,\n            eventId: parseInt(eventId),`
      }
    ]
  },
  {
    branch: 'fix/10389-bookmarks-sync-overwrite',
    message: 'fix: properly merge cross-tab bookmarks keeping newest by savedAt (#10389)',
    file: 'src/hooks/useBookmarks.js',
    replacements: [
      {
        search: `          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt\n          const merged = new Map([...bookmarksRef.current.map(b => [b.id, b]), ...p.map(b => [b.id, b])]);`,
        replace: `          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt\n          const all = [...bookmarksRef.current, ...p];\n          const merged = new Map();\n          all.forEach(b => {\n            const existing = merged.get(b.id);\n            if (!existing || (b.savedAt || 0) > (existing.savedAt || 0)) {\n              merged.set(b.id, b);\n            }\n          });`
      }
    ]
  },
  {
    branch: 'fix/10391-stablefilters-functions',
    message: 'fix: support functional state updaters in useStableFilters (#10391)',
    file: 'src/hooks/useStableFilters.js',
    replacements: [
      {
        search: `  const setStableValue = useCallback((newValue) => {\n    try {\n      const currentJson = JSON.stringify(valueRef.current);\n      const newJson = JSON.stringify(newValue);\n      if (currentJson === newJson) return;\n    } catch {\n      // JSON.stringify failed (circular ref or non-serialisable value)`,
        replace: `  const setStableValue = useCallback((newValue) => {\n    try {\n      const resolvedValue = typeof newValue === 'function' ? newValue(valueRef.current) : newValue;\n      const currentJson = JSON.stringify(valueRef.current);\n      const newJson = JSON.stringify(resolvedValue);\n      if (currentJson === newJson) return;\n      setValueInternal(resolvedValue);\n      return;\n    } catch {\n      // JSON.stringify failed (circular ref or non-serialisable value)`
      },
      {
        search: `    setValueInternal(newValue);\n  }, []);`,
        replace: `    setValueInternal(newValue);\n  }, []);` // No change needed here if we returned early above, but wait: we should just replace the whole function.
      }
    ]
  }
];

// Re-do the stable filters replacement properly
branches[2].replacements = [
  {
    search: `  const setStableValue = useCallback((newValue) => {\n    try {\n      const currentJson = JSON.stringify(valueRef.current);\n      const newJson = JSON.stringify(newValue);\n      if (currentJson === newJson) return;\n    } catch {\n      // JSON.stringify failed (circular ref or non-serialisable value)\n      // — fall through and let React decide whether to re-render.\n    }\n    setValueInternal(newValue);\n  }, []);`,
    replace: `  const setStableValue = useCallback((newValue) => {\n    const resolvedValue = typeof newValue === 'function' ? newValue(valueRef.current) : newValue;\n    try {\n      const currentJson = JSON.stringify(valueRef.current);\n      const newJson = JSON.stringify(resolvedValue);\n      if (currentJson === newJson) return;\n    } catch {\n      // JSON.stringify failed (circular ref or non-serialisable value)\n      // — fall through and let React decide whether to re-render.\n    }\n    setValueInternal(resolvedValue);\n  }, []);`
  }
];

const branches2 = [
  {
    branch: 'feat/10392-dashboard-bulk-import',
    message: 'feat: add bulk import attendees CSV button to dashboard (#10392)',
    file: 'src/components/admin/RegistrationsTab.jsx',
    replacements: [
      {
        search: `          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary-hover font-semibold transition-colors">`,
        replace: `          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors">\n            <Download className="h-4 w-4" /> Import CSV\n          </button>\n          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary-hover font-semibold transition-colors">`
      }
    ]
  },
  {
    branch: 'feat/10394-outlook-calendar-integration',
    message: 'feat: add Microsoft Outlook calendar integration option (#10394)',
    file: 'src/components/common/AddToCalendar.jsx',
    replacements: [
      {
        search: `  const googleUrl = \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${encodeURIComponent(\n    event.title\n  )}&dates=\${formatDate(startDate)}/\${formatDate(endDate)}&details=\${encodeURIComponent(\n    event.description || ""\n  )}&location=\${encodeURIComponent(event.location || "")}\`;`,
        replace: `  const googleUrl = \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${encodeURIComponent(\n    event.title\n  )}&dates=\${formatDate(startDate)}/\${formatDate(endDate)}&details=\${encodeURIComponent(\n    event.description || ""\n  )}&location=\${encodeURIComponent(event.location || "")}\`;\n\n  const outlookUrl = \`https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=\${encodeURIComponent(event.title)}&startdt=\${startDate.toISOString()}&enddt=\${endDate.toISOString()}&body=\${encodeURIComponent(event.description || "")}&location=\${encodeURIComponent(event.location || "")}\`;`
      },
      {
        search: `          <a\n            href={googleUrl}\n            target="_blank"\n            rel="noopener noreferrer"\n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"\n            onClick={() => setTimeout(() => setOpen(false), 800)}\n          >\n            Google Calendar\n          </a>`,
        replace: `          <a\n            href={googleUrl}\n            target="_blank"\n            rel="noopener noreferrer"\n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"\n            onClick={() => setTimeout(() => setOpen(false), 800)}\n          >\n            Google Calendar\n          </a>\n          <a\n            href={outlookUrl}\n            target="_blank"\n            rel="noopener noreferrer"\n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"\n            onClick={() => setTimeout(() => setOpen(false), 800)}\n          >\n            Outlook Calendar\n          </a>`
      }
    ]
  }
];

const allBranches = [...branches, ...branches2];

for (const b of allBranches) {
  console.log(\`Processing \${b.branch}...\`);
  execSync(\`git checkout master && git pull origin master || true\`);
  try {
    execSync(\`git branch -D \${b.branch}\`, { stdio: 'ignore' });
  } catch(e) {}
  execSync(\`git checkout -b \${b.branch}\`);

  if (!fs.existsSync(b.file)) {
    console.error(\`File not found: \${b.file}\`);
    continue;
  }
  let content = fs.readFileSync(b.file, 'utf8');
  for (const r of b.replacements) {
    if (!content.includes(r.search)) {
      console.error(\`Search string not found in \${b.file}\`);
      console.error('SEARCH STRING:');
      console.error(r.search);
      process.exit(1);
    }
    content = content.replace(r.search, r.replace);
  }
  fs.writeFileSync(b.file, content, 'utf8');
  
  execSync(\`git add "\${b.file}"\`);
  execSync(\`git commit -m "\${b.message}"\`);
  console.log(\`Committed \${b.branch}!\`);
}

console.log('All branches created and committed!');
