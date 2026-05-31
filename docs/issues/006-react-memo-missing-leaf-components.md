# Issue #006: `React.memo` missing on key leaf components — unnecessary re-renders

**Tags:** `performance`, `refactor`, `intermediate`  
**Category:** Quality Exceptional  
**Files:** Multiple component files (see list below)

---

## Description

Only **one component** in the entire codebase (`EventCard.js`) uses `React.memo`. Many leaf/presentational components re-render on every parent state change, even when their props haven't changed. This causes unnecessary Virtual DOM diffing and, for large lists, significant performance degradation.

### Impact

Without `React.memo`, every parent state update triggers re-render of all children, even those with stable props. For list-based pages (Events, Hackathons, Projects, Leaderboard), this means all list items re-render when:
- A filter/sort option changes
- Search query is typed
- Pagination changes
- Any parent state updates

### Candidates for `React.memo`

| Component | File | Why it benefits |
|-----------|------|-----------------|
| `EventHero` | `src/Pages/Events/EventHero.js` | Static layout section, re-renders on every filter change |
| `PaginationControls` | `src/Pages/Events/PaginationControls.js` | Receives only page number + total + callbacks |
| `HackathonCard` | `src/Pages/Hackathons/HackathonCard.js` | List item, re-renders on every sort/filter |
| `ProjectCard` | `src/Pages/Projects/ProjectCard.js` | List item, re-renders on every sort/filter |
| `CountdownTimer` | `src/components/common/CountdownTimer.jsx` | Receives date/time strings, updated every second via interval |
| `NavbarLink` | `src/components/Layout/NavbarLink.js` | Receives only link props |
| `EventCTA` | `src/Pages/Events/EventCTA.js` | Static CTA section with no dynamic data |
| `FilterBadge` | `src/components/common/FilterBadge.jsx` | Receives only label + onClick |
| `BackToTopButton` | `src/components/common/BackToTopButton.js` | Only depends on scroll position via its own effect |

### How to Add `React.memo`

For each component, wrap the default export:

```javascript
import React, { memo } from 'react';

const ComponentName = (props) => {
  // ... existing component code
};

export default memo(ComponentName);
```

### Special Considerations

1. **Props with object/array/function references**: `React.memo` uses shallow comparison. Any inline object or function prop will cause re-renders. Audit the parent to ensure callbacks use `useCallback` and static props use `useMemo`.

2. **`EventHero.js`**: Has internal state (`searchQuery`, `isSearchFocused`) via `useState`. `React.memo` still helps — it prevents re-renders when parent state changes but `EventHero`'s props don't change.

3. **`CountdownTimer.jsx`**: Uses `setInterval` internally to tick. `React.memo` ensures it doesn't re-render when parent re-renders for unrelated reasons.

4. **`PaginationControls.js`**: Receives callbacks like `onPageChange`. Ensure the parent uses `useCallback` for these handlers, otherwise `memo` will be ineffective.

### Additional Optimization

For components that receive complex object props, provide a custom comparison function:

```javascript
export default memo(ComponentName, (prevProps, nextProps) => {
  return prevProps.event.id === nextProps.event.id;
});
```

## Acceptance Criteria

- [ ] All identified leaf components are wrapped with `React.memo`
- [ ] No regressions in functionality for any wrapped component
- [ ] Filtering, sorting, and paginating events no longer re-renders all cards
- [ ] React DevTools Profiler shows reduced re-render count for wrapped components
- [ ] Props that are objects/arrays/functions are stable (wrapped in `useCallback`/`useMemo`) so `memo` is effective
- [ ] No ESLint warnings about `memo` imports

## Verification

1. Open React DevTools Profiler
2. Trigger a state change in a parent (e.g., change filter from "All" to "Upcoming")
3. Verify that leaf components with `memo` do not appear in the re-render flamegraph unless their specific props changed
4. Measure render time before and after for the Events listing page
