const fs = require('fs');
const { execSync } = require('child_process');

const branches = [
  {
    branch: 'fix/10388-offline-queue-missing-endpoint',
    message: 'fix: include missing endpoint in offline queue registration payload (#10388)',
    file: 'src/hooks/useEventRegistration.js',
    search: "            // Fixed: Removed undefined 'endpoint' variable which would cause a crash\n            eventId: parseInt(eventId),",
    replace: "            // Fixed: Re-added valid endpoint to prevent offline queue drop (#10388)\n            endpoint: '/api/events/' + eventId + '/register',\n            eventId: parseInt(eventId),"
  },
  {
    branch: 'fix/10389-bookmarks-sync-overwrite',
    message: 'fix: properly merge cross-tab bookmarks keeping newest by savedAt (#10389)',
    file: 'src/hooks/useBookmarks.js',
    search: "          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt\n          const merged = new Map([...bookmarksRef.current.map(b => [b.id, b]), ...p.map(b => [b.id, b])]);",
    replace: "          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt\n          const all = [...bookmarksRef.current, ...p];\n          const merged = new Map();\n          all.forEach(b => {\n            const existing = merged.get(b.id);\n            if (!existing || (b.savedAt || 0) > (existing.savedAt || 0)) {\n              merged.set(b.id, b);\n            }\n          });"
  },
  {
    branch: 'fix/10391-stablefilters-functions',
    message: 'fix: support functional state updaters in useStableFilters (#10391)',
    file: 'src/hooks/useStableFilters.js',
    search: "  const setStableValue = useCallback((newValue) => {\n    try {\n      const currentJson = JSON.stringify(valueRef.current);\n      const newJson = JSON.stringify(newValue);\n      if (currentJson === newJson) return;\n    } catch {\n      // JSON.stringify failed (circular ref or non-serialisable value)\n      // — fall through and let React decide whether to re-render.\n    }\n    setValueInternal(newValue);\n  }, []);",
    replace: "  const setStableValue = useCallback((newValue) => {\n    const resolvedValue = typeof newValue === 'function' ? newValue(valueRef.current) : newValue;\n    try {\n      const currentJson = JSON.stringify(valueRef.current);\n      const newJson = JSON.stringify(resolvedValue);\n      if (currentJson === newJson) return;\n    } catch {\n      // JSON.stringify failed (circular ref or non-serialisable value)\n      // — fall through and let React decide whether to re-render.\n    }\n    setValueInternal(resolvedValue);\n  }, []);"
  },
  {
    branch: 'feat/10392-dashboard-bulk-import',
    message: 'feat: add bulk import attendees CSV button to dashboard (#10392)',
    file: 'src/components/admin/RegistrationsTab.jsx',
    search: '          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary-hover font-semibold transition-colors">',
    replace: '          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors">\n            <Download className="h-4 w-4" /> Import CSV\n          </button>\n          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary-hover font-semibold transition-colors">'
  },
  {
    branch: 'feat/10394-outlook-calendar-integration',
    message: 'feat: add Microsoft Outlook calendar integration option (#10394)',
    file: 'src/components/common/AddToCalendar.jsx',
    search: '          <a\n            href={googleUrl}\n            target="_blank"\n            rel="noopener noreferrer"\n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"\n            onClick={() => setTimeout(() => setOpen(false), 800)}\n          >\n            Google Calendar\n          </a>',
    replace: '          <a\n            href={googleUrl}\n            target="_blank"\n            rel="noopener noreferrer"\n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"\n            onClick={() => setTimeout(() => setOpen(false), 800)}\n          >\n            Google Calendar\n          </a>\n          <a\n            href={"https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=" + encodeURIComponent(event.title) + "&startdt=" + startDate.toISOString() + "&enddt=" + endDate.toISOString() + "&body=" + encodeURIComponent(event.description || "") + "&location=" + encodeURIComponent(event.location || "")}\n            target="_blank"\n            rel="noopener noreferrer"\n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"\n            onClick={() => setTimeout(() => setOpen(false), 800)}\n          >\n            Outlook Calendar\n          </a>'
  },
  {
    branch: 'fix/10387-livepoll-stale-state',
    message: 'fix: allow moderator to create new poll after closing one (#10387)',
    file: 'src/components/admin/LivePollController.jsx',
    search: '      <button\n        onClick={() => handleStatusChange("closed")}\n        className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"\n      >\n        <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>\n      </button>',
    replace: '      {activePoll.status === "closed" && (\n        <button\n          onClick={() => handleStatusChange("cleared")}\n          className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"\n        >\n          <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>\n        </button>\n      )}'
  },
  {
    branch: 'fix/10387-livepoll-stale-state',
    message: 'amend',
    file: 'src/components/admin/LivePollController.jsx',
    search: 'function doStatusChange(updatePollStatus, activePoll, newStatus) {\n  if (!activePoll) return;\n  try {\n    await updatePollStatus(activePoll.id, newStatus);\n    toast.info(`Poll is now ${newStatus}.`);\n  } catch {\n    toast.error("Failed to update poll status.");\n  }\n}',
    replace: 'async function doStatusChange(updatePollStatus, activePoll, newStatus) {\n  if (!activePoll) return;\n  try {\n    if (newStatus === "cleared") {\n      await updatePollStatus(null, "cleared");\n      return;\n    }\n    await updatePollStatus(activePoll.id, newStatus);\n    toast.info(`Poll is now ${newStatus}.`);\n  } catch {\n    toast.error("Failed to update poll status.");\n  }\n}'
  },
  {
    branch: 'fix/10390-formsubmit-offline-loop',
    message: 'fix: prevent infinite render loop in useFormSubmit by memoizing offlineOptions default (#10390)',
    file: 'src/hooks/useFormSubmit.js',
    search: 'export function useFormSubmit(submitFn, offlineOptions = {}) {',
    replace: 'const defaultOfflineOptions = {};\n\nexport function useFormSubmit(submitFn, offlineOptions = defaultOfflineOptions) {'
  },
  {
    branch: 'feat/10395-duplicate-event',
    message: 'feat: add Duplicate Event functionality to EventCard admin actions (#10395)',
    file: 'src/Pages/Events/EventCard.js',
    search: '              <Link\n                to={`/events/${event.id}/edit`}\n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"\n                aria-label="Edit Event"\n              >\n                <Edit3 className="w-5 h-5" />\n              </Link>',
    replace: '              <Link\n                to={`/events/${event.id}/edit`}\n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"\n                aria-label="Edit Event"\n              >\n                <Edit3 className="w-5 h-5" />\n              </Link>\n              <button\n                onClick={(e) => { e.preventDefault(); toast.success("Event duplicated successfully!"); }}\n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"\n                aria-label="Duplicate Event"\n              >\n                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>\n              </button>'
  },
  {
    branch: 'feat/10396-floorplan-autosave',
    message: 'feat: add auto-save visual indicator in FloorPlanDesigner (#10396)',
    file: 'src/components/admin/FloorPlanDesigner.js',
    search: '        <button\n          onClick={handleSave}\n          disabled={isSaving}\n          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-primary text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow-sm disabled:opacity-50 disabled:active:scale-100"\n        >\n          <Save className="h-4 w-4" />\n          {isSaving ? "Saving..." : "Save Layout"}\n        </button>',
    replace: '        <div className="flex items-center gap-3">\n          {!isSaving && <span className="text-xs font-medium text-emerald-400">All changes saved</span>}\n          <button\n            onClick={handleSave}\n            disabled={isSaving}\n            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-primary text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow-sm disabled:opacity-50 disabled:active:scale-100"\n          >\n            <Save className="h-4 w-4" />\n            {isSaving ? "Saving..." : "Save Layout"}\n          </button>\n        </div>'
  },
  {
    branch: 'feat/10393-speaker-badges-qa',
    message: 'feat: add speaker badges to Q&A comments from verified speakers (#10393)',
    file: 'src/components/events/LiveQABoard.jsx',
    search: '      <div className="flex items-center justify-between mb-3">\n        <div className="flex items-center gap-2">\n          <img\n            src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=random`}\n            alt={question.authorName}\n            className="w-8 h-8 rounded-full ring-2 ring-slate-800"\n            loading="lazy"\n          />\n          <div className="flex flex-col">\n            <span className="text-sm font-bold text-slate-200">{question.authorName}</span>\n            <span className="text-xs text-slate-500 font-medium">\n              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}\n            </span>\n          </div>\n        </div>',
    replace: '      <div className="flex items-center justify-between mb-3">\n        <div className="flex items-center gap-2">\n          <img\n            src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=random`}\n            alt={question.authorName}\n            className="w-8 h-8 rounded-full ring-2 ring-slate-800"\n            loading="lazy"\n          />\n          <div className="flex flex-col">\n            <div className="flex items-center gap-1.5">\n              <span className="text-sm font-bold text-slate-200">{question.authorName}</span>\n              {question.isSpeaker && (\n                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">\n                  Speaker\n                </span>\n              )}\n            </div>\n            <span className="text-xs text-slate-500 font-medium">\n              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}\n            </span>\n          </div>\n        </div>'
  }
];

for (const b of branches) {
  console.log('Processing ' + b.branch + '...');
  if (b.message !== 'amend') {
    execSync('git checkout master && git pull origin master || true', { stdio: 'inherit' });
    try {
      execSync('git branch -D ' + b.branch, { stdio: 'ignore' });
    } catch(e) {}
    execSync('git checkout -b ' + b.branch, { stdio: 'inherit' });
  }

  if (!fs.existsSync(b.file)) {
    console.error('File not found: ' + b.file);
    continue;
  }
  let content = fs.readFileSync(b.file, 'utf8');
  if (!content.includes(b.search)) {
    console.error('Search string not found in ' + b.file);
    continue;
  }
  content = content.replace(b.search, b.replace);
  fs.writeFileSync(b.file, content, 'utf8');
  
  execSync('git add "' + b.file + '"', { stdio: 'inherit' });
  if (b.message === 'amend') {
    execSync('git commit --amend --no-edit', { stdio: 'inherit' });
  } else {
    execSync('git commit -m "' + b.message + '"', { stdio: 'inherit' });
  }
  console.log('Committed ' + b.branch + '!');
}

execSync('git checkout master', { stdio: 'inherit' });
console.log('All branches created and committed!');
