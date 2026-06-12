/**
 * @fileoverview useArrowKeyNavigation - Arrow key grid navigation hook
 * @module hooks/useArrowKeyNavigation
 */
import { useCallback, useRef } from "react";

/**
 * useArrowKeyNavigation - Custom hook for arrow key grid navigation.
 *
 * Enables keyboard users to navigate a grid of focusable items using
 * arrow keys, Home, End, and wrapping behavior.
 *
 * @param {Object} options
 * @param {string} [options.selector] - CSS selector for focusable items (default: "[data-nav-item]")
 * @param {boolean} [options.wrap] - Whether to wrap around at edges (default: true)
 * @returns {{ containerRef: React.RefObject, onKeyDown: Function }}
 *
 * Usage:
 *   const { containerRef, onKeyDown } = useArrowKeyNavigation();
 *   <div ref={containerRef} onKeyDown={onKeyDown}>
 *     <button data-nav-item>Item 1</button>
 *     <button data-nav-item>Item 2</button>
 *   </div>
 */
export default function useArrowKeyNavigation({ selector = "[data-nav-item]", wrap = true } = {}) {
  const containerRef = useRef(null);

  const onKeyDown = useCallback(
    (e) => {
      const container = containerRef.current;
      if (!container) return;

      const items = Array.from(container.querySelectorAll(selector));
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement);
      let nextIndex = -1;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < 0) {
            nextIndex = 0;
          } else if (currentIndex < items.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (wrap) {
            nextIndex = 0;
          }
          break;

        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex < 0) {
            nextIndex = items.length - 1;
          } else if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (wrap) {
            nextIndex = items.length - 1;
          }
          break;

        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;

        case "End":
          e.preventDefault();
          nextIndex = items.length - 1;
          break;

        default:
          return;
      }

      if (nextIndex >= 0 && nextIndex < items.length) {
        items[nextIndex].focus();
      }
    },
    [selector, wrap]
  );

  return { containerRef, onKeyDown };
}
