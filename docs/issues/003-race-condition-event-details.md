# Issue #003: Race condition in EventDetailsPage — stale data overwrites fresh data

**Tags:** `bug`, `advanced`  
**Category:** Quality Exceptional  
**Files:** `src/Pages/Events/EventDetailsPage.js`

---

## Description

The `EventDetailsPage` component has a classic async race condition. When a user navigates between events rapidly, the simulated 1-second fetch delay can cause stale data from a previous request to overwrite fresh data from the current request.

### Root Cause

In `src/Pages/Events/EventDetailsPage.js:26-62`:

```javascript
useEffect(() => {
  const fetchEvent = async () => {
    try {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      const foundEvent =
        eventsMockData.find(
          (e) =>
            e.id ===
            parseInt(eventId)
        );

      setEvent(foundEvent);  // ← May fire after component moved to new eventId
      if (foundEvent) {
        addRecentlyViewed({ /* ... */ });  // ← Stale data side-effect
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [eventId, addRecentlyViewed]);
```

**The race**: If `eventId` changes while `setTimeout` is pending:

1. User clicks Event A → `eventId = "5"` → effect fires → 1s timer starts
2. User clicks Event B (within 1s) → `eventId = "10"` → effect fires → NEW 1s timer starts, OLD timer still running
3. OLD timer resolves (at ~1s mark) → `setEvent(eventA)` → Event A data overwrites
4. NEW timer resolves (at ~2s mark) → `setEvent(eventB)` → Correct but user saw flicker

In a real API scenario, there's no guarantee about response ordering — the slower request could resolve last, displaying wrong data.

### Additional Issues in Same File

1. **Inconsistent formatting**: Lines 20-24 use unusual line-wrapping for `useState`:
   ```javascript
   const [loading, setLoading] =
     useState(true);
   const [event, setEvent] =
     useState(null);
   ```

2. **No mounted guard**: When the component unmounts during the 1s delay, `setEvent`, `addRecentlyViewed`, `setLoading` all fire on unmounted component.

## Proposed Fix

Add an `AbortController` or mounted ref pattern to cancel the async operation when `eventId` changes or the component unmounts:

### Option A: Mounted ref (simpler)

```javascript
useEffect(() => {
  let isCancelled = false;
  const fetchEvent = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (isCancelled) return;

      const foundEvent = eventsMockData.find((e) => e.id === parseInt(eventId));

      if (isCancelled) return;
      setEvent(foundEvent);

      if (foundEvent && !isCancelled) {
        addRecentlyViewed({
          id: foundEvent.id,
          title: foundEvent.title,
          date: foundEvent.date,
          location: foundEvent.location,
          image: foundEvent.image,
          category: foundEvent.type,
        });
      }
    } catch (error) {
      if (!isCancelled) console.error(error);
    } finally {
      if (!isCancelled) setLoading(false);
    }
  };

  fetchEvent();
  return () => { isCancelled = true; };
}, [eventId, addRecentlyViewed]);
```

### Option B: AbortController (more robust, future-proof for real API)

```javascript
useEffect(() => {
  const abortController = new AbortController();

  const fetchEvent = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (abortController.signal.aborted) return;

      const foundEvent = eventsMockData.find((e) => e.id === parseInt(eventId));

      if (abortController.signal.aborted) return;
      setEvent(foundEvent);

      if (foundEvent && !abortController.signal.aborted) {
        addRecentlyViewed({ /* ... */ });
      }
    } catch (error) {
      if (!abortController.signal.aborted) console.error(error);
    } finally {
      if (!abortController.signal.aborted) setLoading(false);
    }
  };

  fetchEvent();
  return () => abortController.abort();
}, [eventId, addRecentlyViewed]);
```

## Acceptance Criteria

- [ ] Rapidly clicking between different event detail pages always shows the correct event
- [ ] No stale data flicker — the final displayed event matches the URL `eventId`
- [ ] No "Can't perform a React state update on an unmounted component" warnings
- [ ] The `addRecentlyViewed` only fires for the final event, not intermediate ones
- [ ] Loading state correctly transitions between events
- [ ] Back button navigation to events list still works

## Testing

- Manual: Navigate between 3-4 events rapidly (<1s apart), verify correct data displays
- Manual: Navigate to event details, immediately click away, verify no stale updates
