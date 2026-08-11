/**
 * useToast.js
 *
 * Centralised toast notification hook with standard presets and deduplication.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * `utils/toast.js` already has `showSuccessToast`, `showErrorToast` etc.
 * but 234 components bypass it and call `toast.success/error/warning/info`
 * directly with inconsistent options:
 *
 *   toast.error("Failed", { autoClose: 2000 })   // ShareMenu
 *   toast.error("Failed")                          // EventRegistration (no autoClose)
 *   toast.success("Done!", { autoClose: 1800 })   // EventCard
 *   toast.success("Saved")                         // Footer (no autoClose)
 *   toast.warning("Note", { icon: <Icon /> })     // HackathonCard
 *
 * Problems:
 *  1. Inconsistent durations — 1800ms, 2000ms, 2500ms, 3000ms, 5000ms all used
 *  2. No deduplication — rapid double-clicks show duplicate toasts
 *  3. No i18n — some use `t()`, others hardcode English strings
 *  4. No loading toast pattern — 20+ components invent their own
 *  5. `showUndoToast` in utils/toast.js is excellent but rarely used
 *
 * STANDARD DURATIONS (enforced by this hook)
 * ------------------------------------------
 *   success  → 2500ms
 *   error    → 4000ms  (longer so users can read the problem)
 *   warning  → 3500ms
 *   info     → 2500ms
 *   loading  → manual dismiss (via returned dismiss fn)
 *
 * USAGE
 * -----
 *   const { success, error, warning, info, loading, promise } = useToast();
 *
 *   // Basic
 *   success("Event saved!");
 *   error("Failed to load events.");
 *
 *   // With deduplication (same toastId dismisses previous)
 *   success("Bookmark saved!", { toastId: `bookmark-${event.id}` });
 *
 *   // Loading with dismiss
 *   const dismiss = loading("Uploading...");
 *   await uploadFile();
 *   dismiss();
 *   success("Upload complete!");
 *
 *   // Promise helper — shows loading → success/error automatically
 *   await promise(
 *     uploadFile(),
 *     { loading: "Uploading...", success: "Done!", error: "Upload failed" }
 *   );
 */

import { useCallback } from "react";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────────────────────────────────────
// Standard durations
// ─────────────────────────────────────────────────────────────────────────────
const DURATIONS = {
  success: 2500,
  error: 4000,
  warning: 3500,
  info: 2500,
};

const isSSR = () => typeof window === "undefined";

/**
 * useToast
 *
 * @returns {{
 *   success:  (message: string, options?: object) => void,
 *   error:    (message: string, options?: object) => void,
 *   warning:  (message: string, options?: object) => void,
 *   info:     (message: string, options?: object) => void,
 *   loading:  (message: string, options?: object) => () => void,
 *   promise:  (promise: Promise, messages: object, options?: object) => Promise,
 *   dismiss:  (toastId?: string) => void,
 * }}
 */
const useToast = () => {
  /**
   * success(message, options?)
   * Standard success toast — green, 2500ms, deduplicates by toastId.
   */
  const success = useCallback((message, options = {}) => {
    if (isSSR()) return;
    const { toastId, autoClose = DURATIONS.success, ...rest } = options;
    if (toastId) toast.dismiss(toastId);
    toast.success(message, { toastId, autoClose, ...rest });
  }, []);

  /**
   * error(message, options?)
   * Standard error toast — red, 4000ms (longer for readability).
   */
  const error = useCallback((message, options = {}) => {
    if (isSSR()) return;
    const { toastId, autoClose = DURATIONS.error, ...rest } = options;
    if (toastId) toast.dismiss(toastId);
    toast.error(message, { toastId, autoClose, ...rest });
  }, []);

  /**
   * warning(message, options?)
   * Standard warning toast — yellow, 3500ms.
   */
  const warning = useCallback((message, options = {}) => {
    if (isSSR()) return;
    const { toastId, autoClose = DURATIONS.warning, ...rest } = options;
    if (toastId) toast.dismiss(toastId);
    toast.warning(message, { toastId, autoClose, ...rest });
  }, []);

  /**
   * info(message, options?)
   * Standard info toast — blue, 2500ms.
   */
  const info = useCallback((message, options = {}) => {
    if (isSSR()) return;
    const { toastId, autoClose = DURATIONS.info, ...rest } = options;
    if (toastId) toast.dismiss(toastId);
    toast.info(message, { toastId, autoClose, ...rest });
  }, []);

  /**
   * loading(message, options?)
   * Shows a persistent loading toast. Returns a dismiss function.
   * Call dismiss() when the async operation completes.
   *
   * @returns {() => void} dismiss function
   */
  const loading = useCallback((message, options = {}) => {
    if (isSSR()) return () => {};
    const { toastId, ...rest } = options;
    const id = toast.loading(message, { toastId, ...rest });
    return () => toast.dismiss(id);
  }, []);

  /**
   * promise(promise, messages, options?)
   * Wraps a promise — shows loading → success/error automatically.
   *
   * @param {Promise}  thePromise
   * @param {object}   messages   { loading, success, error }
   * @param {object}   [options]
   * @returns {Promise} the original promise (re-throws on rejection)
   */
  const promise = useCallback(async (thePromise, messages = {}, options = {}) => {
    if (isSSR()) return thePromise;
    return toast.promise(thePromise, {
      pending: messages.loading ?? "Loading...",
      success: messages.success ?? "Done!",
      error: messages.error ?? "Something went wrong.",
    }, options);
  }, []);

  /**
   * dismiss(toastId?)
   * Dismiss a specific toast by ID, or all toasts if no ID given.
   */
  const dismiss = useCallback((toastId) => {
    if (isSSR()) return;
    toast.dismiss(toastId);
  }, []);

  return { success, error, warning, info, loading, promise, dismiss };
};

export default useToast;
