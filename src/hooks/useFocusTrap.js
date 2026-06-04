/**
 * @fileoverview useFocusTrap - Accessible focus trap hook for dialogs and drawers
 * @module hooks/useFocusTrap
 */
import { useEffect, useRef, useCallback } from 'react';

/**
 * useFocusTrap
 *
 * Traps keyboard focus inside the given container element while it is active,
 * and restores focus to the previously-focused element when deactivated.
 *
 * WCAG 2.1 SC 2.1.2 (No Keyboard Trap) requires that focus can be moved *out*
 * of a component only through a documented mechanism (e.g. Escape key or a
 * close button), not accidentally via Tab.
 *
 * @param {boolean} isActive - Whether the trap is currently active.
 * @param {Function} [onEscape] - Optional callback invoked when the user
 *   presses the Escape key.  Typically used to close the dialog/drawer.
 * @returns {{ containerRef: React.RefObject }} – attach `containerRef` to the
 *   root element of the dialog / drawer.
 *
 * @example
 * const { containerRef } = useFocusTrap(isOpen, () => setIsOpen(false));
 * return <div ref={containerRef} role="dialog" aria-modal="true"> … </div>;
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
  'audio[controls]',
  'video[controls]',
].join(', ');

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[inert]') && getComputedStyle(el).display !== 'none'
  );
}

export function useFocusTrap(isActive, onEscape) {
  const containerRef = useRef(null);
  containerRef.containerRef = containerRef;

  // Remember the element that was focused before the trap activated so we can
  // restore it on close.
  const previousFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isActive || !containerRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (typeof onEscape === 'function') {
          onEscape();
        }
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        // Shift+Tab: wrap from first → last
        if (active === first || !containerRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: wrap from last → first
        if (active === last || !containerRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isActive, onEscape]
  );

  useEffect(() => {
    if (!isActive) return;

    // Save the element that had focus before the trap opened.
    previousFocusRef.current = document.activeElement;

    // Move focus inside the container as soon as it becomes active.
    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length > 0) {
      // Small timeout ensures the element is fully painted / transitioned.
      const id = setTimeout(() => focusable[0].focus(), 0);
      return () => clearTimeout(id);
    }
  }, [isActive]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Restore focus when the trap deactivates (dialog/drawer closes).
  useEffect(() => {
    if (isActive) return;
    const el = previousFocusRef.current;
    if (el && typeof el.focus === 'function') {
      // Next tick so the DOM has settled after unmounting overlay elements.
      const id = setTimeout(() => previousFocusRef.current.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [isActive]);

  return containerRef;
}