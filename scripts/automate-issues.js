// scripts/automate-issues.js
//
// Programmatically automates the creation of 20 Git branches and commits,
// each fixing a specific accessibility or quality issue in the Eventra codebase.
//
// Usage: node scripts/automate-issues.js

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Define the absolute root of the repository
const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Executes a shell command asynchronously with a timeout and interactive terminal mapping.
 */
function runCmdAsync(cmd, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const { signal } = controller;

    const child = spawn(cmd, {
      shell: true,
      cwd: REPO_ROOT,
      stdio: 'inherit', 
      signal
    });

    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Command timed out after ${timeoutMs / 1000}s: "${cmd}"`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') return;
      reject(err);
    });
  });
}

/**
 * Executes quiet verification background processes where output shouldn't stream to user terminal.
 */
function runQuietCmdAsync(cmd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true, cwd: REPO_ROOT, stdio: 'ignore' });
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Exit code ${code}`)));
    child.on('error', (err) => reject(err));
  });
}

/**
 * Defensive helper to clear local branches safely without destroying custom progress asynchronously
 */
async function checkAndSafelyDeleteBranchAsync(branchName) {
  try {
    // Check if the branch exists locally before doing anything
    await runQuietCmdAsync(`git show-ref --verify --quiet refs/heads/${branchName}`);
  } catch (error) {
    // Branch does not exist locally; completely safe to skip deletion phase
    return true;
  }

  try {
    console.log(`⚠️  Existing local branch found for '${branchName}'. Attempting safe removal...`);
    // Lowercase -d checks if the branch has been fully merged into upstream/HEAD
    await runQuietCmdAsync(`git branch -d ${branchName}`);
    console.log(`✅ Safely removed existing clean branch: ${branchName}`);
    return true;
  } catch (error) {
    // Git blocked the delete execution because the branch has unique/unmerged commits
    console.warn(`\n🛑 [SAFETY WARNING] Local branch '${branchName}' has unmerged custom variations or experiments!`);
    console.warn(`👉 Action: Skipping loop execution for this item to protect your experimental data.`);
    console.warn(`👉 Fix: If you want to force rewrite, manually clear it out via: git branch -D ${branchName}\n`);
    return false;
  }
}

// 20 Issues to automate
const issues = [
  {
    id: 1,
    branchName: 'fix/alert-icon-aria-hidden',
    filePath: 'src/components/common/Alert.jsx',
    searchContent: '      <div className="flex-shrink-0">\n        <Icon className={`h-5 w-5 ${config.iconColor}`} />\n      </div>',
    replacementContent: '      <div className="flex-shrink-0">\n        <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />\n      </div>',
    commitMessage: 'fix: add aria-hidden true to decorative icon inside Alert component'
  },
  {
    id: 2,
    branchName: 'fix/contributor-guide-font-typo',
    filePath: 'src/Pages/Leaderboard/ContributorGuide.js',
    searchContent: '          style={{fontFamily: \'"Big Shoulders Display", sans-seri\'}}',
    replacementContent: '          style={{fontFamily: \'"Big Shoulders Display", sans-serif\'}}',
    commitMessage: 'fix: correct sans-serif typo in contributor guide header style'
  },
  {
    id: 3,
    branchName: 'fix/loading-aria-label',
    filePath: 'src/components/common/Loading.js',
    searchContent: '    <div className="flex flex-col items-center justify-center gap-4 py-8" role="status" aria-live="polite">',
    replacementContent: '    <div className="flex flex-col items-center justify-center gap-4 py-8" role="status" aria-live="polite" aria-label={text || "Loading..."}>',
    commitMessage: 'fix: add informative state-based aria-label to Loading component'
  },
  {
    id: 4,
    branchName: 'fix/back-to-top-aria-hidden',
    filePath: 'src/components/common/BackToTopButton.js',
    searchContent: '          className={`fixed ${positionClass} z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:bg-zinc-800 border-2 border-white dark:border-gray-800 transition-colors ${className}`}\n        >\n          <FiArrowUp className="w-5 h-5" />',
    replacementContent: '          className={`fixed ${positionClass} z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:bg-zinc-800 border-2 border-white dark:border-gray-800 transition-colors ${className}`}\n        >\n          <FiArrowUp className="w-5 h-5" aria-hidden="true" />',
    commitMessage: 'fix: set aria-hidden true on back to top button decorative icon'
  },
  {
    id: 5,
    branchName: 'fix/chatbot-header-aria-hidden',
    filePath: 'src/components/Chatbot.jsx',
    searchContent: '              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">\n                  <Sparkles className="h-3.5 w-3.5" />\n                </div>',
    replacementContent: '              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">\n                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />\n                </div>',
    commitMessage: 'fix: add aria-hidden to decorative header sparkles inside Chatbot'
  },
  {
    id: 6,
    branchName: 'fix/notfound-page-glow-accessibility',
    filePath: 'src/components/NotFound.js',
    searchContent: '            <span className="absolute top-0 left-0 text-indigo-600/50 dark:text-blue-400 opacity-70 blur-sm">\n              404\n            </span>\n            <span className="absolute top-0 left-0 text-purple-600/50 dark:text-indigo-400 opacity-70 blur-sm">\n              404\n            </span>',
    replacementContent: '            <span className="absolute top-0 left-0 text-indigo-600/50 dark:text-blue-400 opacity-70 blur-sm" aria-hidden="true">\n              404\n            </span>\n            <span className="absolute top-0 left-0 text-purple-600/50 dark:text-indigo-400 opacity-70 blur-sm" aria-hidden="true">\n              404\n            </span>',
    commitMessage: 'fix: hide duplicate decorative background 404 glow text from screen readers'
  },
  {
    id: 7,
    branchName: 'fix/contactus-quick-response-icon-aria',
    filePath: 'src/Pages/Contact/ContactUs.js',
    searchContent: '                    <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">\n                      <FiMessageSquare className="w-7 h-7 text-white" />\n                    </div>',
    replacementContent: '                    <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">\n                      <FiMessageSquare className="w-7 h-7 text-white" aria-hidden="true" />\n                    </div>',
    commitMessage: 'fix: ensure decorative contact icons have aria-hidden set to true'
  },
  {
    id: 8,
    branchName: 'fix/faq-page-search-aria-label',
    filePath: 'src/Pages/FAQ/FAQPage.js',
    searchContent: '              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />\n              <input\n                type="text"\n                placeholder="Search hackathons, bookmarks, accounts..."\n                value={searchTerm}\n                onChange={(e) => setSearchTerm(e.target.value)}\n                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"\n              />',
    replacementContent: '              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />\n              <input\n                type="text"\n                placeholder="Search hackathons, bookmarks, accounts..."\n                value={searchTerm}\n                onChange={(e) => setSearchTerm(e.target.value)}\n                aria-label="Search FAQs"\n                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"\n              />',
    commitMessage: 'fix: add explicit search descriptive aria-label to FAQ input'
  },
  {
    id: 9,
    branchName: 'fix/faq-cta-buoy-icon-aria',
    filePath: 'src/Pages/FAQ/FaqCTA.jsx',
    searchContent: '      title: "Browse FAQs",\n      description:\n        "Quickly find answers to common questions about our platform.",\n      to: "/faq",\n      icon: <LifeBuoy className="w-10 h-10 text-purple-400" />,',
    replacementContent: '      title: "Browse FAQs",\n      description:\n        "Quickly find answers to common questions about our platform.",\n      to: "/faq",\n      icon: <LifeBuoy className="w-10 h-10 text-purple-400" aria-hidden="true" />,',
    commitMessage: 'fix: add aria-hidden to decorative support icons in FAQ CTA'
  },
  {
    id: 10,
    branchName: 'fix/theme-toggle-switch-role',
    filePath: 'src/components/common/ThemeToggleButton.js',
    searchContent: '  return (\n    <button\n      className="flex items-center cursor-pointer select-none"\n      onClick={() => setDarkMode((prev) => !prev)}\n      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}\n    >',
    replacementContent: '  return (\n    <button\n      className="flex items-center cursor-pointer select-none"\n      onClick={() => setDarkMode((prev) => !prev)}\n      role="switch"\n      aria-checked={darkMode}\n      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}\n    >',
    commitMessage: 'fix: apply role switch and aria-checked attribute to theme toggle'
  },
  {
    id: 11,
    branchName: 'fix/contributors-badge-alt-text',
    filePath: 'src/components/Contributors.js',
    searchContent: '                    <img\n                      loading="lazy"\n                      decoding="async"\n                      width="80"\n                      height="80"\n                      src={c.avatar_url}\n                      alt={c.login}\n                      className="w-20 h-20 rounded-full border-4 border-black shadow-xl"\n                    />',
    replacementContent: '                    <img\n                      loading="lazy"\n                      decoding="async"\n                      width="80"\n                      height="80"\n                      src={c.avatar_url}\n                      alt={`\${c.login}\'s GitHub avatar`}\n                      className="w-20 h-20 rounded-full border-4 border-black shadow-xl"\n                    />',
    commitMessage: 'fix: improve screen reader alt text for contributor avatar images'
  },
  {
    id: 12,
    branchName: 'fix/chatbot-submit-button-title',
    filePath: 'src/components/Chatbot.jsx',
    searchContent: '                <button\n                  type="submit"\n                  disabled={!draft.trim() || isTyping}\n                  aria-label="Send message"\n                  className="rounded-xl bg-slate-900 dark:bg-white p-2.5 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow hover:scale-105 active:scale-95"\n                >',
    replacementContent: '                <button\n                  type="submit"\n                  disabled={!draft.trim() || isTyping}\n                  aria-label="Send message"\n                  title="Send message"\n                  className="rounded-xl bg-slate-900 dark:bg-white p-2.5 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow hover:scale-105 active:scale-95"\n                >',
    commitMessage: 'fix: add descriptive tooltip title attribute to chatbot send button'
  },
  {
    id: 13,
    branchName: 'fix/faq-page-category-aria-selected',
    filePath: 'src/Pages/FAQ/FAQPage.js',
    searchContent: '            <div className="flex flex-wrap gap-1.5 justify-center">\n              {["All", "General", "Hackathons", "Account"].map((category) => (\n                <button\n                  key={category}\n                  onClick={() => setSelectedCategory(category)}\n                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${\n                    selectedCategory === category\n                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/10"\n                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/80"\n                  }`}\n                >',
    replacementContent: '            <div className="flex flex-wrap gap-1.5 justify-center">\n              {["All", "General", "Hackathons", "Account"].map((category) => (\n                <button\n                  key={category}\n                  onClick={() => setSelectedCategory(category)}\n                  aria-selected={selectedCategory === category}\n                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${\n                    selectedCategory === category\n                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/10"\n                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/80"\n                  }`}\n                >',
    commitMessage: 'fix: set aria-selected true on active category filtering buttons'
  },
  {
    id: 14,
    branchName: 'fix/collaboration-form-title-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: '              <div className="form-group">\n                <label>Project Title *</label>\n                <input \n                  type="text" \n                  name="title"\n                  value={newRequest.title}\n                  onChange={handleRequestChange}\n                  placeholder="Enter your collaboration project title" \n                  required\n                />\n              </div>',
    replacementContent: '              <div className="form-group">\n                <label htmlFor="collab-title">Project Title *</label>\n                <input \n                  id="collab-title"\n                  type="text" \n                  name="title"\n                  value={newRequest.title}\n                  onChange={handleRequestChange}\n                  placeholder="Enter your collaboration project title" \n                  required\n                />\n              </div>',
    commitMessage: 'fix: link Project Title form label to its input programmatically'
  },
  {
    id: 15,
    branchName: 'fix/collaboration-form-type-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: '              <div className="form-group">\n                <label>Collaboration Type *</label>\n                <select \n                  name="type"\n                  value={newRequest.type}\n                  onChange={handleRequestChange}\n                  required\n                >',
    replacementContent: '              <div className="form-group">\n                <label htmlFor="collab-type">Collaboration Type *</label>\n                <select \n                  id="collab-type"\n                  name="type"\n                  value={newRequest.type}\n                  onChange={handleRequestChange}\n                  required\n                >',
    commitMessage: 'fix: link Collaboration Type form label to its select element'
  },
  {
    id: 16,
    branchName: 'fix/collaboration-form-desc-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: '              <div className="form-group">\n                <label>Description *</label>\n                <textarea \n                  name="description"\n                  value={newRequest.description}\n                  onChange={handleRequestChange}\n                  rows="4" \n                  maxLength={300}\n                  placeholder="Describe partnership goals / Sponsorship details / Collaboration ideas..." \n                  required\n                ></textarea>\n              </div>',
    replacementContent: '              <div className="form-group">\n                <label htmlFor="collab-desc">Description *</label>\n                <textarea \n                  id="collab-desc"\n                  name="description"\n                  value={newRequest.description}\n                  onChange={handleRequestChange}\n                  rows="4" \n                  maxLength={300}\n                  placeholder="Describe partnership goals / Sponsorship details / Collaboration ideas..." \n                  required\n                ></textarea>\n              </div>',
    commitMessage: 'fix: link Description form label to its textarea element'
  },
  {
    id: 17,
    branchName: 'fix/collaboration-form-budget-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: '                <div className="form-group">\n                  <label>Budget Range</label>\n                  <select \n                    name="budget"\n                    value={newRequest.budget}\n                    onChange={handleRequestChange}\n                  >',
    replacementContent: '                <div className="form-group">\n                  <label htmlFor="collab-budget">Budget Range</label>\n                  <select \n                    id="collab-budget"\n                    name="budget"\n                    value={newRequest.budget}\n                    onChange={handleRequestChange}\n                  >',
    commitMessage: 'fix: link Budget Range form label to its select dropdown element'
  },
  {
    id: 18,
    branchName: 'fix/collaboration-form-deadline-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: '                <div className="form-group">\n                  <label>Deadline</label>\n                  <input \n                    type="date" \n                    name="deadline"\n                    value={newRequest.deadline}\n                    onChange={handleRequestChange}\n                  />\n                </div>',
    replacementContent: '                <div className="form-group">\n                  <label htmlFor="collab-deadline">Deadline</label>\n                  <input \n                    id="collab-deadline"\n                    type="date" \n                    name="deadline"\n                    value={newRequest.deadline}\n                    onChange={handleRequestChange}\n                  />\n                </div>',
    commitMessage: 'fix: link Deadline form label to its input date picker element'
  },
  {
    id: 19,
    branchName: 'fix/collaboration-form-skills-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: '              <div className="form-group">\n                <label>Required Skills</label>\n                <input \n                  type="text" \n                  name="skills"\n                  value={newRequest.skills}\n                  onChange={handleRequestChange}\n                  placeholder="e.g., Event Management, Marketing, Design" \n                />\n              </div>',
    replacementContent: '              <div className="form-group">\n                <label htmlFor="collab-skills">Required Skills</label>\n                <input \n                  id="collab-skills"\n                  type="text" \n                  name="skills"\n                  value={newRequest.skills}\n                  onChange={handleRequestChange}\n                  placeholder="e.g., Event Management, Marketing, Design" \n                />\n              </div>',
    commitMessage: 'fix: link Required Skills form label to its input element'
  },
  {
    id: 20,
    branchName: 'fix/contributors-search-input-aria',
    filePath: 'src/components/Contributors.js',
    searchContent: '        <div className="flex justify-center mb-8">\n          <input\n            type="text"\n            placeholder="Search contributors by name, username, role, location, or company..."\n            value={searchTerm}\n            onChange={(e) => setSearchTerm(e.target.value)}\n            className="px-4 py-2 rounded-lg w-full max-w-2xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-white bg-white dark:bg-gray-800"\n          />\n        </div>',
    replacementContent: '        <div className="flex justify-center mb-8">\n          <input\n            type="text"\n            placeholder="Search contributors by name, username, role, location, or company..."\n            value={searchTerm}\n            onChange={(e) => setSearchTerm(e.target.value)}\n            aria-label="Search contributors"\n            className="px-4 py-2 rounded-lg w-full max-w-2xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-white bg-white dark:bg-gray-800"\n          />\n        </div>',
    commitMessage: 'fix: add descriptive aria-label to contributors search input'
  }
];

// Wrap the execution block in an async function context
async function startAutomationEngine() {
  console.log('🤖 Starting Asynchronous Issue Automation Engine...');
  console.log(`Repository Root: ${REPO_ROOT}\n`);

  let successCount = 0;
  const results = [];

  for (const issue of issues) {
    const fullFilePath = path.join(REPO_ROOT, issue.filePath);
    console.log(`\n==================================================`);
    console.log(`📌 Processing Issue #${issue.id}: ${issue.branchName}`);
    console.log(`📄 File: ${issue.filePath}`);

    try {
      // 1. Clean out existing tracking branches using async process control safely
      const isSafeToProceed = await checkAndSafelyDeleteBranchAsync(issue.branchName);
      if (!isSafeToProceed) {
        throw new Error(`Skipped due to unmerged custom modifications tracking on existing local branch.`);
      }

      // 2. Isolate master branch state cleanly 
      console.log('🔄 Safely resetting environment state to master...');
      await runCmdAsync('git checkout -f master');
      await runCmdAsync('git reset --hard HEAD');

      // 3. FIX: Mount file explicitly from storage disk so 'content' is defined
      if (!fs.existsSync(fullFilePath)) {
        throw new Error(`Target file path does not exist on disk: ${issue.filePath}`);
      }
      const content = fs.readFileSync(fullFilePath, 'utf8');

      // 4. Verify match signatures safely
      const normalizedContent = content.replace(/\r\n/g, '\n');
      const normalizedSearch = issue.searchContent.replace(/\r\n/g, '\n');

      if (!normalizedContent.includes(normalizedSearch)) {
        throw new Error(`Target search content not found in file! Check syntax or line endings.`);
      }

      // 5. Create branch cleanly
      await runCmdAsync(`git checkout -b ${issue.branchName}`);
      console.log(`✅ Checked out isolated branch: ${issue.branchName}`);

      // 6. Perform string replacement
      let newContent = content.replace(issue.searchContent, issue.replacementContent);
      if (newContent === content) {
        newContent = normalizedContent.replace(normalizedSearch, issue.replacementContent.replace(/\r\n/g, '\n'));
      }

      fs.writeFileSync(fullFilePath, newContent, 'utf8');
      console.log(`✅ Code changes successfully mounted to file.`);

      // 7. Stage and commit changes (streams outputs natively, respects GPG passphrases)
      await runCmdAsync(`git add "${issue.filePath}"`);
      await runCmdAsync(`git commit -m "${issue.commitMessage}"`);
      console.log(`✅ Committed successfully: "${issue.commitMessage}"`);

      successCount++;
      results.push({ id: issue.id, branch: issue.branchName, status: 'Success' });
    } catch (error) {
      console.error(`❌ Failed on Issue #${issue.id}: ${error.message}`);
      results.push({ id: issue.id, branch: issue.branchName, status: `Failed: ${error.message}` });
    }
  }

  // Final Cleanup phase
  console.log(`\n==================================================`);
  console.log('🤖 Returning safely back to master branch...');
  try {
    await runCmdAsync('git checkout master');
    console.log('✅ Back on master.');
  } catch (err) {
    console.error('❌ Failed to return to master:', err.message);
  }

  // Print execution metric dashboard
  console.log(`\n==================================================`);
  console.log(`📊 AUTOMATION SUMMARY: ${successCount} / ${issues.length} SUCCESSFUL`);
  console.table(results);
  console.log(`==================================================`);
}

// Kickstart the execution engine
startAutomationEngine();