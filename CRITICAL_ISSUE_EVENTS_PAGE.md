# [Critical] EventsPage crashes with ReferenceError, URL params silently discarded, and race condition overwrites API data with mock events

## Description

Three deeply interlinked bugs in the Events page system (`EventsPage.js` + `useEventListing.js`) that together make the page either crash outright or silently corrupt event data at runtime. These are **not** enhancements or minor refactors — they are clear coding errors that break core functionality.

---

## Bug 1 — ReferenceError: `routeSearchQuery` is undefined

**File:** `src/Pages/Events/EventsPage.js`  
**Lines:** 112, 122–125, 129–137

The variable `routeSearchQuery` is referenced **6 times** across three `useEffect` blocks but is **never declared, imported, or derived from any source** anywhere in the entire codebase (confirmed by grep across all files).

```js
// Line 112 — inside empty-deps useEffect
const search = prepareSafeSearchQuery(routeSearchQuery);  // ReferenceError

// Lines 121-125
useEffect(() => {
  if (routeSearchQuery !== listing.searchQuery) {       // ReferenceError
    listing.setSearchQuery(routeSearchQuery);            // ReferenceError
  }
}, [routeSearchQuery]);                                   // ReferenceError

// Lines 128-137
useEffect(() => {
  if (!listing.isLoading && routeSearchQuery) {          // ReferenceError
    setTimeout(() => { cardSectionRef.current?.scrollIntoView(...); }, 100);
  }
}, [listing.isLoading, routeSearchQuery]);                // ReferenceError
```

**Impact:** The Events page throws a `ReferenceError` on mount or re-render. Since React 19's strict mode and ES module strict mode both enforce this, the component will crash.

---

## Bug 2 — URL search params are read but silently discarded

**File:** `src/Pages/Events/EventsPage.js`  
**Lines:** 108–118

The URL initialization `useEffect` reads **5 query parameters** from the URL but assigns them to local variables that immediately go out of scope — they are **never applied** to any state:

```js
useEffect(() => {
  const page   = parseInt(searchParams.get("page")) || 1;
  const perPage = parseInt(searchParams.get("perPage")) || 6;
  const search = prepareSafeSearchQuery(routeSearchQuery); // also crashes
  const filter = searchParams.get("filter") || "all";
  const sort   = searchParams.get("sort") || "Newest";
  const view   = searchParams.get("view") || "grid";
  // ── no setPage(), no setSearchQuery(), no setFilterType() ...
  // All the above variables vanish into thin air.
}, []);
```

**Impact:** Sharing an events URL with query params has zero effect:
- `/events?search=react` → search not applied
- `/events?page=3` → still shows page 1
- `/events?filter=upcoming&sort=price` → no effect

The Navbar "search events" feature also cannot work because it presumably navigates to `/events?search=...` but the param is never consumed.

---

## Bug 3 — Race condition overwrites real API data with mock data

**File:** `src/Pages/Events/useEventListing.js`  
**Lines:** 49–85

Two competing `useEffect` blocks both write to the same `events` state, creating a race condition:

```js
// Effect A (line 49): loads MOCK data after 800ms delay
useEffect(() => {
  const timer = setTimeout(() => {
    setEvents(mockEvents.map(e => ({ ...e, status: getEventStatus(e) })));
    setIsLoading(false);
  }, 800);
  return () => clearTimeout(timer);
}, []);

// Effect B (line 83): immediately calls fetchEvents()
useEffect(() => {
  fetchEvents();  // API call — sets events to real data
}, [fetchEvents]);

// fetchEvents (line 63):
const fetchEvents = useCallback(async () => {
  const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
  setEvents(response.data);  // ← real API data at ~t=500ms
  setIsLoading(false);
  // ...
}, []);
```

**Race timeline:**

| Time | What happens | `events` state |
|------|-------------|----------------|
| t=0ms | Both effects fire. fetchEvents begins API call. | `[]` |
| t=~500ms | API returns data → `setEvents(apiData)`, `setIsLoading(false)` | ✅ Real data |
| t=800ms | Timer fires → `setEvents(mockData)`, `setIsLoading(false)` | ❌ **Mock data overwrites real data** |

**Impact in production (with a real backend):**
1. User lands on Events page
2. Real events appear briefly (from API)
3. **At 800ms, mock data replaces real data** — user sees hardcoded fake events
4. If mock data has different shape, this can cause render-time type errors

**Impact in development (no backend, fallback to mock):**
- `fetchEvents` fails, falls back to `setEvents(mockEvents)` at ~t=50ms
- At t=800ms, the timer redundantly sets `mockEvents` again
- Causes an unnecessary re-render but no data corruption

---

## Root Cause Analysis

These bugs appear to be the result of an **incomplete refactoring**:

1. `routeSearchQuery` was **meant** to be `searchParams.get("search")` but was never assigned — it's a ghost variable from a partially implemented feature.
2. The URL param initialization effect was stubbed out and never connected to the listing state setters.
3. The 800ms mock-data timer looks like leftover debugging code that was never removed when `fetchEvents` was added. The original design probably used only mock data, then someone added API support but forgot to remove the old timer.

## Steps to Reproduce

1. Navigate to `/events` in the browser
2. **Bug 1:** If `routeSearchQuery` is in a code path that executes synchronously (it's inside `useEffect`, so React may catch it in error boundary), the page shows an error fallback
3. **Bug 2:** Append `?search=AI&page=2` to the URL — search term and page number are ignored
4. **Bug 3** (production only): After the page loads, watch the event list change from real data to mock data at ~800ms

## Files to Fix

| File | Lines | Issue |
|------|-------|-------|
| `src/Pages/Events/EventsPage.js` | 100–137 | Missing `routeSearchQuery` declaration; URL params read but never applied |
| `src/Pages/Events/useEventListing.js` | 49–85 | Race condition: mock timer + API fetch write to same `events` state |

## Suggested Fix Strategy

1. **Remove** the 800ms mock-data timer in `useEventListing.js` entirely — `fetchEvents` already handles mock fallback in development
2. **Add** `const routeSearchQuery = searchParams.get("search") || "";` in `EventsPage.js`
3. **Apply** URL params (`page`, `perPage`, `search`, `filter`, `sort`, `view`) to the listing state setters in the initialization effect
4. **Consider** using `useSearchParams` for two-way sync (read URL → set state; on state change → update URL)
