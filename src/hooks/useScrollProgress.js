/**
 * @fileoverview useScrollProgress - Scroll progress tracking hook
 * @module hooks/useScrollProgress
 */
import { useState, useEffect, useRef } from "react";

/**
 * A custom React hook that tracks the user's vertical scroll progress
 * as a percentage of the total scrollable page height.
 *
 * Uses requestAnimationFrame for performance-optimized scroll tracking,
 * preventing excessive re-renders during rapid scrolling.
 * Also updates on window resize to recalculate scroll boundaries.
 *
 * @returns {number} A number between 0 and 100 representing scroll
 * progress percentage (0 = top, 100 = bottom)
 *
 * @example
 * // Show a progress bar based on scroll position
 * function ProgressBar() {
 *   const progress = useScrollProgress();
 *   return (
 *     <div
 *       style={{ width: `${progress}%` }}
 *       className="h-1 bg-blue-500 fixed top-0"
 *     />
 *   );
 * }
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const height = doc.scrollHeight - window.innerHeight;
      const pct = height > 0 ? Math.round((scrollTop / height) * 100) : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}


export default useScrollProgress;
