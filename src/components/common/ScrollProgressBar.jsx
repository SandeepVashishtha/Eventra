import { useEffect, useRef } from "react";

const ScrollProgressBar = () => {
  // 🔥 FIX 1: Remove state entirely. Use a ref to directly mutate the DOM.
  // This stops React from re-rendering the component 60 times a second on scroll.
  const progressBarRef = useRef(null);

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    let ticking = false;
    let rafId = null;

    const updateProgress = () => {
      if (!progressBarRef.current) return;

      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollableHeight = documentHeight - windowHeight;

      // Prevent division by zero if the page is shorter than the viewport
      if (scrollableHeight <= 0) {
        progressBarRef.current.style.width = "0%";
        ticking = false;
        return;
      }

      const progress = (scrollTop / scrollableHeight) * 100;

      // Directly manipulate the DOM for zero-render performance
      progressBarRef.current.style.width = `${progress}%`;
      ticking = false;
    };

    const handleUpdate = () => {
      // 🔥 FIX 2: Use requestAnimationFrame to throttle DOM writes 
      // to the screen's refresh rate
      if (!ticking) {
        rafId = window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // 🔥 FIX 3: Mark listeners as passive for scroll performance
    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate, { passive: true });

    // 🔥 FIX 4: Track internal layout shifts (accordions, lazy images) 
    // to ensure the math stays perfectly synced
    const resizeObserver = new ResizeObserver(() => {
      handleUpdate();
    });
    resizeObserver.observe(document.body);

    // Initial calculation
    handleUpdate();

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      resizeObserver.disconnect();
      // 🔥 FIX 5: Prevent memory leaks by cancelling pending frames
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    // 🔥 FIX 6: Added pointer-events-none so it doesn't intercept clicks
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent pointer-events-none">
      <div
        ref={progressBarRef}
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75 ease-out shadow-md"
        style={{ width: "0%" }}
      />
    </div>
  );
};

export default ScrollProgressBar;