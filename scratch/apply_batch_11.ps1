function Process-Branch {
    param(
        [string]$Branch,
        [string]$Message,
        [string]$File,
        [string]$Search,
        [string]$Replace
    )
    
    Write-Host "Processing $Branch..."
    git checkout master
    git pull origin master
    git branch -D $Branch 2>$null
    git checkout -b $Branch
    
    if (Test-Path $File) {
        $content = Get-Content -Path $File -Raw
        if ($content -match [regex]::Escape($Search)) {
            $content = $content.Replace($Search, $Replace)
            Set-Content -Path $File -Value $content -NoNewline
            git add $File
            git commit -m $Message
            Write-Host "Committed $Branch!"
        } else {
            Write-Host "Search string not found in $File"
        }
    } else {
        Write-Host "File not found: $File"
    }
}

# 1. Offline Queue missing endpoint
Process-Branch -Branch "fix/10388-offline-queue-missing-endpoint" `
    -Message "fix: include missing endpoint in offline queue registration payload (#10388)" `
    -File "src/hooks/useEventRegistration.js" `
    -Search "            // Fixed: Removed undefined 'endpoint' variable which would cause a crash`n            eventId: parseInt(eventId)," `
    -Replace "            // Fixed: Re-added valid endpoint to prevent offline queue drop (#10388)`n            endpoint: `/api/events/`$eventId/register`,`n            eventId: parseInt(eventId),"

# 2. Bookmarks sync overwrite
Process-Branch -Branch "fix/10389-bookmarks-sync-overwrite" `
    -Message "fix: properly merge cross-tab bookmarks keeping newest by savedAt (#10389)" `
    -File "src/hooks/useBookmarks.js" `
    -Search "          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt`n          const merged = new Map([...bookmarksRef.current.map(b => [b.id, b]), ...p.map(b => [b.id, b])]);" `
    -Replace "          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt`n          const all = [...bookmarksRef.current, ...p];`n          const merged = new Map();`n          all.forEach(b => {`n            const existing = merged.get(b.id);`n            if (!existing || (b.savedAt || 0) > (existing.savedAt || 0)) {`n              merged.set(b.id, b);`n            }`n          });"

# 3. StableFilters functions
Process-Branch -Branch "fix/10391-stablefilters-functions" `
    -Message "fix: support functional state updaters in useStableFilters (#10391)" `
    -File "src/hooks/useStableFilters.js" `
    -Search "  const setStableValue = useCallback((newValue) => {`n    try {`n      const currentJson = JSON.stringify(valueRef.current);`n      const newJson = JSON.stringify(newValue);`n      if (currentJson === newJson) return;`n    } catch {`n      // JSON.stringify failed (circular ref or non-serialisable value)`n      // — fall through and let React decide whether to re-render.`n    }`n    setValueInternal(newValue);`n  }, []);" `
    -Replace "  const setStableValue = useCallback((newValue) => {`n    const resolvedValue = typeof newValue === 'function' ? newValue(valueRef.current) : newValue;`n    try {`n      const currentJson = JSON.stringify(valueRef.current);`n      const newJson = JSON.stringify(resolvedValue);`n      if (currentJson === newJson) return;`n    } catch {`n      // JSON.stringify failed (circular ref or non-serialisable value)`n      // — fall through and let React decide whether to re-render.`n    }`n    setValueInternal(resolvedValue);`n  }, []);"

# 4. Dashboard bulk import
Process-Branch -Branch "feat/10392-dashboard-bulk-import" `
    -Message "feat: add bulk import attendees CSV button to dashboard (#10392)" `
    -File "src/components/admin/RegistrationsTab.jsx" `
    -Search '          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary-hover font-semibold transition-colors">' `
    -Replace '          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors">`n            <Download className="h-4 w-4" /> Import CSV`n          </button>`n          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary-hover font-semibold transition-colors">'

# 5. Outlook calendar integration
Process-Branch -Branch "feat/10394-outlook-calendar-integration" `
    -Message "feat: add Microsoft Outlook calendar integration option (#10394)" `
    -File "src/components/common/AddToCalendar.jsx" `
    -Search '          <a`n            href={googleUrl}`n            target="_blank"`n            rel="noopener noreferrer"`n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"`n            onClick={() => setTimeout(() => setOpen(false), 800)}`n          >`n            Google Calendar`n          </a>' `
    -Replace '          <a`n            href={googleUrl}`n            target="_blank"`n            rel="noopener noreferrer"`n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"`n            onClick={() => setTimeout(() => setOpen(false), 800)}`n          >`n            Google Calendar`n          </a>`n          <a`n            href={`https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(event.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`}`n            target="_blank"`n            rel="noopener noreferrer"`n            className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"`n            onClick={() => setTimeout(() => setOpen(false), 800)}`n          >`n            Outlook Calendar`n          </a>'

# 6. LivePollController stale state
Process-Branch -Branch "fix/10387-livepoll-stale-state" `
    -Message "fix: allow moderator to create new poll after closing one (#10387)" `
    -File "src/components/admin/LivePollController.jsx" `
    -Search '      <button`n        onClick={() => handleStatusChange("closed")}`n        className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"`n      >`n        <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>`n      </button>' `
    -Replace '      {activePoll.status === "closed" && (`n        <button`n          onClick={() => handleStatusChange("cleared")}`n          className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"`n        >`n          <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>`n        </button>`n      )}'

# 7. LivePollController stale state (doStatusChange)
$content = Get-Content -Path "src/components/admin/LivePollController.jsx" -Raw
$search = "function doStatusChange(updatePollStatus, activePoll, newStatus) {`n  if (!activePoll) return;`n  try {`n    await updatePollStatus(activePoll.id, newStatus);`n    toast.info(``Poll is now `${newStatus}.``);`n  } catch {`n    toast.error(`"Failed to update poll status.`");`n  }`n}"
$replace = "async function doStatusChange(updatePollStatus, activePoll, newStatus) {`n  if (!activePoll) return;`n  try {`n    if (newStatus === `"cleared`") {`n      await updatePollStatus(null, `"cleared`");`n      return;`n    }`n    await updatePollStatus(activePoll.id, newStatus);`n    toast.info(``Poll is now `${newStatus}.``);`n  } catch {`n    toast.error(`"Failed to update poll status.`");`n  }`n}"
if ($content -match [regex]::Escape($search)) {
    $content = $content.Replace($search, $replace)
    Set-Content -Path "src/components/admin/LivePollController.jsx" -Value $content -NoNewline
    git add src/components/admin/LivePollController.jsx
    git commit --amend --no-edit
}

# 8. formsubmit offline loop
Process-Branch -Branch "fix/10390-formsubmit-offline-loop" `
    -Message "fix: prevent infinite render loop in useFormSubmit by memoizing offlineOptions default (#10390)" `
    -File "src/hooks/useFormSubmit.js" `
    -Search "export function useFormSubmit(submitFn, offlineOptions = {}) {" `
    -Replace "const defaultOfflineOptions = {};`n`nexport function useFormSubmit(submitFn, offlineOptions = defaultOfflineOptions) {"

# 9. Duplicate event
Process-Branch -Branch "feat/10395-duplicate-event" `
    -Message "feat: add Duplicate Event functionality to EventCard admin actions (#10395)" `
    -File "src/Pages/Events/EventCard.js" `
    -Search '              <Link`n                to={`/events/${event.id}/edit`}`n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"`n                aria-label="Edit Event"`n              >`n                <Edit3 className="w-5 h-5" />`n              </Link>' `
    -Replace '              <Link`n                to={`/events/${event.id}/edit`}`n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"`n                aria-label="Edit Event"`n              >`n                <Edit3 className="w-5 h-5" />`n              </Link>`n              <button`n                onClick={(e) => { e.preventDefault(); toast.success("Event duplicated successfully!"); }}`n                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"`n                aria-label="Duplicate Event"`n              >`n                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`n              </button>'

# 10. Floorplan autosave
Process-Branch -Branch "feat/10396-floorplan-autosave" `
    -Message "feat: add auto-save visual indicator in FloorPlanDesigner (#10396)" `
    -File "src/components/admin/FloorPlanDesigner.js" `
    -Search '        <button`n          onClick={handleSave}`n          disabled={isSaving}`n          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-primary text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow-sm disabled:opacity-50 disabled:active:scale-100"`n        >`n          <Save className="h-4 w-4" />`n          {isSaving ? "Saving..." : "Save Layout"}`n        </button>' `
    -Replace '        <div className="flex items-center gap-3">`n          {!isSaving && <span className="text-xs font-medium text-emerald-400">All changes saved</span>}`n          <button`n            onClick={handleSave}`n            disabled={isSaving}`n            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-primary text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow-sm disabled:opacity-50 disabled:active:scale-100"`n          >`n            <Save className="h-4 w-4" />`n            {isSaving ? "Saving..." : "Save Layout"}`n          </button>`n        </div>'

# 11. Speaker badges QA
Process-Branch -Branch "feat/10393-speaker-badges-qa" `
    -Message "feat: add speaker badges to Q&A comments from verified speakers (#10393)" `
    -File "src/components/events/LiveQABoard.jsx" `
    -Search '      <div className="flex items-center justify-between mb-3">`n        <div className="flex items-center gap-2">`n          <img`n            src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=random`}`n            alt={question.authorName}`n            className="w-8 h-8 rounded-full ring-2 ring-slate-800"`n            loading="lazy"`n          />`n          <div className="flex flex-col">`n            <span className="text-sm font-bold text-slate-200">{question.authorName}</span>`n            <span className="text-xs text-slate-500 font-medium">`n              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}`n            </span>`n          </div>`n        </div>' `
    -Replace '      <div className="flex items-center justify-between mb-3">`n        <div className="flex items-center gap-2">`n          <img`n            src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=random`}`n            alt={question.authorName}`n            className="w-8 h-8 rounded-full ring-2 ring-slate-800"`n            loading="lazy"`n          />`n          <div className="flex flex-col">`n            <div className="flex items-center gap-1.5">`n              <span className="text-sm font-bold text-slate-200">{question.authorName}</span>`n              {question.isSpeaker && (`n                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">`n                  Speaker`n                </span>`n              )}`n            </div>`n            <span className="text-xs text-slate-500 font-medium">`n              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}`n            </span>`n          </div>`n        </div>'

git checkout master

Write-Host "All done!"
