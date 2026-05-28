# Eventra - Automated Issues & Pull Requests Summary

This document lists all 20 accessibility and code quality issues identified in the Eventra codebase, along with their resolution details, automated branch names, and direct links to open the Pull Requests on GitHub.

---

## Direct Pull Request Links

Since all 20 branches have been successfully pushed to your fork `omkhandare55/Eventra`, you can open each Pull Request on GitHub with a single click:

| # | Issue / PR Title | Automated Branch | Direct GitHub Link to Open Pull Request |
|---|------------------|------------------|-----------------------------------------|
| 1 | `fix: add aria-hidden true to decorative icon inside Alert component` | `fix/alert-icon-aria-hidden` | [Open PR #1](https://github.com/omkhandare55/Eventra/pull/new/fix/alert-icon-aria-hidden) |
| 2 | `fix: correct sans-serif typo in contributor guide header style` | `fix/contributor-guide-font-typo` | [Open PR #2](https://github.com/omkhandare55/Eventra/pull/new/fix/contributor-guide-font-typo) |
| 3 | `fix: add informative state-based aria-label to Loading component` | `fix/loading-aria-label` | [Open PR #3](https://github.com/omkhandare55/Eventra/pull/new/fix/loading-aria-label) |
| 4 | `fix: set aria-hidden true on back to top button decorative icon` | `fix/back-to-top-aria-hidden` | [Open PR #4](https://github.com/omkhandare55/Eventra/pull/new/fix/back-to-top-aria-hidden) |
| 5 | `fix: add aria-hidden to decorative header sparkles inside Chatbot` | `fix/chatbot-header-aria-hidden` | [Open PR #5](https://github.com/omkhandare55/Eventra/pull/new/fix/chatbot-header-aria-hidden) |
| 6 | `fix: hide duplicate decorative background 404 glow text from screen readers` | `fix/notfound-page-glow-accessibility` | [Open PR #6](https://github.com/omkhandare55/Eventra/pull/new/fix/notfound-page-glow-accessibility) |
| 7 | `fix: ensure decorative contact icons have aria-hidden set to true` | `fix/contactus-quick-response-icon-aria` | [Open PR #7](https://github.com/omkhandare55/Eventra/pull/new/fix/contactus-quick-response-icon-aria) |
| 8 | `fix: add explicit search descriptive aria-label to FAQ input` | `fix/faq-page-search-aria-label` | [Open PR #8](https://github.com/omkhandare55/Eventra/pull/new/fix/faq-page-search-aria-label) |
| 9 | `fix: add aria-hidden to decorative support icons in FAQ CTA` | `fix/faq-cta-buoy-icon-aria` | [Open PR #9](https://github.com/omkhandare55/Eventra/pull/new/fix/faq-cta-buoy-icon-aria) |
| 10 | `fix: apply role switch and aria-checked attribute to theme toggle` | `fix/theme-toggle-switch-role` | [Open PR #10](https://github.com/omkhandare55/Eventra/pull/new/fix/theme-toggle-switch-role) |
| 11 | `fix: improve screen reader alt text for contributor avatar images` | `fix/contributors-badge-alt-text` | [Open PR #11](https://github.com/omkhandare55/Eventra/pull/new/fix/contributors-badge-alt-text) |
| 12 | `fix: add descriptive tooltip title attribute to chatbot send button` | `fix/chatbot-submit-button-title` | [Open PR #12](https://github.com/omkhandare55/Eventra/pull/new/fix/chatbot-submit-button-title) |
| 13 | `fix: set aria-selected true on active category filtering buttons` | `fix/faq-page-category-aria-selected` | [Open PR #13](https://github.com/omkhandare55/Eventra/pull/new/fix/faq-page-category-aria-selected) |
| 14 | `fix: link Project Title form label to its input programmatically` | `fix/collaboration-form-title-accessibility` | [Open PR #14](https://github.com/omkhandare55/Eventra/pull/new/fix/collaboration-form-title-accessibility) |
| 15 | `fix: link Collaboration Type form label to its select element` | `fix/collaboration-form-type-accessibility` | [Open PR #15](https://github.com/omkhandare55/Eventra/pull/new/fix/collaboration-form-type-accessibility) |
| 16 | `fix: link Description form label to its textarea element` | `fix/collaboration-form-desc-accessibility` | [Open PR #16](https://github.com/omkhandare55/Eventra/pull/new/fix/collaboration-form-desc-accessibility) |
| 17 | `fix: link Budget Range form label to its select dropdown element` | `fix/collaboration-form-budget-accessibility` | [Open PR #17](https://github.com/omkhandare55/Eventra/pull/new/fix/collaboration-form-budget-accessibility) |
| 18 | `fix: link Deadline form label to its input date picker element` | `fix/collaboration-form-deadline-accessibility` | [Open PR #18](https://github.com/omkhandare55/Eventra/pull/new/fix/collaboration-form-deadline-accessibility) |
| 19 | `fix: link Required Skills form label to its input element` | `fix/collaboration-form-skills-accessibility` | [Open PR #19](https://github.com/omkhandare55/Eventra/pull/new/fix/collaboration-form-skills-accessibility) |
| 20 | `fix: add descriptive aria-label to contributors search input` | `fix/contributors-search-input-aria` | [Open PR #20](https://github.com/omkhandare55/Eventra/pull/new/fix/contributors-search-input-aria) |

---

## Details of Pushed Issues & Branches

### 1. `fix/alert-icon-aria-hidden`
- **File**: `src/components/common/Alert.jsx`
- **Issue**: Alert icons are decorative but lack `aria-hidden="true"`, causing screen readers to announce them unnecessarily.
- **Fix**: Added `aria-hidden="true"` to `<Icon />` inside the Alert component.

### 2. `fix/contributor-guide-font-typo`
- **File**: `src/Pages/Leaderboard/ContributorGuide.js`
- **Issue**: Hardcoded inline CSS style has a typo: `sans-seri` instead of `sans-serif` on the page heading.
- **Fix**: Corrected the typo to standard `sans-serif` on line 604.

### 3. `fix/loading-aria-label`
- **File**: `src/components/common/Loading.js`
- **Issue**: The theme-aware Loading component has `role="status"` but lacks an explicit screen reader `aria-label`.
- **Fix**: Added `aria-label={text || "Loading..."}` to the loading spinner element.

### 4. `fix/back-to-top-aria-hidden`
- **File**: `src/components/common/BackToTopButton.js`
- **Issue**: Arrow icon inside the back-to-top button lacks `aria-hidden="true"`.
- **Fix**: Added `aria-hidden="true"` to the icon element.

### 5. `fix/chatbot-header-aria-hidden`
- **File**: `src/components/Chatbot.jsx`
- **Issue**: Sparkles and header icons inside the chatbot popup lack `aria-hidden="true"`.
- **Fix**: Added `aria-hidden="true"` to all decorative headers sparkles.

### 6. `fix/notfound-page-glow-accessibility`
- **File**: `src/components/NotFound.js`
- **Issue**: The double "404" background glow elements are read multiple times by screen readers.
- **Fix**: Added `aria-hidden="true"` to the decorative backdrop glow elements.

### 7. `fix/contactus-quick-response-icon-aria`
- **File**: `src/Pages/Contact/ContactUs.js`
- **Issue**: Contact us quick response icons (e.g. `FiMessageSquare`, `FiStar`) are decorative but lack `aria-hidden="true"`.
- **Fix**: Added `aria-hidden="true"` to these icons in the sidebar.

### 8. `fix/faq-page-search-aria-label`
- **File**: `src/Pages/FAQ/FAQPage.js`
- **Issue**: Search input in FAQPage does not have a linked label or descriptive `aria-label`.
- **Fix**: Added `aria-label="Search FAQs"` to the search input element.

### 9. `fix/faq-cta-buoy-icon-aria`
- **File**: `src/Pages/FAQ/FaqCTA.jsx`
- **Issue**: CTA card icons (`LifeBuoy`, `MessageCircle`, `HelpCircle`) lack `aria-hidden="true"`.
- **Fix**: Added `aria-hidden="true"` to the decorative cards icons.

### 10. `fix/theme-toggle-switch-role`
- **File**: `src/components/common/ThemeToggleButton.js`
- **Issue**: Dark mode toggle button acts as a switch control but lacks standard `role="switch"` and state description.
- **Fix**: Added `role="switch"` and `aria-checked={darkMode}` to the toggle button.

### 11. `fix/contributors-badge-alt-text`
- **File**: `src/components/Contributors.js`
- **Issue**: GitHub avatar image elements in the contributors list use generic `alt` text.
- **Fix**: Enhanced the `alt` attribute to explicitly say `${c.login}'s GitHub avatar`.

### 12. `fix/chatbot-submit-button-title`
- **File**: `src/components/Chatbot.jsx`
- **Issue**: Chatbot submit button has `aria-label` but lacks `title="Send message"` tooltip.
- **Fix**: Added `title="Send message"` to the Send button.

### 13. `fix/faq-page-category-aria-selected`
- **File**: `src/Pages/FAQ/FAQPage.js`
- **Issue**: Category filtering buttons do not announce their active selected state to screen readers.
- **Fix**: Added `aria-selected={selectedCategory === category}` to all category buttons.

### 14. `fix/collaboration-form-title-accessibility`
- **File**: `src/components/CollaborationHub.js`
- **Issue**: Form label and input for Project Title are programmatically unassociated.
- **Fix**: Linked them using `id="collab-title"` and `htmlFor="collab-title"`.

### 15. `fix/collaboration-form-type-accessibility`
- **File**: `src/components/CollaborationHub.js`
- **Issue**: Form label and select dropdown for Collaboration Type are programmatically unassociated.
- **Fix**: Linked them using `id="collab-type"` and `htmlFor="collab-type"`.

### 16. `fix/collaboration-form-desc-accessibility`
- **File**: `src/components/CollaborationHub.js`
- **Issue**: Form label and textarea for Description are programmatically unassociated.
- **Fix**: Linked them using `id="collab-desc"` and `htmlFor="collab-desc"`.

### 17. `fix/collaboration-form-budget-accessibility`
- **File**: `src/components/CollaborationHub.js`
- **Issue**: Form label and select dropdown for Budget Range are programmatically unassociated.
- **Fix**: Linked them using `id="collab-budget"` and `htmlFor="collab-budget"`.

### 18. `fix/collaboration-form-deadline-accessibility`
- **File**: `src/components/CollaborationHub.js`
- **Issue**: Form label and input for Deadline are programmatically unassociated.
- **Fix**: Linked them using `id="collab-deadline"` and `htmlFor="collab-deadline"`.

### 19. `fix/collaboration-form-skills-accessibility`
- **File**: `src/components/CollaborationHub.js`
- **Issue**: Form label and input for Required Skills are programmatically unassociated.
- **Fix**: Linked them using `id="collab-skills"` and `htmlFor="collab-skills"`.

### 20. `fix/contributors-search-input-aria`
- **File**: `src/components/Contributors.js`
- **Issue**: Search input lacks an explicit `aria-label` or description.
- **Fix**: Added `aria-label="Search contributors"` to the search input.
