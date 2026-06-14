// scripts/push-branches.js
//
// Programmatically pushes all 20 automated Git branches to the origin repository.
//
// Usage: node scripts/push-branches.js

const { execSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

const branches = [
  'fix/alert-icon-aria-hidden',
  'fix/contributor-guide-font-typo',
  'fix/loading-aria-label',
  'fix/back-to-top-aria-hidden',
  'fix/chatbot-header-aria-hidden',
  'fix/notfound-page-glow-accessibility',
  'fix/contactus-quick-response-icon-aria',
  'fix/faq-page-search-aria-label',
  'fix/faq-cta-buoy-icon-aria',
  'fix/theme-toggle-switch-role',
  'fix/contributors-badge-alt-text',
  'fix/chatbot-submit-button-title',
  'fix/faq-page-category-aria-selected',
  'fix/collaboration-form-title-accessibility',
  'fix/collaboration-form-type-accessibility',
  'fix/collaboration-form-desc-accessibility',
  'fix/collaboration-form-budget-accessibility',
  'fix/collaboration-form-deadline-accessibility',
  'fix/collaboration-form-skills-accessibility',
  'fix/contributors-search-input-aria'
];

console.log('🚀 Pushing all 20 branches to origin repository...');

for (const branch of branches) {
  try {
    console.log(`📌 Pushing branch: ${branch}`);
    execSync(`git push origin ${branch}`, { cwd: REPO_ROOT, stdio: 'inherit' });
    console.log(`✅ Successfully pushed ${branch}\n`);
  } catch (error) {
    console.error(`❌ Failed to push ${branch}: ${error.message}\n`);
  }
}

console.log('🎉 Finished pushing all branches!');
