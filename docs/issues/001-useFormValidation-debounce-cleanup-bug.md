## Describe the bug

The `useFormValidation` hook's `handleChange` function uses `useCallback` with a `setTimeout` for debounced field validation. It attempts to clean up the timer by returning `() => clearTimeout(timeoutId)` from the callback, but **React never invokes cleanup functions returned from `useCallback`** — that's a `useEffect` contract only. This means every keystroke leaks a debounce timer, and when the component unmounts, the stale `setErrors` calls fire on an unmounted component, producing React warnings and potential crashes.

## To Reproduce

Steps to reproduce the behavior:

1. Open any form component that uses `useFormValidation` (e.g., Login, Signup, EventCreation)
2. Type rapidly in any validated field
3. Before the 300ms debounce fires, navigate away from the page (or unmount the component)
4. Observe in the console: "Warning: Can't perform a React state update on an unmounted component"
5. Additionally, the `setTimeout` from step 2 was never cleared — it will fire after the delay even though the component is gone

## Expected behavior

- Debounce timers should be properly cancelled when the component unmounts
- Debounce timers should be cancelled and restarted when `handleChange` is called again before the previous timer fires
- No state updates should occur after the component unmounts
- Validation should see the latest field values when it fires (no stale closure)

## Actual behavior

- Timers are never cleaned up (the `return () => clearTimeout()` inside `useCallback` is never called by React)
- "Can't perform a React state update on an unmounted component" warnings appear in the console when navigating away during debounce
- The `value` and spread `values` captured inside the `setTimeout` closure are stale — they come from the render when `useCallback` was last memoized, not the latest values when the timer fires

## Proposed fix

The debounce logic should be moved into a dedicated `useEffect` that watches `values` and uses `useRef` to track the timer. This ensures React's built-in cleanup mechanism handles timer cancellation. `handleChange` should be simplified to just update state — no debounce logic inside it.

## Additional context

**File:** `src/hooks/useFormValidation.js` lines 46-65

**Code snippet (lines 46-65):**
```javascript
const handleChange = useCallback((e) => {
  const { name, value } = e.target;
  setValues(prev => ({ ...prev, [name]: value }));
  setTouched(prev => ({ ...prev, [name]: true }));
  setErrors(prev => ({ ...prev, [name]: null }));

  if (validationRules[name] && !validateOnBlur) {
    const timeoutId = setTimeout(() => {
      const error = validateField(name, value, { ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: error }));
    }, debounceMs);

    return () => clearTimeout(timeoutId);  // ← NEVER CALLED BY REACT
  }
}, [validationRules, validateOnBlur, debounceMs, validateField, values]);
```

**Why the cleanup never runs:** React only calls cleanup functions returned from `useEffect` (not `useCallback`). The `useCallback` docs state: "useCallback(fn, deps) returns a memoized version of the callback." The returned value from the callback (`() => clearTimeout(timeoutId)`) is simply returned to the caller of `handleChange(e)` — it's never evaluated by React as a cleanup.

**Tags:** `bug`, `performance`
**Difficulty:** Intermediate
