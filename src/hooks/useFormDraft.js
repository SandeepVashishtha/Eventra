import { useCallback, useEffect, useRef, useState } from "react";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import { logger } from "../utils/logger.js";

export const DRAFT_DEBOUNCE_MS = 1000;

const DRAFT_ENVELOPE_VERSION = 1;

const isStorageAvailable = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

/**
 * Returns a shallow copy of `values` without the given keys. Used to keep
 * non-serialisable or sensitive fields (File objects, object-URL previews,
 * passwords) out of persisted drafts.
 */
export const omitDraftFields = (values, exclude = []) => {
  if (!values || typeof values !== "object" || Array.isArray(values)) return values;
  const copy = { ...values };
  exclude.forEach((key) => delete copy[key]);
  return copy;
};

/**
 * Reads a draft written by `writeDraft`. Also accepts drafts written by older
 * versions of the app, which stored the bare form values without an envelope.
 *
 * @returns {{values: object, savedAt: string|null}|null}
 */
export const readDraft = (storageKey) => {
  if (!storageKey || !isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = safeJsonParse(raw, null);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    if (parsed.__draftVersion === DRAFT_ENVELOPE_VERSION) {
      if (!parsed.values || typeof parsed.values !== "object") return null;
      return { values: parsed.values, savedAt: parsed.savedAt ?? null };
    }
    return { values: parsed, savedAt: null };
  } catch (error) {
    logger.error("Failed to read form draft:", error);
    return null;
  }
};

/**
 * Persists `values` under `storageKey`.
 *
 * @returns {string|null} ISO timestamp of the write, or null when it failed.
 */
export const writeDraft = (storageKey, values) => {
  if (!storageKey || !isStorageAvailable()) return null;
  const savedAt = new Date().toISOString();
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ __draftVersion: DRAFT_ENVELOPE_VERSION, savedAt, values })
    );
    return savedAt;
  } catch (error) {
    logger.error("Failed to save form draft:", error);
    return null;
  }
};

export const removeDraft = (storageKey) => {
  if (!storageKey || !isStorageAvailable()) return;
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    logger.error("Failed to clear form draft:", error);
  }
};

/**
 * Human-readable age of a draft timestamp, e.g. "just now", "5 minutes ago".
 */
export const formatDraftAge = (timestamp, now = Date.now()) => {
  if (!timestamp) return "";
  const savedAt = new Date(timestamp).getTime();
  if (Number.isNaN(savedAt)) return "";

  const seconds = Math.max(0, Math.floor((now - savedAt) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

/**
 * @hook useFormDraft
 *
 * Owns form state and transparently mirrors it to `localStorage` so a tab
 * reload, crash, or accidental navigation does not lose the user's work.
 *
 * Writes are debounced (1 s by default) and skipped while a previously saved
 * draft is still awaiting a restore/discard decision, so an untouched form
 * can never overwrite the draft it is offering to restore.
 *
 * @param {string} storageKey    Key the draft is stored under. Pass a
 *                               user-scoped key to avoid leaking drafts
 *                               between accounts on a shared device.
 * @param {object|Function} initialValues Initial form values, or a factory
 *                               returning them (preferred when the shape has
 *                               nested objects, so discarding a draft always
 *                               yields a fresh copy).
 * @param {object} [options]
 * @param {number} [options.debounceMs=1000] Debounce window for writes.
 * @param {string[]} [options.exclude=[]]    Keys never written to storage.
 * @param {boolean} [options.enabled=true]   Set false to disable persistence.
 *
 * @returns {object} draft interface:
 *  - `values` / `setValues`: form state, same contract as `useState`.
 *  - `pendingDraft`: `{ values, savedAt }` found on mount, else null.
 *  - `hasPendingDraft`: whether a restore decision is outstanding.
 *  - `draftRestored`: true after `restoreDraft`, drives the banner.
 *  - `lastSavedAt`: ISO timestamp of the most recent successful write.
 *  - `restoreDraft` / `discardDraft`: resolve the pending draft.
 *  - `clearDraft`: delete the stored draft (call after a successful submit).
 *  - `saveNow`: force an immediate write, bypassing the debounce.
 *  - `dismissRestoredBanner`: hide the "draft restored" banner.
 */
export const useFormDraft = (storageKey, initialValues, options = {}) => {
  const { debounceMs = DRAFT_DEBOUNCE_MS, exclude = [], enabled = true } = options;

  const [values, setValues] = useState(initialValues);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const valuesRef = useRef(values);
  const excludeRef = useRef(exclude);
  const initialValuesRef = useRef(initialValues);
  const timeoutRef = useRef(null);

  valuesRef.current = values;
  excludeRef.current = exclude;
  initialValuesRef.current = initialValues;

  // Look for an unsubmitted draft once per storage key.
  useEffect(() => {
    setIsLoaded(false);
    setDraftRestored(false);
    if (!enabled) {
      setPendingDraft(null);
      setIsLoaded(true);
      return;
    }
    setPendingDraft(readDraft(storageKey));
    setIsLoaded(true);
  }, [storageKey, enabled]);

  const saveNow = useCallback(() => {
    if (!enabled) return null;
    const savedAt = writeDraft(storageKey, omitDraftFields(valuesRef.current, excludeRef.current));
    if (savedAt) setLastSavedAt(savedAt);
    return savedAt;
  }, [enabled, storageKey]);

  // Debounced persistence. Held back until any pending draft is resolved so an
  // empty form cannot clobber the draft the user is being offered.
  useEffect(() => {
    if (!enabled || !isLoaded || pendingDraft) return undefined;

    timeoutRef.current = setTimeout(saveNow, debounceMs);
    return () => clearTimeout(timeoutRef.current);
  }, [values, enabled, isLoaded, pendingDraft, debounceMs, saveNow]);

  const restoreDraft = useCallback(() => {
    if (!pendingDraft) return;
    const restored = omitDraftFields(pendingDraft.values, excludeRef.current);
    setValues((prev) => ({ ...prev, ...restored }));
    setLastSavedAt(pendingDraft.savedAt);
    setPendingDraft(null);
    setDraftRestored(true);
  }, [pendingDraft]);

  const clearDraft = useCallback(() => {
    removeDraft(storageKey);
    setPendingDraft(null);
    setDraftRestored(false);
    setLastSavedAt(null);
  }, [storageKey]);

  const discardDraft = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearDraft();
    const initial = initialValuesRef.current;
    setValues(typeof initial === "function" ? initial() : initial);
  }, [clearDraft]);

  const dismissRestoredBanner = useCallback(() => setDraftRestored(false), []);

  return {
    values,
    setValues,
    pendingDraft,
    hasPendingDraft: Boolean(pendingDraft),
    draftRestored,
    lastSavedAt,
    restoreDraft,
    discardDraft,
    clearDraft,
    saveNow,
    dismissRestoredBanner,
  };
};

export default useFormDraft;
