import { useEffect, useRef, useCallback } from "react";
import { saveDraft, clearDraft } from "../utils/eventDraftUtils";

/**
 * Auto-saves form data to localStorage every `intervalMs` milliseconds.
 * Also saves on unmount if data has changed.
 *
 * @param {object} formData - The form data to save
 * @param {function} onSave - Called after each successful save with ISO timestamp
 * @param {number} intervalMs - Auto-save interval in ms (default 30s)
 * @param {boolean} enabled - Whether auto-save is active
 */
export const useAutoSaveDraft = (formData, onSave, intervalMs = 30000, enabled = true) => {
  const lastSavedRef = useRef(null);
  const formDataRef = useRef(formData);

  // Keep ref current without triggering re-renders
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const save = useCallback(() => {
    const ok = saveDraft(formDataRef.current);
    if (ok) {
      const ts = new Date().toISOString();
      lastSavedRef.current = ts;
      onSave?.(ts);
    }
  }, [onSave]);

  // Interval-based auto-save
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(save, intervalMs);
    return () => clearInterval(id);
  }, [save, intervalMs, enabled]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;
    const handleUnload = () => saveDraft(formDataRef.current);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [enabled]);

  return { saveNow: save, clearDraft };
};