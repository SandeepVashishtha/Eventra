import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Custom React hook to initialize, configure, and manage a Lenis smooth scrolling instance.
 *
 * ### Purpose
 * Enables premium, performance-optimized smooth scrolling capabilities across the application.
 * It sets up the Lenis requestAnimationFrame loop and registers the global window handler.
 *
 * ### Behavior & Touch Device Safeguard
 * To preserve native OS-level scrolling feel, the hook checks if the primary pointer is coarse
 * (e.g., touch-based screens like mobile devices or tablets). If detected, it bypasses Lenis
 * initialization completely to avoid interfering with native kinetic scrolling behavior.
 *
 * ### Lifecycle & Cleanup
 * - On mount (or when initialized): Registers a `requestAnimationFrame` animation loop and attaches
 *   the instance to `window.lenis` so other utilities can easily reference it.
 * - On unmount: Automatically cancels the running animation frame loop, invokes `lenis.destroy()`
 *   to clean up event listeners, and resets `window.lenis` to `null` to prevent memory leaks.
 *
 * ### Dependency Caveat
 * The hook's dependency array is empty `[]`, meaning it initializes once on mount. The `options`
 * parameter is intentionally excluded from the dependencies. If options change dynamically,
 * you should pass a stable, memoized object from the calling component.
 *
 * @param {Object} [options={}] - Custom configuration parameters to override or extend the Lenis default settings.
 * @param {number} [options.duration=1.2] - Duration of the scroll animation in seconds.
 * @param {function} [options.easing] - Timing function determining the scroll velocity curve. Defaults to a custom exponential ease-out curve.
 * @param {string} [options.direction='vertical'] - Main scroll orientation ('vertical' or 'horizontal').
 * @param {string} [options.gestureDirection='vertical'] - Orientation of gestures to recognize ('vertical', 'horizontal', or 'both').
 * @param {boolean} [options.smooth=true] - Whether smooth scrolling is enabled.
 * @param {number} [options.mouseMultiplier=1] - Sensitivity factor for mouse wheel scrolling events.
 * @param {boolean} [options.smoothTouch=false] - Whether smooth scrolling is enabled for touch inputs.
 * @param {number} [options.touchMultiplier=2] - Sensitivity factor for touch swipe events.
 * @param {boolean} [options.infinite=false] - Enables infinite scroll looping behavior.
 * @returns {void} This hook does not return any value.
 *
 * @example
 * import React from 'react';
 * import useLenis from './hooks/useLenis';
 *
 * const AppLayout = ({ children }) => {
 *   // Initialize smooth scrolling with default settings
 *   useLenis();
 *
 *   return <div className="layout">{children}</div>;
 * };
 *
 * @example
 * import React, { useMemo } from 'react';
 * import useLenis from './hooks/useLenis';
 *
 * const CustomPage = () => {
 *   // Stable options object to pass into the hook
 *   const lenisOptions = useMemo(() => ({
 *     duration: 1.2,
 *     mouseMultiplier: 1.2,
 *     smoothTouch: false
 *   }), []);
 *
 *   useLenis(lenisOptions);
 *
 *   return <div>My Content</div>;
 * };
 */
const useLenis = (options = {}) => {
  useEffect(() => {
    // Check if the primary pointer is coarse (touch device) to preserve native feel
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
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
