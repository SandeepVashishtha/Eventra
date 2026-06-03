import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Custom hook to initialize and manage Lenis smooth scrolling.
 * @param {Object} options - Lenis configuration options
 */
const useLenis = (options = {}) => {
  useEffect(() => {
    // Check if the primary pointer is coarse (touch device) to preserve native feel
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) {
      return;
    }

    // Initialize Lenis with custom options
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      ...options,
    });

    // Expose instance globally so utility functions (e.g. scroll-to helpers) can access it
    window.lenis = lenis;

    // FIX: Track the rAF id so we can cancel it on unmount.
    // The original code called requestAnimationFrame(raf) recursively but never
    // cancelled it — the loop kept running after the component unmounted,
    // calling lenis.raf() on a destroyed instance and leaking memory.
    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.lenis = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // NOTE: options is intentionally excluded from deps — Lenis is initialized
  // once on mount. If you need to react to option changes, pass a stable
  // memoized object from the call site.
};

export default useLenis;
