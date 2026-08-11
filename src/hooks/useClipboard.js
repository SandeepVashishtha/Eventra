/**
 * useClipboard.js
 *
 * Enhanced clipboard hook that replaces raw navigator.clipboard calls
 * scattered across 10+ components with a single, robust implementation.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * The existing useCopyToClipboard hook existed but was bypassed in 10+
 * components, each implementing their own clipboard logic with varying
 * levels of robustness:
 *
 *   - EventDetails.js          — no execCommand fallback, uses alert()
 *   - QRTicketModal.jsx        — has fallback but 40 lines of boilerplate
 *   - SocialShareButtons.jsx   — no fallback, fails silently on HTTP
 *   - WorkspaceBootstrapModal  — no fallback, no error handling
 *   - EventsTab.js             — duplicate fallback implementation
 *   - AiProfileGeneratorModal  — no fallback
 *   - TicketQRCode.jsx         — no fallback
 *   - ErrorBoundary.jsx        — no fallback
 *   - EventRegistration.js     — inconsistent fallback
 *   - IPFSArchiveManager.jsx   — synchronous execCommand only
 *
 * FEATURES
 * --------
 *  1. Modern Clipboard API  — uses navigator.clipboard.writeText() when available
 *  2. execCommand fallback  — works on HTTP (insecure) contexts and old browsers
 *  3. Per-key copied state  — supports multiple copy buttons on the same page,
 *                             each with independent "Copied!" feedback
 *  4. Auto-reset            — configurable reset delay (default 2500ms)
 *  5. Error handling        — returns success boolean, never throws
 *  6. SSR safe             — guards all browser API access
 *
 * USAGE
 * -----
 *   // Single copy button
 *   const { copy, isCopied } = useClipboard();
 *   <button onClick={() => copy(url)}>{isCopied() ? "Copied!" : "Copy"}</button>
 *
 *   // Multiple independent copy buttons
 *   const { copy, isCopied } = useClipboard();
 *   <button onClick={() => copy(url, "share")}>
 *     {isCopied("share") ? "Copied!" : "Copy Link"}
 *   </button>
 *   <button onClick={() => copy(token, "token")}>
 *     {isCopied("token") ? "Copied!" : "Copy Token"}
 *   </button>
 */

import { useState, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// execCommand fallback (for HTTP contexts and legacy browsers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Copy text using the legacy execCommand approach.
 * Creates a temporary off-screen textarea, selects its content, and
 * executes the browser copy command.
 *
 * @param {string} text
 * @returns {boolean} Whether the copy succeeded
 */
const execCommandCopy = (text) => {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;

  // Position off-screen so it doesn't cause layout shift or scroll jump
  textarea.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";

  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    return success;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useClipboard
 *
 * @param {object} [options]
 * @param {number} [options.resetMs=2500]  How long "Copied!" state persists (ms)
 *
 * @returns {{
 *   copy:     (text: string, key?: string) => Promise<boolean>,
 *   isCopied: (key?: string) => boolean,
 *   error:    string | null,
 * }}
 */
const useClipboard = ({ resetMs = 2500 } = {}) => {
  // Map of key → true, where key defaults to "__default__" for single-button usage
  const [copiedKeys, setCopiedKeys] = useState({});
  const [error, setError] = useState(null);

  // Track reset timers so we can clear them on unmount
  const timersRef = useRef({});

  /**
   * copy(text, key?)
   *
   * Copies `text` to the clipboard. Tries the modern Clipboard API first,
   * falls back to execCommand for HTTP contexts and legacy browsers.
   *
   * @param {string}  text  The text to copy
   * @param {string}  [key="__default__"]  Identifier for this button's copied state
   * @returns {Promise<boolean>}  true if copy succeeded
   */
  const copy = useCallback(
    async (text, key = "__default__") => {
      setError(null);

      let success = false;

      // ── Strategy 1: Modern Clipboard API ──────────────────────────────────
      // Available in secure contexts (HTTPS) and modern browsers.
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText &&
        (typeof window === "undefined" || window.isSecureContext)
      ) {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch (err) {
          // Clipboard API failed (e.g. permissions denied) — fall through
          console.warn("[useClipboard] Clipboard API failed, trying execCommand:", err.message);
        }
      }

      // ── Strategy 2: execCommand fallback ─────────────────────────────────
      // Works on HTTP and older browsers that don't support Clipboard API.
      if (!success) {
        success = execCommandCopy(text);
      }

      if (success) {
        // Clear any existing reset timer for this key
        if (timersRef.current[key]) {
          clearTimeout(timersRef.current[key]);
        }

        setCopiedKeys((prev) => ({ ...prev, [key]: true }));

        timersRef.current[key] = setTimeout(() => {
          setCopiedKeys((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          delete timersRef.current[key];
        }, resetMs);
      } else {
        setError("Failed to copy. Please copy manually.");
      }

      return success;
    },
    [resetMs]
  );

  /**
   * isCopied(key?)
   *
   * Returns true if the copy with the given key is in its "Copied!" window.
   * Use without a key for single-button usage.
   *
   * @param {string} [key="__default__"]
   * @returns {boolean}
   */
  const isCopied = useCallback(
    (key = "__default__") => !!copiedKeys[key],
    [copiedKeys]
  );

  return { copy, isCopied, error };
};

export default useClipboard;
