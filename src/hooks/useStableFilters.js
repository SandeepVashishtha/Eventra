import { useCallback, useRef, useState } from "react";

/**
 * A drop-in replacement for useState that skips state updates when the new
 * value is deeply equal to the current value.
 *
 * WHY THIS EXISTS
 * ───────────────
 * React's useState always triggers a re-render when setState is called with a
 * new object reference, even if the object's contents are identical. In
 * useEventListing, setAdvancedFilters({}) called on filter clear creates a new
 * {} reference every time, causing the filteredEvents useMemo to recompute
 * across all search/filter/sort dependencies even though the filter state has
 * not semantically changed.
 *
 * useStableFilters compares the incoming value to the current one using a fast
 * JSON.stringify equality check. When the values are deeply equal, the setState
 * call is skipped and no re-render is scheduled. This prevents the filteredEvents
 * → paginatedEvents → totalPages cascade from running unnecessarily.
 *
 * TRADE-OFFS
 * ──────────
 * - JSON.stringify is O(n) in the size of the filter object. For the small
 *   advancedFilters objects used here (< 10 keys, primitive values) this is
 *   negligible compared to the cost of re-running the filter pipeline over
 *   potentially thousands of events.
 * - Circular references and non-serialisable values (e.g. functions) would
 *   make JSON.stringify throw — guard with a try/catch fallback.
 * - Key order in JSON.stringify is not guaranteed across all JS engines for
 *   arbitrary objects, but for the filter shape used here (string/number
 *   values, consistent key order from UI interactions) it is reliable.
 *
 * @template T
 * @param {T} initialValue - Initial state value (same as useState).
 * @returns {[T, (newValue: T) => void]} - [state, stableSetState] pair.
 */
export function useStableFilters(initialValue) {
  const [value, setValueInternal] = useState(initialValue);
  const valueRef = useRef(value);

  // Keep the ref in sync so the stable setter always compares against the
  // latest committed value, not a stale closure capture.
  valueRef.current = value;

  const setStableValue = useCallback((newValue) => {
    try {
      const currentJson = JSON.stringify(valueRef.current);
      const newJson = JSON.stringify(newValue);
      if (currentJson === newJson) return;
    } catch {
      // JSON.stringify failed (circular ref or non-serialisable value)
      // — fall through and let React decide whether to re-render.
    }
    setValueInternal(newValue);
  }, []);

  return [value, setStableValue];
}
