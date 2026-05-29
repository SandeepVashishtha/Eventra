# Issue #002: `GlobalErrorBoundary` defined but never imported — uncaught crashes render white screen

**Tags:** `bug`, `enhancement`, `intermediate`  
**Category:** Quality Exceptional  
**Files:** 
- `src/App.js`
- `src/components/common/ErrorBoundary.jsx`

---

## Description

The `GlobalErrorBoundary` React class component is fully implemented in `src/components/common/ErrorBoundary.jsx` (270 lines) with error UI, retry logic, error ID generation, clipboard copy, and development-mode stack traces. However, it is **never imported or used** in `src/App.js` or anywhere else in the application.

This means any uncaught runtime error in the React component tree will propagate up to the root and cause React's default error handling — a completely white page with no recovery UI, no error message, and no way for the user to recover.

### What exists but is unused

`src/components/common/ErrorBoundary.jsx` provides:
- A styled error overlay with icon, title, and error ID
- "Reload Page" button
- "Try Again" button (resets error state, with max 3 retries)
- "Copy Error" button (clipboard copy of error details)
- Auto-recovery attempt after 10 seconds (controversial, see notes)
- Collapsible technical details with component stack (dev only)
- `role="alert"` and `aria-live="assertive"` for screen readers

### Proposed Change

Wrap the application tree in `App.js` with `GlobalErrorBoundary`. The boundary should wrap at the highest level possible to catch all errors, but below the providers that are required for rendering the error UI (like `NotificationProvider` for toast messages).

## Proposed Fix

In `src/App.js`:

1. Add import at top:
```javascript
import GlobalErrorBoundary from "./components/common/ErrorBoundary";
```

2. Wrap the provider tree (around all providers or just inside them):
```javascript
function App() {
  // ... existing code ...

  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <MyEventsProvider>
            <SessionRecoveryProvider>
              {/* ... rest of existing JSX ... */}
            </SessionRecoveryProvider>
          </MyEventsProvider>
        </NotificationProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
```

The ideal placement depends on desired behavior:
- **Outside all providers**: Catches provider crashes but error UI won't have access to auth/theme context
- **Inside providers**: Error UI can be styled with theme, but provider crashes won't be caught

The recommended approach is to wrap **inside** `AuthProvider` and `NotificationProvider` but **outside** `MyEventsProvider` and `SessionRecoveryProvider`, so the error UI can use theme and show toasts.

## Acceptance Criteria

- [ ] `GlobalErrorBoundary` is imported and used in `src/App.js`
- [ ] Throwing a test error in any component shows the error boundary UI instead of a white screen
- [ ] "Try Again" button successfully recovers from transient errors
- [ ] "Reload Page" button triggers `window.location.reload()`
- [ ] "Copy Error" button copies error details to clipboard
- [ ] Error ID is displayed to the user for reporting
- [ ] No breaking changes to existing functionality
- [ ] No ESLint warnings about unused imports

## Additional Notes

- The auto-recovery timeout (10 seconds) in `componentDidCatch` at line 67-70 may cause infinite error loops for persistent errors. Consider removing it as part of this fix or making it opt-in.
- The `handleCopyError` at line 113-121 doesn't have `.catch()` for clipboard permission denial — consider adding it.
- The error boundry uses `window.location.reload()` after 3 retries at line 90 — this is a hard reload that loses all state. Consider whether this is the desired behavior.
