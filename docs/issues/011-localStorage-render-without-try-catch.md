# Issue #011: `cursorEnabled` reads `localStorage` during render without error handling — crashes in Safari private mode

**Tags:** `bug`, `intermediate`  
**Category:** Quality Exceptional  
**Files:** `src/App.js`

---

## Description

The `cursorEnabled` state in `App.js` directly calls `localStorage.getItem("cursor")` during the initial state computation (a side effect during render):

```javascript
const [cursorEnabled, setCursorEnabled] = useState(localStorage.getItem("cursor") !== "off");
```

### Problems

1. **Side effect during render**: `localStorage.getItem()` is a side effect. Calling it inside a `useState` initializer argument (which runs during render) violates React purity rules. While lazy initializers (`useState(() => ...)`) are acceptable, the current code passes the **result** of the call, not a factory function.

2. **No error handling**: In Safari private browsing mode, `localStorage` throws a `SecurityError` when accessed. The API is available (so `typeof window !== 'undefined'` doesn't help), but writes and reads can throw. The `toggleCursor` function at line 54 wraps `localStorage.setItem` in try/catch, but the initial read does not.

3. **SSR incompatibility**: `localStorage` is not available during Server-Side Rendering (SSR). If SSR is introduced in the future, this will crash. Even without SSR, it's good practice to guard.

### Impact

When `localStorage` throws (Safari private mode, storage quota exceeded, or security-restricted iframe), the entire app crashes on mount with an uncaught error because the `useState` initializer throws synchronously during render.

### Current Code

```javascript
function App() {
  const [cursorEnabled, setCursorEnabled] = useState(localStorage.getItem("cursor") !== "off");
  // ...
  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);
    try {
      localStorage.setItem("cursor", newValue ? "on" : "off");
    } catch (error) {
      console.error('Error setting cursor preference:', error);
    }
  };
  // ...
}
```

## Proposed Fix

Use a lazy initializer function with try/catch:

```javascript
function App() {
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    try {
      if (typeof window === 'undefined') return true; // SSR guard
      return localStorage.getItem("cursor") !== "off";
    } catch {
      return true; // Default to enabled on error
    }
  });
  // ...
}
```

The key change: `useState(() => { ... })` instead of `useState(localStorage.getItem(...))`. This:
- Passes a **factory function** that React calls only once during initial mount (lazy initialization)
- Wraps the `localStorage` access in try/catch
- Provides a sensible default when storage is unavailable
- Guards against SSR

### Secondary Fix: Also update `toggleCursor`

The `toggleCursor` already has try/catch (line 54-58), which is correct. No changes needed there.

## Acceptance Criteria

- [ ] App mounts without errors when `localStorage` is available
- [ ] App mounts without errors when `localStorage` throws (simulate by setting `localStorage` to a mock that throws)
- [ ] Cursor preference persists correctly across page reloads when localStorage works
- [ ] Cursor defaults to "enabled" when localStorage is unavailable
- [ ] `toggleCursor` still works correctly (already has error handling)
- [ ] No breaking changes to cursor functionality

## Testing

### Manual Test
1. Open the app normally → cursor effect should work based on saved preference
2. Toggle cursor preference → should persist on reload
3. Open in Safari private mode (or block localStorage via DevTools → Application → Clear storage → tick "Local storage" then set a breakpoint that throws) → app should mount with cursor enabled by default

### Simulating the error
```javascript
// In browser console:
Object.defineProperty(window, 'localStorage', {
  get: () => { throw new Error('localStorage unavailable'); }
});
```
Then reload — the app should load with `cursorEnabled = true` (default).
