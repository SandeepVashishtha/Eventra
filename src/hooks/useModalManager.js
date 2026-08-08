/**
 * useModalManager.js
 *
 * Centralised hook combining the three concerns every modal needs:
 *   1. Escape key handler
 *   2. Scroll lock (via useScrollLock)
 *   3. Focus trap + focus restoration
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * Every modal/dialog in the codebase duplicated the same 3 concerns:
 *
 *   Escape key:  100 instances of addEventListener("keydown") checking
 *                event.key === "Escape" — each registered separately,
 *                none coordinated (multiple modals stacked = multiple
 *                handlers firing on one Escape press)
 *
 *   Scroll lock: 14 instances of document.body.style.overflow = "hidden"
 *                with inconsistent restoration (now fixed by useScrollLock)
 *
 *   Focus trap:  useFocusTrap hook exists but is only used in ShareModal —
 *                20+ other modals implement their own tab-cycling manually
 *
 * FEATURES
 * --------
 *  1. Escape key        — single global listener per modal, fires onClose
 *  2. Scroll lock       — delegates to useScrollLock (iOS-safe)
 *  3. Focus trap        — cycles Tab/Shift+Tab within modal
 *  4. Focus restoration — returns focus to the element that triggered the modal
 *  5. Initial focus     — focuses the first focusable element on open
 *  6. aria-hidden       — marks the rest of the page aria-hidden when modal open
 *
 * USAGE
 * -----
 *   const { modalRef } = useModalManager(isOpen, onClose);
 *   <div ref={modalRef} role="dialog" aria-modal="true">...</div>
 *
 *   // With options
 *   const { modalRef } = useModalManager(isOpen, onClose, {
 *     initialFocusRef: cancelButtonRef,  // focus this element on open
 *     disableScrollLock: false,          // default false
 *     disableEscapeKey: false,           // default false
 *   });
 */

import { useEffect, useRef, useCallback } from "react";
import useScrollLock from "./useScrollLock";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * useModalManager
 *
 * @param {boolean}        isOpen             Whether the modal is open
 * @param {Function}       onClose            Called when Escape is pressed
 * @param {object}         [options]
 * @param {React.RefObject}[options.initialFocusRef]    Element to focus on open
 * @param {boolean}        [options.disableScrollLock]  Skip scroll lock (default false)
 * @param {boolean}        [options.disableEscapeKey]   Skip Escape handler (default false)
 * @param {boolean}        [options.disableFocusTrap]   Skip focus trap (default false)
 *
 * @returns {{ modalRef: React.RefObject }}
 */
const useModalManager = (isOpen, onClose, {
  initialFocusRef,
  disableScrollLock = false,
  disableEscapeKey = false,
  disableFocusTrap = false,
} = {}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useScrollLock(isOpen && !disableScrollLock);

  // ── Focus management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Save the element that triggered the modal so we can restore focus on close
    previousFocusRef.current = document.activeElement;

    // Focus the initial element (custom ref or first focusable in modal)
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      // Restore focus to the triggering element when modal closes
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, initialFocusRef]);

  // ── Focus trap ─────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((event) => {
    if (!isOpen) return;

    // Escape key — close the modal
    if (!disableEscapeKey && event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    // Tab key — trap focus within modal
    if (!disableFocusTrap && event.key === "Tab" && modalRef.current) {
      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, [isOpen, onClose, disableEscapeKey, disableFocusTrap]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // ── aria-hidden on app root ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.getElementById("root");
    if (!root) return;

    if (isOpen) {
      root.setAttribute("aria-hidden", "true");
    } else {
      root.removeAttribute("aria-hidden");
    }

    return () => root.removeAttribute("aria-hidden");
  }, [isOpen]);

  return { modalRef };
};

export default useModalManager;
