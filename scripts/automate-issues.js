// scripts/automate-issues.js
//
// Programmatically automates the creation of 20 Git branches and commits,
// each fixing a specific accessibility or quality issue in the Eventra codebase.
//
// Usage: node scripts/automate-issues.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the absolute root of the repository
const REPO_ROOT = path.resolve(__dirname, '..');

// Defensive helper to clear local branches safely without destroying custom progress
function checkAndSafelyDeleteBranch(branchName) {
  try {
    // Check if the branch exists locally before doing anything
    execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { cwd: REPO_ROOT, stdio: 'ignore' });
  } catch (error) {
    // Branch does not exist locally; completely safe to skip deletion phase
    return true;
  }

  try {
    console.log(`⚠️  Existing local branch found for '${branchName}'. Attempting safe removal...`);
    // Lowercase -d checks if the branch has been fully merged into upstream/HEAD
    execSync(`git branch -d ${branchName}`, { cwd: REPO_ROOT, stdio: 'ignore' });
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

// Helper to run shell commands synchronously
function runCmd(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`❌ Failed executing: ${cmd}`);
    console.error(error.stderr || error.message);
    throw error;
  }
}

// 20 Issues to automate
const issues = [
  {
    id: 1,
    branchName: 'fix/alert-icon-aria-hidden',
    filePath: 'src/components/common/Alert.jsx',
    searchContent: `      <div className="flex-shrink-0">
        <Icon className={\`h-5 w-5 \${config.iconColor}\`} />
      </div>`,
    replacementContent: `      <div className="flex-shrink-0">
        <Icon className={\`h-5 w-5 \${config.iconColor}\`} aria-hidden="true" />
      </div>`,
    commitMessage: 'fix: add aria-hidden true to decorative icon inside Alert component'
  },
  {
    id: 2,
    branchName: 'fix/contributor-guide-font-typo',
    filePath: 'src/Pages/Leaderboard/ContributorGuide.js',
    searchContent: `          style={{fontFamily: '"Big Shoulders Display", sans-seri'}}`,
    replacementContent: `          style={{fontFamily: '"Big Shoulders Display", sans-serif'}}`,
    commitMessage: 'fix: correct sans-serif typo in contributor guide header style'
  },
  {
    id: 3,
    branchName: 'fix/loading-aria-label',
    filePath: 'src/components/common/Loading.js',
    searchContent: `    <div className="flex flex-col items-center justify-center gap-4 py-8" role="status" aria-live="polite">`,
    replacementContent: `    <div className="flex flex-col items-center justify-center gap-4 py-8" role="status" aria-live="polite" aria-label={text || "Loading..."}>`,
    commitMessage: 'fix: add informative state-based aria-label to Loading component'
  },
  {
    id: 4,
    branchName: 'fix/back-to-top-aria-hidden',
    filePath: 'src/components/common/BackToTopButton.js',
    searchContent: `          className={\`fixed \${positionClass} z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:bg-zinc-800 border-2 border-white dark:border-gray-800 transition-colors \${className}\`}
        >
          <FiArrowUp className="w-5 h-5" />`,
    replacementContent: `          className={\`fixed \${positionClass} z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:bg-zinc-800 border-2 border-white dark:border-gray-800 transition-colors \${className}\`}
        >
          <FiArrowUp className="w-5 h-5" aria-hidden="true" />`,
    commitMessage: 'fix: set aria-hidden true on back to top button decorative icon'
  },
  {
    id: 5,
    branchName: 'fix/chatbot-header-aria-hidden',
    filePath: 'src/components/Chatbot.jsx',
    searchContent: `              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>`,
    replacementContent: `              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                </div>`,
    commitMessage: 'fix: add aria-hidden to decorative header sparkles inside Chatbot'
  },
  {
    id: 6,
    branchName: 'fix/notfound-page-glow-accessibility',
    filePath: 'src/components/NotFound.js',
    searchContent: `            <span className="absolute top-0 left-0 text-indigo-600/50 dark:text-blue-400 opacity-70 blur-sm">
              404
            </span>
            <span className="absolute top-0 left-0 text-purple-600/50 dark:text-indigo-400 opacity-70 blur-sm">
              404
            </span>`,
    replacementContent: `            <span className="absolute top-0 left-0 text-indigo-600/50 dark:text-blue-400 opacity-70 blur-sm" aria-hidden="true">
              404
            </span>
            <span className="absolute top-0 left-0 text-purple-600/50 dark:text-indigo-400 opacity-70 blur-sm" aria-hidden="true">
              404
            </span>`,
    commitMessage: 'fix: hide duplicate decorative background 404 glow text from screen readers'
  },
  {
    id: 7,
    branchName: 'fix/contactus-quick-response-icon-aria',
    filePath: 'src/Pages/Contact/ContactUs.js',
    searchContent: `                    <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">
                      <FiMessageSquare className="w-7 h-7 text-white" />
                    </div>`,
    replacementContent: `                    <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">
                      <FiMessageSquare className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>`,
    commitMessage: 'fix: ensure decorative contact icons have aria-hidden set to true'
  },
  {
    id: 8,
    branchName: 'fix/faq-page-search-aria-label',
    filePath: 'src/Pages/FAQ/FAQPage.js',
    searchContent: `              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search hackathons, bookmarks, accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />`,
    replacementContent: `              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search hackathons, bookmarks, accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search FAQs"
                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />`,
    commitMessage: 'fix: add explicit search descriptive aria-label to FAQ input'
  },
  {
    id: 9,
    branchName: 'fix/faq-cta-buoy-icon-aria',
    filePath: 'src/Pages/FAQ/FaqCTA.jsx',
    searchContent: `      title: "Browse FAQs",
      description:
        "Quickly find answers to common questions about our platform.",
      to: "/faq",
      icon: <LifeBuoy className="w-10 h-10 text-purple-400" />,`,
    replacementContent: `      title: "Browse FAQs",
      description:
        "Quickly find answers to common questions about our platform.",
      to: "/faq",
      icon: <LifeBuoy className="w-10 h-10 text-purple-400" aria-hidden="true" />,`,
    commitMessage: 'fix: add aria-hidden to decorative support icons in FAQ CTA'
  },
  {
    id: 10,
    branchName: 'fix/theme-toggle-switch-role',
    filePath: 'src/components/common/ThemeToggleButton.js',
    searchContent: `  return (
    <button
      className="flex items-center cursor-pointer select-none"
      onClick={() => setDarkMode((prev) => !prev)}
      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >`,
    replacementContent: `  return (
    <button
      className="flex items-center cursor-pointer select-none"
      onClick={() => setDarkMode((prev) => !prev)}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >`,
    commitMessage: 'fix: apply role switch and aria-checked attribute to theme toggle'
  },
  {
    id: 11,
    branchName: 'fix/contributors-badge-alt-text',
    filePath: 'src/components/Contributors.js',
    searchContent: `                    <img
                      loading="lazy"
                      decoding="async"
                      width="80"
                      height="80"
                      src={c.avatar_url}
                      alt={c.login}
                      className="w-20 h-20 rounded-full border-4 border-black shadow-xl"
                    />`,
    replacementContent: `                    <img
                      loading="lazy"
                      decoding="async"
                      width="80"
                      height="80"
                      src={c.avatar_url}
                      alt={\`\${c.login}'s GitHub avatar\`}
                      className="w-20 h-20 rounded-full border-4 border-black shadow-xl"
                    />`,
    commitMessage: 'fix: improve screen reader alt text for contributor avatar images'
  },
  {
    id: 12,
    branchName: 'fix/chatbot-submit-button-title',
    filePath: 'src/components/Chatbot.jsx',
    searchContent: `                <button
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  aria-label="Send message"
                  className="rounded-xl bg-slate-900 dark:bg-white p-2.5 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow hover:scale-105 active:scale-95"
                >`,
    replacementContent: `                <button
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  aria-label="Send message"
                  title="Send message"
                  className="rounded-xl bg-slate-900 dark:bg-white p-2.5 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow hover:scale-105 active:scale-95"
                >`,
    commitMessage: 'fix: add descriptive tooltip title attribute to chatbot send button'
  },
  {
    id: 13,
    branchName: 'fix/faq-page-category-aria-selected',
    filePath: 'src/Pages/FAQ/FAQPage.js',
    searchContent: `            <div className="flex flex-wrap gap-1.5 justify-center">
              {["All", "General", "Hackathons", "Account"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={\`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 \${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/10"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/80"
                  }\`}
                >`,
    replacementContent: `            <div className="flex flex-wrap gap-1.5 justify-center">
              {["All", "General", "Hackathons", "Account"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  aria-selected={selectedCategory === category}
                  className={\`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 \${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/10"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/80"
                  }\`}
                >`,
    commitMessage: 'fix: set aria-selected true on active category filtering buttons'
  },
  {
    id: 14,
    branchName: 'fix/collaboration-form-title-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: `              <div className="form-group">
                <label>Project Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={newRequest.title}
                  onChange={handleRequestChange}
                  placeholder="Enter your collaboration project title" 
                  required
                />
              </div>`,
    replacementContent: `              <div className="form-group">
                <label htmlFor="collab-title">Project Title *</label>
                <input 
                  id="collab-title"
                  type="text" 
                  name="title"
                  value={newRequest.title}
                  onChange={handleRequestChange}
                  placeholder="Enter your collaboration project title" 
                  required
                />
              </div>`,
    commitMessage: 'fix: link Project Title form label to its input programmatically'
  },
  {
    id: 15,
    branchName: 'fix/collaboration-form-type-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: `              <div className="form-group">
                <label>Collaboration Type *</label>
                <select 
                  name="type"
                  value={newRequest.type}
                  onChange={handleRequestChange}
                  required
                >`,
    replacementContent: `              <div className="form-group">
                <label htmlFor="collab-type">Collaboration Type *</label>
                <select 
                  id="collab-type"
                  name="type"
                  value={newRequest.type}
                  onChange={handleRequestChange}
                  required
                >`,
    commitMessage: 'fix: link Collaboration Type form label to its select element'
  },
  {
    id: 16,
    branchName: 'fix/collaboration-form-desc-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: `              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  name="description"
                  value={newRequest.description}
                  onChange={handleRequestChange}
                  rows="4" 
                  maxLength={300}
                  placeholder="Describe partnership goals / Sponsorship details / Collaboration ideas..."
                  required
                ></textarea>
              </div>`,
    replacementContent: `              <div className="form-group">
                <label htmlFor="collab-desc">Description *</label>
                <textarea 
                  id="collab-desc"
                  name="description"
                  value={newRequest.description}
                  onChange={handleRequestChange}
                  rows="4" 
                  maxLength={300}
                  placeholder="Describe partnership goals / Sponsorship details / Collaboration ideas..."
                  required
                ></textarea>
              </div>`,
    commitMessage: 'fix: link Description form label to its textarea element'
  },
  {
    id: 17,
    branchName: 'fix/collaboration-form-budget-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: `                <div className="form-group">
                  <label>Budget Range</label>
                  <select 
                    name="budget"
                    value={newRequest.budget}
                    onChange={handleRequestChange}
                  >`,
    replacementContent: `                <div className="form-group">
                  <label htmlFor="collab-budget">Budget Range</label>
                  <select 
                    id="collab-budget"
                    name="budget"
                    value={newRequest.budget}
                    onChange={handleRequestChange}
                  >`,
    commitMessage: 'fix: link Budget Range form label to its select dropdown element'
  },
  {
    id: 18,
    branchName: 'fix/collaboration-form-deadline-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: `                <div className="form-group">
                  <label>Deadline</label>
                  <input 
                    type="date" 
                    name="deadline"
                    value={newRequest.deadline}
                    onChange={handleRequestChange}
                  />
                </div>`,
    replacementContent: `                <div className="form-group">
                  <label htmlFor="collab-deadline">Deadline</label>
                  <input 
                    id="collab-deadline"
                    type="date" 
                    name="deadline"
                    value={newRequest.deadline}
                    onChange={handleRequestChange}
                  />
                </div>`,
    commitMessage: 'fix: link Deadline form label to its input date picker element'
  },
  {
    id: 19,
    branchName: 'fix/collaboration-form-skills-accessibility',
    filePath: 'src/components/CollaborationHub.js',
    searchContent: `              <div className="form-group">
                <label>Required Skills</label>
                <input 
                  type="text" 
                  name="skills"
                  value={newRequest.skills}
                  onChange={handleRequestChange}
                  placeholder="e.g., Event Management, Marketing, Design" 
                />
              </div>`,
    replacementContent: `              <div className="form-group">
                <label htmlFor="collab-skills">Required Skills</label>
                <input 
                  id="collab-skills"
                  type="text" 
                  name="skills"
                  value={newRequest.skills}
                  onChange={handleRequestChange}
                  placeholder="e.g., Event Management, Marketing, Design" 
                />
              </div>`,
    commitMessage: 'fix: link Required Skills form label to its input element'
  },
  {
    id: 20,
    branchName: 'fix/contributors-search-input-aria',
    filePath: 'src/components/Contributors.js',
    searchContent: `        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search contributors by name, username, role, location, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg w-full max-w-2xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
        </div>`,
    replacementContent: `        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search contributors by name, username, role, location, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search contributors"
            className="px-4 py-2 rounded-lg w-full max-w-2xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
        </div>`,
    commitMessage: 'fix: add descriptive aria-label to contributors search input'
  }
];

// Run automation in sequence
console.log('🤖 Starting Issue Automation Engine...');
console.log(`Repository Root: ${REPO_ROOT}\n`);

let successCount = 0;
const results = [];

for (const issue of issues) {
  const fullFilePath = path.join(REPO_ROOT, issue.filePath);
  console.log(`\n==================================================`);
  console.log(`📌 Processing Issue #${issue.id}: ${issue.branchName}`);
  console.log(`📄 File: ${issue.filePath}`);

  try {
    // 1. Safety Check: Verify existing branch state cleanly BEFORE running destructive resets
    const isSafeToProceed = checkAndSafelyDeleteBranch(issue.branchName);
    if (!isSafeToProceed) {
      throw new Error(`Skipped due to unmerged custom modifications tracking on existing local branch.`);
    }

    // 2. State Isolation: Return safely to master branch and clear uncommitted artifacts FIRST
    try {
      console.log('🔄 Safely resetting environment state...');
      runCmd('git checkout -f master'); 
      runCmd('git reset --hard HEAD');   
    } catch (stateError) {
      throw new Error(`State reset failed. Cannot safely return to master branch: ${stateError.message}`);
    }

    // 3. Verify exact matching of the search string (handling carriage return inconsistencies)
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedSearch = issue.searchContent.replace(/\r\n/g, '\n');

    if (!normalizedContent.includes(normalizedSearch)) {
      throw new Error(`Target search content not found in file! Check syntax or line endings.`);
    }

    // 4. Return to master and make sure clean
    runCmd('git checkout master');

    // 5. Delete branch if it already exists to avoid conflicts
    try {
      runCmd(`git branch -D ${issue.branchName}`);
    } catch (e) {
      // Ignore if branch doesn't exist
    }

    // 6. Create and checkout the branch
    runCmd(`git checkout -b ${issue.branchName}`);
    console.log(`✅ Checked out new branch: ${issue.branchName}`);

    // 7. Perform the replacement
    // Simple string replace on normalized/original to ensure stability
    let newContent = content.replace(issue.searchContent, issue.replacementContent);
    if (newContent === content) {
      // Try replacing normalized version
      newContent = normalizedContent.replace(normalizedSearch, issue.replacementContent.replace(/\r\n/g, '\n'));
    }

    fs.writeFileSync(fullFilePath, newContent, 'utf8');
    console.log(`✅ Code change successfully applied to file.`);

    // 8. Stage, commit
    runCmd(`git add "${issue.filePath}"`);
    runCmd(`git commit -m "${issue.commitMessage}"`);
    console.log(`✅ Committed successfully with message: "${issue.commitMessage}"`);

    successCount++;
    results.push({ id: issue.id, branch: issue.branchName, status: 'Success' });
  } catch (error) {
    console.error(`❌ Failed on Issue #${issue.id}: ${error.message}`);
    results.push({ id: issue.id, branch: issue.branchName, status: `Failed: ${error.message}` });
  }
}

// Checkout back to master at the end
console.log(`\n==================================================`);
console.log('🤖 Returning to master branch...');
try {
  runCmd('git checkout master');
  console.log('✅ Back on master.');
} catch (err) {
  console.error('❌ Failed to return to master:', err.message);
}

// Print results summary
console.log(`\n==================================================`);
console.log(`📊 AUTOMATION SUMMARY: ${successCount} / ${issues.length} SUCCESSFUL`);
console.table(results);
console.log(`==================================================`);
