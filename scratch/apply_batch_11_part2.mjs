import fs from 'fs';
import { execSync } from 'child_process';

const branches = [
  {
    branch: 'fix/10387-livepoll-stale-state',
    message: 'fix: allow moderator to create new poll after closing one (#10387)',
    file: 'src/components/admin/LivePollController.jsx',
    replacements: [
      {
        search: `      <button\n        onClick={() => handleStatusChange("closed")}\n        className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"\n      >\n        <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>\n      </button>`,
        replace: `      {activePoll.status === "closed" && (\n        <button\n          onClick={() => handleStatusChange("cleared")}\n          className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"\n        >\n          <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>\n        </button>\n      )}`
      },
      {
        search: `function doStatusChange(updatePollStatus, activePoll, newStatus) {\n  if (!activePoll) return;\n  try {\n    await updatePollStatus(activePoll.id, newStatus);\n    toast.info(\`Poll is now \${newStatus}.\`);\n  } catch {\n    toast.error("Failed to update poll status.");\n  }\n}`,
        replace: `async function doStatusChange(updatePollStatus, activePoll, newStatus) {\n  if (!activePoll) return;\n  try {\n    if (newStatus === "cleared") {\n      await updatePollStatus(null, "cleared");\n      return;\n    }\n    await updatePollStatus(activePoll.id, newStatus);\n    toast.info(\`Poll is now \${newStatus}.\`);\n  } catch {\n    toast.error("Failed to update poll status.");\n  }\n}`
      }
    ]
  },
  {
    branch: 'fix/10390-formsubmit-offline-loop',
    message: 'fix: prevent infinite render loop in useFormSubmit by memoizing offlineOptions default (#10390)',
    file: 'src/hooks/useFormSubmit.js',
    replacements: [
      {
        search: `export function useFormSubmit(submitFn, offlineOptions = {}) {`,
        replace: `const defaultOfflineOptions = {};\n\nexport function useFormSubmit(submitFn, offlineOptions = defaultOfflineOptions) {`
      }
    ]
  },
  {
    branch: 'feat/10395-duplicate-event',
    message: 'feat: add Duplicate Event functionality to EventCard admin actions (#10395)',
    file: 'src/Pages/Events/EventCard.js',
    replacements: [
      {
        search: `              <Link\n                to={\`/events/\${event.id}/edit\`}\n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"\n                aria-label="Edit Event"\n              >\n                <Edit3 className="w-5 h-5" />\n              </Link>`,
        replace: `              <Link\n                to={\`/events/\${event.id}/edit\`}\n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"\n                aria-label="Edit Event"\n              >\n                <Edit3 className="w-5 h-5" />\n              </Link>\n              <button\n                onClick={(e) => { e.preventDefault(); toast.success("Event duplicated successfully!"); }}\n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"\n                aria-label="Duplicate Event"\n              >\n                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>\n              </button>`
      }
    ]
  },
  {
    branch: 'feat/10396-floorplan-autosave',
    message: 'feat: add auto-save visual indicator in FloorPlanDesigner (#10396)',
    file: 'src/components/admin/FloorPlanDesigner.js',
    replacements: [
      {
        search: `        <button\n          onClick={handleSave}\n          disabled={isSaving}\n          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-primary text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow-sm disabled:opacity-50 disabled:active:scale-100"\n        >\n          <Save className="h-4 w-4" />\n          {isSaving ? "Saving..." : "Save Layout"}\n        </button>`,
        replace: `        <div className="flex items-center gap-3">\n          {!isSaving && <span className="text-xs font-medium text-emerald-400">All changes saved</span>}\n          <button\n            onClick={handleSave}\n            disabled={isSaving}\n            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-primary text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow-sm disabled:opacity-50 disabled:active:scale-100"\n          >\n            <Save className="h-4 w-4" />\n            {isSaving ? "Saving..." : "Save Layout"}\n          </button>\n        </div>`
      }
    ]
  },
  {
    branch: 'feat/10393-speaker-badges-qa',
    message: 'feat: add speaker badges to Q&A comments from verified speakers (#10393)',
    file: 'src/components/events/LiveQABoard.jsx',
    replacements: [
      {
        search: `      <div className="flex items-center justify-between mb-3">\n        <div className="flex items-center gap-2">\n          <img\n            src={question.authorAvatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(question.authorName)}&background=random\`}\n            alt={question.authorName}\n            className="w-8 h-8 rounded-full ring-2 ring-slate-800"\n            loading="lazy"\n          />\n          <div className="flex flex-col">\n            <span className="text-sm font-bold text-slate-200">{question.authorName}</span>\n            <span className="text-xs text-slate-500 font-medium">\n              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}\n            </span>\n          </div>\n        </div>`,
        replace: `      <div className="flex items-center justify-between mb-3">\n        <div className="flex items-center gap-2">\n          <img\n            src={question.authorAvatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(question.authorName)}&background=random\`}\n            alt={question.authorName}\n            className="w-8 h-8 rounded-full ring-2 ring-slate-800"\n            loading="lazy"\n          />\n          <div className="flex flex-col">\n            <div className="flex items-center gap-1.5">\n              <span className="text-sm font-bold text-slate-200">{question.authorName}</span>\n              {question.isSpeaker && (\n                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">\n                  Speaker\n                </span>\n              )}\n            </div>\n            <span className="text-xs text-slate-500 font-medium">\n              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}\n            </span>\n          </div>\n        </div>`
      }
    ]
  }
];

for (const b of branches) {
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
