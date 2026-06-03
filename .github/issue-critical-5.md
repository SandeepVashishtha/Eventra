## Summary
The codebase has FOUR separate error boundary components that independently implement retry counting, localStorage persistence, and UI rendering — all doing essentially the same thing with slightly different keys and thresholds.

## Evidence
**Four error boundary implementations:**
| Component | File | Lines | Scope |
|-----------|------|-------|-------|
| `ErrorBoundary` | `src/components/common/ErrorBoundary.jsx` | 568 | Full-page crash screen |
| `SectionErrorBoundary` | `src/components/common/SectionErrorBoundary.jsx` | 176 | Section-level fallback |
| `FeatureErrorBoundary` | `src/components/common/FeatureErrorBoundary.jsx` | 129 | Feature card-level |
| `ErrorFallback` | `src/components/common/ErrorFallback.jsx` | 47 | Functional fallback (possibly unused) |

Plus global handlers:
- `src/utils/globalErrorHandler.js` (58 lines) — window.onerror + onunhandledrejection
- `src/utils/errorLogger.js` (101 lines) — Sentry + localStorage

**All THREE boundaries independently implement:**
- Retry counting with cap of 3 (different thresholds for each)
- localStorage persistence under different keys (`eventra_error_log`, `eventra_section_errors`, `eventra_feature_errors`)
- Component state recovery mechanisms
- All access `localStorage` directly via `JSON.parse(localStorage.getItem(...))` instead of any storage wrapper

**UI duplication:**
- `ErrorBoundary.jsx` has 200 lines of crash screen JSX (SVG icons, animations, diagnostics panel)
- `SectionErrorBoundary.jsx` has 90 lines of separate inline-styled fallback
- `FeatureErrorBoundary.jsx` has 40 lines of separate Tailwind-styled fallback

Any error UI change requires touching three files.

## Suggested Fix (600-1000+ lines)
- Create a single composable `ErrorBoundary` with `level="page" | "section" | "feature"` prop that selects UI variant
- Unify localStorage persistence into `errorLogger.js` and remove from all three boundaries
- Create single retry state store (zustand) tracked across boundaries
- Remove three separate boundaries, replace with factory function
- Add test coverage for unified boundary
- Add ErrorFallback as a render-prop component for custom fallbacks
