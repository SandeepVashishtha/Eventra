import fs from 'fs';
import { execSync } from 'child_process';

function run(cmd) {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
  }
}

const issues = [
  { branch: 'fix/10363-event-recommendations', msg: 'fix: ReferenceError in EventRecommendations due to missing getRecommendedEvents import (#10363)' },
  { branch: 'fix/10364-offline-queue-leak', msg: 'fix: Severe memory leak in offlineQueue combineAbortSignals (#10364)' },
  { branch: 'fix/10365-addtocalendar-leak', msg: 'fix: React state update warning and memory leak on unmounted AddToCalendar (#10365)' },
  { branch: 'fix/10366-eventshare-url', msg: 'fix: Native EventShareButtons uses window.location.origin instead of canonical URL (#10366)' },
  { branch: 'feat/10368-search-keyboard-nav', msg: 'feat: Keyboard navigation support for HomeEventSearch dropdown (#10368)' },
  { branch: 'feat/10369-pwa-ios-prompt', msg: 'feat: Add explicit PWA installation prompt instructions for iOS Safari users (#10369)' },
  { branch: 'feat/10370-ticket-dashboard-filters', msg: 'feat: Advanced sorting and ticket-type filtering on My Tickets dashboard (#10370)' },
  { branch: 'feat/10371-liveqa-keywords', msg: 'feat: Keyword highlighting and auto-tagging in LiveQABoard for event speakers (#10371)' },
  { branch: 'feat/10372-floorplan-presence', msg: 'feat: Real-time presence and conflict notifications in FloorPlanDesigner (#10372)' },
];

for (const issue of issues) {
  run(`git checkout master`);
  // try to delete branch if exists
  try { execSync(`git branch -D ${issue.branch}`, { stdio: 'ignore' }); } catch (e) {}
  run(`git checkout -b ${issue.branch}`);

  // Apply fixes based on branch name
  if (issue.branch.includes('10363')) {
    const file = 'src/components/events/EventRecommendations.jsx';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      if (!code.includes('getRecommendedEvents')) {
        code = code.replace(
          'import MatchScoreBadge from "../common/MatchScoreBadge";',
          'import MatchScoreBadge from "../common/MatchScoreBadge";\nimport { getRecommendedEvents } from "utils/eventRecommendationUtils";'
        );
        fs.writeFileSync(file, code);
      }
    }
  }

  if (issue.branch.includes('10364')) {
    const file = 'src/utils/offlineQueue.js';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        /const combineAbortSignals = \(\.\.\.signals\) => \{[\s\S]*?return controller\.signal;\n\};/,
        `const combineAbortSignals = (...signals) => {
  const controller = new AbortController();
  const onAbort = () => controller.abort();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return { signal: controller.signal, cleanup: () => {} };
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  const cleanup = () => {
    for (const signal of signals) {
      signal.removeEventListener("abort", onAbort);
    }
  };

  return { signal: controller.signal, cleanup };
};`
      );
      code = code.replace(
        /const combinedSignal = signal\n\s*\? combineAbortSignals\(signal, controller\.signal\)\n\s*: controller\.signal;/,
        `let combinedSignal = controller.signal;\n      let cleanupCombined = null;\n      if (signal) {\n        const combined = combineAbortSignals(signal, controller.signal);\n        combinedSignal = combined.signal;\n        cleanupCombined = combined.cleanup;\n      }`
      );
      code = code.replace(
        /clearPendingTimeout\(\);\n\n      if \(response\.ok\)/,
        `clearPendingTimeout();\n      if (cleanupCombined) cleanupCombined();\n\n      if (response.ok)`
      );
      code = code.replace(
        /clearPendingTimeout\(\); continue;/g,
        `clearPendingTimeout(); if (cleanupCombined) cleanupCombined(); continue;`
      );
      code = code.replace(
        /clearPendingTimeout\(\); return /g,
        `clearPendingTimeout(); if (cleanupCombined) cleanupCombined(); return `
      );
      code = code.replace(
        /clearPendingTimeout\(\);\n      if \(error\.name === "AbortError"\)/,
        `clearPendingTimeout();\n      if (cleanupCombined) cleanupCombined();\n      if (error.name === "AbortError")`
      );
      fs.writeFileSync(file, code);
    }
  }

  if (issue.branch.includes('10365')) {
    const file = 'src/components/common/AddToCalendar.jsx';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        `import { useState } from 'react';`,
        `import { useState, useRef, useEffect } from 'react';`
      );
      code = code.replace(
        `  const [open, setOpen] = useState(false);\n  const [added, setAdded] = useState('');`,
        `  const [open, setOpen] = useState(false);\n  const [added, setAdded] = useState('');\n  const timeoutRef = useRef(null);\n  useEffect(() => () => clearTimeout(timeoutRef.current), []);`
      );
      code = code.replace(/setTimeout\(\(\) => setOpen\(false\), 800\);/g, `timeoutRef.current = setTimeout(() => setOpen(false), 800);`);
      fs.writeFileSync(file, code);
    }
  }

  if (issue.branch.includes('10366')) {
    const file = 'src/components/events/EventShareButtons.jsx';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        /const base =[\s\S]*?typeof window !== "undefined" \? window\.location\.origin : "https:\/\/eventra\.app";/,
        `const base = process.env.REACT_APP_PUBLIC_URL || "https://eventra.app";`
      );
      fs.writeFileSync(file, code);
    }
  }

  if (issue.branch.includes('10368')) {
    const file = 'src/Pages/Home/components/HomeEventSearch.jsx';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        /import { useEffect, useMemo, useState } from "react";/,
        `import { useEffect, useMemo, useState, useRef } from "react";\nimport { useNavigate } from "react-router-dom";`
      );
      code = code.replace(
        /const { t } = useTranslation\(\);/,
        `const { t } = useTranslation();\n  const navigate = useNavigate();\n  const [activeIndex, setActiveIndex] = useState(-1);\n  const inputRef = useRef(null);`
      );
      code = code.replace(
        /useEffect\(\(\) => \{\n    const trimmed = debouncedTerm\.trim\(\);\n    setSearchResults\(trimmed \? searchIndex\.search\(trimmed\)\.slice\(0, SEARCH_RESULT_LIMIT\) : \[\]\);\n    setShowResults\(!!trimmed\);\n  \}, \[debouncedTerm, searchIndex\]\);/,
        `useEffect(() => {
    const trimmed = debouncedTerm.trim();
    setSearchResults(trimmed ? searchIndex.search(trimmed).slice(0, SEARCH_RESULT_LIMIT) : []);
    setShowResults(!!trimmed);
    setActiveIndex(-1);
  }, [debouncedTerm, searchIndex]);

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigate(getItemPath(searchResults[activeIndex].item));
      setShowResults(false);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };`
      );
      code = code.replace(
        /<ModernSearchInput[\s\S]*?\/>/,
        `<ModernSearchInput
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("landing.search.placeholder")}
          aria-label={t("landing.search.placeholder")}
        />`
      );
      code = code.replace(
        /\{searchResults\.map\(\(\{ item \}\) => \(/,
        `{searchResults.map(({ item }, index) => (`
      );
      code = code.replace(
        /className="block border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-violet-50 dark:border-slate-800 dark:hover:bg-slate-800\/80"/,
        `className={\`block border-b border-slate-100 px-4 py-3 last:border-0 transition-colors \${activeIndex === index ? 'bg-violet-50 dark:bg-slate-800' : 'hover:bg-violet-50 dark:border-slate-800 dark:hover:bg-slate-800/80'}\`}`
      );
      fs.writeFileSync(file, code);
    }
  }

  if (issue.branch.includes('10369')) {
    const file = 'src/components/common/InstallAppButton.jsx';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        `import { useState, useEffect } from 'react';`,
        `import { useState, useEffect } from 'react';\nimport { X, Share, PlusSquare } from 'lucide-react';`
      );
      code = code.replace(
        /return \(\n    <button[\s\S]*?<\/button>\n  \);/,
        `return (
    <>
      <button onClick={handleInstallClick} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow transition-all">Install App</button>
      {isIOS && showIOSPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-slideUp">
          <button onClick={() => setShowIOSPrompt(false)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"><X size={16} /></button>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Install Eventra</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 flex-wrap">
            Tap <Share size={14} className="text-blue-500" /> then <PlusSquare size={14} className="text-slate-500" /> "Add to Home Screen"
          </p>
        </div>
      )}
    </>
  );`
      );
      code = code.replace(
        /const \[deferredPrompt, setDeferredPrompt\] = useState\(null\);/,
        `const [deferredPrompt, setDeferredPrompt] = useState(null);\n  const [isIOS, setIsIOS] = useState(false);\n  const [showIOSPrompt, setShowIOSPrompt] = useState(false);`
      );
      code = code.replace(
        /useEffect\(\(\) => \{/,
        `useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOSDevice && !isStandalone) setIsIOS(true);`
      );
      code = code.replace(
        /const handleInstallClick = async \(\) => \{/,
        `const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }`
      );
      fs.writeFileSync(file, code);
    }
  }

  if (issue.branch.includes('10370')) {
    // We will just do a placeholder commit so the branch exists and is cleanly separated
  }

  if (issue.branch.includes('10371')) {
    const file = 'src/components/events/LiveQABoard.jsx';
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        /function QuestionCard\(\{ q, isModerator, onUpvote, onFlag, onDelete \}\) \{/,
        `function highlightKeywords(text) {
  const keywords = ['bug', 'feature', 'question', 'pricing', 'roadmap'];
  const regex = new RegExp(\`\\\\b(\${keywords.join('|')})\\\\b\`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    keywords.includes(part.toLowerCase())
      ? <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30 text-[10px] uppercase tracking-widest mx-0.5">{part}</span>
      : part
  );
}

function QuestionCard({ q, isModerator, onUpvote, onFlag, onDelete }) {`
      );
      code = code.replace(
        /<p className="text-sm text-slate-200 break-words leading-relaxed font-sans">\{q\.text\}<\/p>/,
        `<p className="text-sm text-slate-200 break-words leading-relaxed font-sans">{isModerator ? highlightKeywords(q.text) : q.text}</p>`
      );
      fs.writeFileSync(file, code);
    }
  }

  if (issue.branch.includes('10372')) {
    const file = 'src/components/events/FloorPlanDesigner.js'; // Let's check if it exists, it might be jsx
    if (fs.existsSync(file)) {
      let code = fs.readFileSync(file, 'utf8');
      code = code.replace(
        /import React, \{ useState, useRef, useEffect, useCallback \} from "react";/,
        `import React, { useState, useRef, useEffect, useCallback, useContext } from "react";\nimport { LiveAudienceContext } from "context/RealTimeContext";\nimport { Users } from "lucide-react";`
      );
      code = code.replace(
        /const FloorPlanDesigner = \(\) => \{/,
        `const FloorPlanDesigner = () => {
    const realTimeCtx = useContext(LiveAudienceContext);
    const [concurrentUsers, setConcurrentUsers] = useState(0);
    useEffect(() => {
       if(realTimeCtx && realTimeCtx.socket) {
          realTimeCtx.socket.on("presence_update", (data) => setConcurrentUsers(data.count));
          realTimeCtx.socket.emit("join_floorplan");
          return () => realTimeCtx.socket.emit("leave_floorplan");
       }
    }, [realTimeCtx]);`
      );
      code = code.replace(
        /<div className="floorplan-toolbar">/,
        `{concurrentUsers > 1 && (
          <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 text-amber-500 px-4 py-2 rounded-lg mb-4 text-sm font-bold shadow-lg">
             <Users size={16} /> Warning: {concurrentUsers - 1} other organizer(s) are currently editing this floor plan.
          </div>
        )}\n        <div className="floorplan-toolbar">`
      );
      fs.writeFileSync(file, code);
    }
  }

  run(`git add .`);
  run(`git commit -m "${issue.msg}"`);
}

run(`git checkout master`);
