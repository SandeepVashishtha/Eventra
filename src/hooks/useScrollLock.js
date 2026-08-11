/**
 * useScrollLock.js
 *
 * iOS-safe scroll lock hook that preserves the original overflow value.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * `document.body.style.overflow = "hidden"` was duplicated across 14+
 * components, each with different (and often buggy) restoration logic:
 *
 *   useBodyScrollLock (navbar)   — resets to "auto" ❌ breaks pages with
 *                                  overflow:scroll or overflow:visible
 *   ShareModal.jsx               — resets to ""      ❌ loses original value
 *   CommandPalette.jsx           — resets to ""      ❌ same bug
 *   ConfirmationModal.js         — correctly saves original BUT
 *                                  doesn't handle iOS scroll position jump
 *   EventConflictModal.jsx       — correctly saves original (best existing)
 *   CommunityEvent.js            — correctly saves original
 *   QRTicketModal.jsx            — correctly saves original
 *
 * ADDITIONAL iOS ISSUE
 * --------------------
 * On iOS Safari, `overflow:hidden` on body does not prevent scrolling.
 * The correct fix is to also set `position:fixed` + `top:-${scrollY}px`
 * and restore `window.scrollTo(0, scrollY)` on unlock. Without this,
 * the background jumps to the top when the modal closes.
 *
 * USAGE
 * -----
 *   // Basic — lock when modal is open
 *   useScrollLock(isOpen);
 *
 *   // With iOS fix enabled (default: true)
 *   useScrollLock(isOpen, { iosFix: true });
 *
 *   // Disable iOS fix (e.g. for non-modal drawers)
 *   useScrollLock(isOpen, { iosFix: false });
 */

import { useEffect, useRef } from "react";

/**
 * Detect iOS Safari — requires the position:fixed workaround
 */
const isIOS = () =>
  typeof window !== "undefined" &&
  /iP(ad|hone|od)/.test(navigator.userAgent) &&
  !window.MSStream;

/**
 * useScrollLock
 *
 * @param {boolean} locked        Whether the scroll should be locked
 * @param {object}  [options]
 * @param {boolean} [options.iosFix=true]  Apply iOS Safari position:fixed workaround
 */
const useScrollLock = (locked, { iosFix = true } = {}) => {
  // Track nesting — multiple modals can stack, only the outermost should unlock
  const lockCountRef = useRef(0);

  useEffect(() => {
    // SSR guard
    if (typeof document === "undefined") return;
    if (!locked) return;

    lockCountRef.current += 1;

    // Save original styles before modifying anything
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // Save scroll position before locking (needed for iOS restore)
    const scrollY = window.scrollY;

    if (iosFix && isIOS()) {
      // iOS Safari fix: position:fixed prevents rubber-band scroll bleed-through
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "hidden";
    }

    return () => {
      lockCountRef.current = Math.max(0, lockCountRef.current - 1);

      // Only unlock when the last lock is removed
      if (lockCountRef.current > 0) return;

      if (iosFix && isIOS()) {
        // Restore all properties for iOS
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;

        // Restore scroll position (iOS jumps to top without this)
        window.scrollTo(0, scrollY);
      } else {
        // Fix: restore to original value, NOT "auto" or ""
        // Previous implementations using "auto" broke pages that had
        // overflow:scroll, and "" failed to restore explicit overflow values.
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [locked, iosFix]);
};

export default useScrollLock;