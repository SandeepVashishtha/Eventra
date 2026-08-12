/**
 * useCarouselKeyboardNav
 *
 * Adds full keyboard navigation to any carousel/slider component.
 *
 * Key bindings (when a carousel element is focused):
 *   ArrowLeft  → previous slide
 *   ArrowRight → next slide
 *   Home       → jump to first slide
 *   End        → jump to last slide
 *   Space/Enter→ pause / resume auto-play
 *
 * Usage:
 *   const { containerProps } = useCarouselKeyboardNav({
 *     onPrev,
 *     onNext,
 *     onFirst,
 *     onLast,
 *     onTogglePlay,
 *   });
 *   <div {...containerProps}>…</div>
 *
 * The caller must ensure `containerProps.tabIndex=0` so the container
 * is keyboard-focusable.
 */

import { useCallback } from "react";

/**
 * @param {Object}   opts
 * @param {Function} opts.onPrev        - Called to go to previous slide
 * @param {Function} opts.onNext        - Called to go to next slide
 * @param {Function} [opts.onFirst]     - Called to jump to the first slide
 * @param {Function} [opts.onLast]      - Called to jump to the last slide
 * @param {Function} [opts.onTogglePlay]- Called to toggle auto-play on Space/Enter
 * @returns {{ containerProps: Object }}
 */
export default function useCarouselKeyboardNav({
  onPrev,
  onNext,
  onFirst,
  onLast,
  onTogglePlay,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onPrev?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext?.();
          break;
        case "Home":
          e.preventDefault();
          onFirst?.();
          break;
        case "End":
          e.preventDefault();
          onLast?.();
          break;
        case " ":
        case "Enter":
          // Only toggle play if the carousel container itself is focused,
          // not when a child button (like a card CTA) receives the event.
          if (e.target === e.currentTarget) {
            e.preventDefault();
            onTogglePlay?.();
          }
          break;
        default:
          break;
      }
    },
    [onPrev, onNext, onFirst, onLast, onTogglePlay]
  );

  return {
    containerProps: {
      role: "region",
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      "aria-label": "Event carousel — use arrow keys to navigate",
    },
  };
}
