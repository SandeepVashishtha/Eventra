import { useEffect, useRef } from 'react';

/**
 * useFocusTrap — traps keyboard focus within a container while active.
 * Returns a ref to attach to the container element.
 *
 * Usage:
 *   const trapRef = useFocusTrap(isOpen);
 *   <div ref={trapRef} role="dialog" ...>...</div>
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(isActive) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Store element that had focus before modal opened
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus first focusable element in modal
    const focusable = container.querySelectorAll(FOCUSABLE_SELECTORS);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusableElements = Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTORS)
      );
      
      if (focusableElements.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      // 🔥 FIX: If focus somehow escapes the container (e.g. user clicked the background),
      // aggressively pull it back into the trap on the next Tab press.
      if (!container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // 🔥 FIX: Listen on 'document', not 'container'. If focus drops to the body,
    // container.addEventListener will never catch the Tab key because it doesn't bubble!
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to trigger element when modal closes
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}