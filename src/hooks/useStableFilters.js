import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A custom React hook that acts as a drop-in replacement for `useState`, designed to skip
 * state updates when the incoming value is semantically (deeply) equal to the current state.
 *
 * ### Purpose
 * Prevent unnecessary component re-renders and computation cascades when state setters are called
 * with new object or array references containing identical values. 
 *
 * In complex components like `useEventListing`, invoking `setAdvancedFilters({})` to clear filters
 * creates a new empty object reference (`{}`) on every call. In a standard React `useState`, this
 * triggers a re-render and re-runs heavy computation pipelines (like filtering and sorting thousands 
 * of events). This hook intercepts semantically identical updates and short-circuits them.
 *
 * ### Filter Stability & Deep Equality Behavior
 * Comparison is performed by serializing the current state and the incoming state using 
 * `JSON.stringify`. When both serialized strings match exactly:
 * 1. The state setter call is aborted.
 * 2. React is prevented from scheduling a re-render.
 *
 * ### Memoization & Referential Stability
 * - The returned setter function `setStableValue` is wrapped in `useCallback` with an empty 
 *   dependency array `[]`. It retains referential identity across the lifetime of the component,
 *   making it safe to pass to child components or include in dependency lists without causing re-renders.
 * - To prevent stale closure bugs while maintaining setter stability, the hook utilizes a `useRef`
 *   to track the latest committed state value dynamically inside a `useEffect`.
 *
 * ### Performance Considerations & Complexity
 * - `JSON.stringify` runs in O(n) time complexity, where n is the size/depth of the object.
 *   For typical filter objects (small key-value pairs, primitive values), this serialization is
 *   extremely fast and negligible compared to DOM re-renders and full filter pipeline computations.
 * - **Caveat**: Key order in `JSON.stringify` is technically not guaranteed in JavaScript for arbitrary
 *   objects. However, for plain filter objects constructed via user interactions, key insertion order 
 *   remains highly consistent.
 * - **Caveat**: Non-serializable values (e.g., functions, symbols, or circular references) will cause 
 *   `JSON.stringify` to throw. The hook wraps the comparison in a `try...catch` block. If serialization 
 *   fails, it gracefully falls back to React's default referential equality (`Object.is`) checking.
 *
 * @template T
 * @param {T} initialValue - The initial state value, matching the signature of standard `useState`.
 * @returns {[T, function(T): void]} A tuple containing:
 *   - The current stable state value.
 *   - A referentially stable setter function that updates the state only if the value has changed.
 *
 * @example
 * import React, { useMemo } from 'react';
 * import { useStableFilters } from './hooks/useStableFilters';
 *
 * const FilterComponent = ({ events }) => {
 *   // Setup stable filter state
 *   const [filters, setFilters] = useStableFilters({ search: '', category: 'all' });
 *
 *   // Compute filtered events list.
 *   // Re-runs only when filters are semantically changed.
 *   const filteredEvents = useMemo(() => {
 *     return events.filter(event => {
 *       const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase());
 *       const matchesCategory = filters.category === 'all' || event.category === filters.category;
 *       return matchesSearch && matchesCategory;
 *     });
 *   }, [events, filters]);
 *
 *   const clearFilters = () => {
 *     // In normal useState, this causes a recompute even if filters are already empty.
 *     // With useStableFilters, this call is a safe no-op.
 *     setFilters({ search: '', category: 'all' });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={clearFilters}>Reset Filters</button>
 *       {/* render filteredEvents ... */}
 *     </div>
 *   );
 * };
 */
export function useStableFilters(initialValue) {
  const [value, setValueInternal] = useState(initialValue);
  const valueRef = useRef(value);

  // Keep the ref in sync so the stable setter always compares against the
  // latest committed value, not a stale closure capture.
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

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
