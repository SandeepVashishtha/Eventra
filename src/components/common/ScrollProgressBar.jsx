import { useEffect, useRef } from "react";

const ScrollProgressBar = () => {
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
      // Throttle DOM writes to the screen's refresh rate
      if (!ticking) {
        rafId = window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Passive listeners for scroll and window resizing
    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate, { passive: true });

    // 🔥 FIX: Track internal layout shifts (accordions, lazy images) 
    // to ensure the math stays perfectly synced even if the user isn't scrolling
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
      // 🔥 FIX: Prevent unmounted memory leaks by cancelling pending frames
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    // 🔥 FIX: Added pointer-events-none so it doesn't intercept clicks
    <div className="pointer-events-none fixed top-0 left-0 z-[9999] h-1 w-full bg-transparent">
      <div
        ref={progressBarRef}
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md transition-all duration-75 ease-out"
        style={{ width: "0%" }}
      />
    </div>
  );
};

export default ScrollProgressBar;