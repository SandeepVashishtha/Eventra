import { useState, useEffect, useRef } from 'react';

/**
 * Cubic ease-out function.
 * Progress 0→1 maps to eased value 0→1, decelerating towards the end.
 *
 * @param {number} t - Linear progress [0, 1]
 * @returns {number} Eased progress [0, 1]
 */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * useCountUp — animates a numeric counter from 0 to `end` over `duration` ms.
 *
 * Uses a single requestAnimationFrame loop (not setInterval) so:
 *   - Only one rAF callback is registered per hook instance.
 *   - React's automatic batching groups all resulting setState calls in a single
 *     reconciler pass when multiple counters animate simultaneously.
 *   - The animation naturally pauses when the tab is hidden (browser throttles rAF).
 *   - cancelAnimationFrame is called on unmount — no timer leaks.
 *
 * The counter will not start until `shouldStart` is true (default: true), enabling
 * IntersectionObserver-based lazy starts without extra hooks at the call site.
 *
 * @param {number}  end           - Target integer value
 * @param {number}  [duration=1200] - Animation duration in milliseconds
 * @param {boolean} [shouldStart=true] - Set to false to delay start until visible
 * @returns {number} Current animated count value
 */
const useCountUp = (end, duration = 1200, shouldStart = true) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const target = typeof end === 'number' && Number.isFinite(end) ? Math.round(end) : 0;

    if (target === 0 || !shouldStart) {
      setCount(target);
      return;
    }

    // Reset start time so the animation always begins from the current frame
    startTimeRef.current = null;

    const tick = (now) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(rawProgress);

      setCount(Math.round(easedProgress * target));

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [end, duration, shouldStart]);

  return count;
};

export default useCountUp;
