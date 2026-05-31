# Issue #012: 260-line auto-generated compliance comment block in BackToTopButton

**Tags:** `refactor`, `maintainability`, `beginner`  
**Category:** Quality Exceptional  
**Files:** `src/components/common/BackToTopButton.js`

---

## Description

The `BackToTopButton.js` file contains a 260-line comment block (lines 77-336) consisting entirely of auto-generated, repetitive compliance boilerplate. The file is 336 lines total, meaning **~77% of the file is useless comments**.

### The Problem

The comment block contains:
- Generic accessibility platitudes (lines 77-118): General statements like "Section 1: ARIA Landmarks & Accessible Names" with obvious advice like "Icon-only buttons must include aria-label" that is not specific to this component.
- **210 identical entries** (lines 119-329): "Metric #001: Verification rule check for continuous accessibility integration." through "Metric #210: Verification rule check for continuous accessibility integration."
- Auto-generated footer (lines 330-336): "Auto-generated check rule 258: Continuous integration validation."

### Impact

- **File bloat**: 260 lines of dead content increase file size by ~75%
- **Maintenance burden**: Developers must scroll past 260 lines to find real code
- **Misleading intent**: The comments imply extensive WCAG testing was done, but they're auto-generated filler
- **Code review noise**: Any PR that touches this file has to scroll past 260 lines of noise
- **False sense of compliance**: These auto-generated "metrics" don't represent actual accessibility testing

### Current State

```
src/components/common/BackToTopButton.js
├── Lines 1-75: Actual component code (75 lines)
└── Lines 77-336: Auto-generated comment block (260 lines, 0 informational value)
```

## Proposed Fix

**Option A (Recommended)**: Remove the entire comment block (lines 77-336). The component is well-documented by its own code — the function name, JSDoc, and prop types are self-documenting.

**Option B**: Keep only the first section as a concise JSDoc comment if any documentation is desired:

```javascript
/**
 * Floating "Back to Top" button.
 * Appears after the user scrolls past `threshold` pixels and smoothly
 * scrolls the page back to the top on click.
 *
 * WCAG Notes:
 * - Uses `aria-label` for screen readers (no visible text label)
 * - Icon uses `aria-hidden="true"` (decorative)
 * - Keyboard accessible via native <button> element
 */
```

## Acceptance Criteria

- [ ] All 260 lines of compliance boilerplate (lines 77-336) are removed
- [ ] File size reduced from ~336 lines to ~75 lines
- [ ] Component functionality is completely unchanged
- [ ] No `export` or other code statements are accidentally removed
- [ ] ESLint/Prettier passes after cleanup
- [ ] No change to the component's behavior or appearance

## Verification

- `npm run lint` passes
- `npm start` works — the BackToTopButton still appears on scroll and scrolls to top on click
- React DevTools shows the component renders correctly
- No changes to `BackToTopButton.css` (if it exists)

## Note

If compliance documentation is required by the project, it should be moved to a separate markdown file (e.g., `docs/accessibility-compliance.md`) rather than bloating production source code.
