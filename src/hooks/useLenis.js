import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Custom hook to initialize and manage Lenis smooth scrolling
 * @param {Object} options - Lenis configuration options
 * @returns {Lenis|null} - Lenis instance or null
 */
const useLenis = (options = {}) => {
  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, [options]);

  return null;
};

export default useLenis;
