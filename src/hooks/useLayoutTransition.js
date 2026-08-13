import { useState, useEffect } from "react";

export default function useLayoutTransition(coords = { x: 0, y: 0 }) {
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 150); // Debounce animations and reflow checks

    return () => clearTimeout(timer);
  }, [coords.x, coords.y]);

  return transitioning;
}
