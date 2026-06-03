## Summary
The codebase has a fractured UI component landscape with no unified design system. This causes inconsistent UX, duplicated code, and high maintenance burden.

## Evidence
**Three separate button implementations:**
- `src/components/Button.jsx` — uses variant/size props with CSS modules
- `src/components/ui/LoadingButton.jsx` — uses isLoading/loadingText with hardcoded Tailwind
- `src/components/common/StatusBadge.jsx` — button-adjacent component

**Three conflicting styling approaches:**
1. Global CSS (`src/App.css` has 1382 lines with `.btn-primary`, `.btn-secondary`)
2. CSS Modules (`src/components/Button.css`)
3. Tailwind utility classes (scattered inline)
4. Raw inline style objects (`SectionErrorBoundary.jsx` lines 86-156)

**Triplicated scroll-to-top components:**
- `src/components/ScrollToTopButton.jsx`
- `src/components/common/BackToTop.jsx`
- `src/components/common/BackToTopButton.jsx`

All three exist, and `App.jsx` renders both `<ScrollToTopButton />` (line 256) and `<BackToTop />` (line 261) simultaneously.

**Multiple modal implementations:**
- `src/components/common/Modal.jsx` (116 lines)
- `src/components/common/ConfirmationModal.js`
- `src/components/common/OfflineConflictModal.jsx`

## Suggested Fix (1500-2500+ lines)
Create a centralized `src/design-system/` directory with:
- Unified `Button` component replacing Button.jsx + LoadingButton.jsx + all button classes from App.css
- Single `Modal` family component replacing all modal variants
- Single `ScrollToTop` component replacing three duplicates
- Polymorphic `as` prop pattern for interactive elements
- Decision and migration to a single CSS strategy (Tailwind or CSS Modules)
- Barrel file exports and Storybook stories for all components
- Visual regression test suite
