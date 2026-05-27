import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Custom hook to initialize and manage Lenis smooth scrolling
 * @param {Object} options - Lenis configuration options
 * @returns {Lenis|null} - Lenis instance or null
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
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      ...options,
    });

    // Expose Lenis instance globally for utility functions
    window.lenis = lenis;

    // Request animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Add scroll listener for synchronization and visibility
    lenis.on('scroll', ({ velocity, isScrolling }) => {
      // Add data attributes to body for global scroll state
      if (document.body) {
        document.body.setAttribute('data-scrolling', isScrolling ? 'true' : 'false');
        // Set high-speed flag for fast scrolling (fade out overlays)
        document.body.setAttribute('data-fast-scroll', Math.abs(velocity) > 1.5 ? 'true' : 'false');
      }
    });

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, [options]);

  return null;
};

export default useLenis;
