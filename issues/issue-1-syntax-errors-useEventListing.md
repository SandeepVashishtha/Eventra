## Critical: useEventListing.js Contains Syntax Errors, Duplicate Declarations, Undefined Variables, and Broken Pagination Logic

### Severity: Critical
### Category: Bug (Broken Core Functionality)

## Description

The `useEventListing` hook (`src/Pages/Events/useEventListing.js`) has multiple severe defects that together break the entire event listing and search/filter pipeline. Despite being the central data-fetching hook for the Events page, it contains code that cannot execute without throwing runtime errors.

### Defect 1 — Misplaced `import` Statement (Line 30)

```js
import useDebounce from "../../hooks/useDebounce";
```

This `import` appears at **line 30**, in the middle of the module body between `const FUSE_OPTIONS` and `const DEFAULT_EVENTS_PER_PAGE`. In standard ES module syntax, all `import` statements must be at the top level before any other code. If the build tool (Vite) does not hoist this, it will throw a `SyntaxError: import declaration may only appear at top level of a module`. Even if Vite's bundler hoists it, this is not spec-compliant and may break in stricter environments or future tooling versions.

### Defect 2 — Duplicate `const DEFAULT_EVENTS_PER_PAGE` Declaration (Line 32 vs Import)

- **Line 7 (import):** `import { ..., DEFAULT_EVENTS_PER_PAGE, ... } from "./eventPaginationUtils.mjs";`
- **Line 32:** `const DEFAULT_EVENTS_PER_PAGE = 12;`

The constant is both imported from the `.mjs` utility module and redeclared locally. Depending on the bundler, this will either produce a `SyntaxError: Identifier 'DEFAULT_EVENTS_PER_PAGE' has already been declared` or silently shadow the imported value, creating confusion about which value is actually used.

### Defect 3 — Orphaned Ternary Fragment (Line 137)

Between lines 128–137, there is an orphaned `: [];` token:

```js
// Lines 128-137
const nextEvents = (apiEvents.length > 0 ? apiEvents : fallbackEvents).map(normalizeEvent);
setEvents(nextEvents);
setCacheInfo(null);
saveCachedEvents(nextEvents);
saveAllCachedEventDetails(nextEvents);
    : [];    // <-- ORPHANED: this is a syntax error
```

This fragment is a leftover from a refactored expression. It appears to be the false-branch of a removed ternary that was never cleaned up. This will cause a **SyntaxError** at runtime, crashing the entire events page.

### Defect 4 — Undefined Variable `fallbackEvents` (Line 128)

The variable `fallbackEvents` is used at line 128 but is **never declared or assigned** anywhere in the file or imported from another module. This will throw a `ReferenceError: fallbackEvents is not defined` when the API returns an empty or non-array response.

### Defect 5 — Double `setEvents()` Calls in Success Path (Lines 129 and 144)

Even if the syntax errors were fixed, the success path calls `setEvents()` **twice**:

1. **Line 129:** `setEvents(nextEvents);`
2. **Line 144:** `setEvents(normalizedEvents);`

The first call at line 129 is immediately overwritten by the second call at line 144, causing an unnecessary re-render. But more critically, lines 130–136 (which save to cache and set cache info) use the `nextEvents` data, while the final state at line 144 uses `normalizedEvents` which is derived from `apiEvents` (not `nextEvents`). If `apiEvents` is empty but `fallbackEvents` is populated (if the undefined variable bug is fixed), the cache would be saved with `nextEvents` data but the UI would show an empty `normalizedEvents` array.

### Defect 6 — Redundant State: `paginatedEvents` and `filteredEvents` Are Just Raw `events` (Lines 232–234)

```js
const filteredEvents = useMemo(() => events, [events]);
const paginatedEvents = useMemo(() => events, [events]);
```

Both `filteredEvents` and `paginatedEvents` are **identical** to the raw `events` array — no filtering or pagination is applied. The actual filtering and pagination utility functions imported from `eventPaginationUtils.mjs` (`filterEventsByType`, `getPaginatedEvents`, etc.) are never called. This means:

- The `filterType` state is completely ignored — selecting "Upcoming" or "Past" does nothing
- The `currentPage` state is completely ignored — pagination controls show correct page numbers but always render all events
- The sort selection is ignored in the UI display

## Impact

- **Page crash:** The events page will crash at runtime due to the syntax error at line 137 and the undefined `fallbackEvents` at line 128
- **Broken filtering:** Even if syntax errors are fixed, the filter/sort/pagination controls are decorative only — they update state but the rendered data never changes
- **Cache inconsistency:** The offline cache is saved with different data than what is displayed
- **Failed production build:** The misplaced `import` and duplicate `const` declaration may cause build failures in strict bundler configurations

## Files Affected

1. **`src/Pages/Events/useEventListing.js`** — All defects exist in this single file but fixing it properly requires:

## Suggested Fix

1. Move the `import useDebounce` to the top of the file (and consider using the already-imported `useDebouncedValue` from `../../hooks/useDebouncedValue` instead to avoid confusion)
2. Remove the duplicate `const DEFAULT_EVENTS_PER_PAGE = 12` — use the imported value
3. Remove the orphaned `: [];` fragment at line 137
4. Define `fallbackEvents` properly or remove the fallback logic if mock data fallback is handled at a higher level
5. Consolidate the double `setEvents()` into a single call
6. Actually implement the filtering and pagination logic using the imported utility functions (`filterEventsByType`, `getPaginatedEvents`, etc.) instead of returning raw events for both `filteredEvents` and `paginatedEvents`
