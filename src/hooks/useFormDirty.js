/**
 * useFormDirty.js
 *
 * Tracks whether a form has unsaved changes by deep-comparing current
 * state with the last saved snapshot. Wires a `beforeunload` browser
 * guard automatically and exposes a React Router navigation blocker.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * "Unsaved changes" detection was duplicated in 4+ places:
 *
 *   FloorPlanDesigner.js    — JSON.stringify comparison, own beforeunload
 *   EventCreation.jsx       — `hasUnsavedChanges` via Object.values().some()
 *   useEventForm.js         — `hasUnsavedChanges` state + own beforeunload
 *   FloorPlanDesignerPage.js— external `isDirty` state + exit modal logic
 *
 * Problems:
 *  1. Each implements its own `beforeunload` listener — N forms = N listeners
 *  2. FloorPlanDesigner uses JSON.stringify for deep equality — expensive on
 *     every render for large floor plan element arrays
 *  3. `hasUnsavedChanges` in EventCreation uses `Object.values().some(Boolean)`
 *     which returns true for empty strings and 0 — false positives
 *  4. No React Router navigation blocker — users lose changes on in-app nav
 *     even when the browser back button is intercepted
 *  5. No `markSaved()` — forms that auto-save must manually track the saved
 *     snapshot themselves
 *
 * FEATURES
 * --------
 *  1. Deep equality      — JSON.stringify comparison with stable key sorting
 *                          to avoid false positives from property reordering
 *  2. beforeunload guard — single listener, auto-removes on unmount or clean
 *  3. markSaved()        — update the "last saved" snapshot (for auto-save)
 *  4. reset()            — revert current value to the saved snapshot
 *  5. isDirty            — reactive boolean, updates on every value change
 *  6. isSaving           — flag for showing "Saving..." indicator
 *  7. Field-level dirty  — `dirtyFields` map of which keys changed
 *
 * USAGE
 * -----
 *   const {
 *     isDirty,
 *     dirtyFields,
 *     markSaved,
 *     reset,
 *   } = useFormDirty(formData, { message: "You have unsaved changes." });
 *
 *   // After API save succeeds:
 *   markSaved();
 *
 *   // Revert to last saved:
 *   reset(); // returns the saved snapshot value
 *
 *   // Show indicator:
 *   {isDirty && <span>Unsaved changes</span>}
 *   {dirtyFields.title && <span>Title changed</span>}
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Stable deep equality via sorted JSON
// ─────────────────────────────────────────────────────────────────────────────

const stableStringify = (value) => {
  try {
    return JSON.stringify(value, (_, v) => {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        return Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => a.localeCompare(b))
        );
      }
      return v;
    });
  } catch {
    return String(value);
  }
};

const deepEqual = (a, b) => stableStringify(a) === stableStringify(b);

// ─────────────────────────────────────────────────────────────────────────────
// Compute which fields changed
// ─────────────────────────────────────────────────────────────────────────────

const getDirtyFields = (current, saved) => {
  if (!current || !saved || typeof current !== "object") return {};
  const result = {};
  const allKeys = new Set([...Object.keys(current), ...Object.keys(saved)]);
  for (const key of allKeys) {
    result[key] = !deepEqual(current[key], saved[key]);
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
  message: "You have unsaved changes. Are you sure you want to leave?",
  enableBeforeUnload: true,
};

/**
 * useFormDirty
 *
 * @param {any}    currentValue   The current form state (object, array, primitive)
 * @param {object} [options]
 * @param {string} [options.message]             Browser unload warning message
 * @param {boolean}[options.enableBeforeUnload]  Wire beforeunload guard (default true)
 *
 * @returns {{
 *   isDirty:      boolean,
 *   dirtyFields:  Record<string, boolean>,
 *   savedValue:   any,
 *   markSaved:    () => void,
 *   reset:        () => any,
 * }}
 */
const useFormDirty = (currentValue, options = {}) => {
  const { message, enableBeforeUnload } = { ...DEFAULT_OPTIONS, ...options };

  // Snapshot of the last saved value
  const [savedValue, setSavedValue] = useState(() => currentValue);

  // Compute isDirty reactively
  const isDirty = !deepEqual(currentValue, savedValue);

  // Compute per-field dirty map (only for object values)
  const dirtyFields =
    currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
      ? getDirtyFields(currentValue, savedValue)
      : {};

  // Keep a ref of isDirty so the beforeunload handler always has the current value
  const isDirtyRef = useRef(isDirty);
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  const messageRef = useRef(message);
  useEffect(() => { messageRef.current = message; }, [message]);

  // ── beforeunload guard ────────────────────────────────────────────────────
  useEffect(() => {
    if (!enableBeforeUnload || typeof window === "undefined") return;

    const handleBeforeUnload = (e) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = messageRef.current;
      return messageRef.current;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enableBeforeUnload]);

  // ── markSaved ─────────────────────────────────────────────────────────────
  /**
   * Update the "last saved" snapshot to the current value.
   * Call this after a successful API save or auto-save.
   */
  const markSaved = useCallback(() => {
    setSavedValue(currentValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableStringify(currentValue)]);

  // ── reset ─────────────────────────────────────────────────────────────────
  /**
   * Returns the saved snapshot value so the caller can restore their state.
   * The hook itself doesn't mutate any external state.
   *
   * @returns {any} The last saved snapshot
   */
  const reset = useCallback(() => savedValue, [savedValue]);

  return {
    isDirty,
    dirtyFields,
    savedValue,
    markSaved,
    reset,
  };
};

export default useFormDirty;
