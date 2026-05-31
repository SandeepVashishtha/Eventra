import React, { useEffect, useRef } from "react";

const ScrollProgressBar = () => {
  // 🔥 FIX 1: Remove state entirely. Use a ref to directly mutate the DOM.
  // This stops React from re-rendering the component 60 times a second on scroll.
  const progressBarRef = useRef(null);

  useEffect(() => {
    let ticking = false;

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

    const handleScroll = () => {
      // 🔥 FIX 2: Use requestAnimationFrame to throttle DOM writes to the screen's refresh rate
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // 🔥 FIX 3: Mark listener as passive so it doesn't block the browser's main scroll thread
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent">
      <div
        ref={progressBarRef}
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75 ease-out shadow-md"
        style={{ width: "0%" }}
      />
    </div>
  );
};

export default ScrollProgressBar;