import { useState, useRef, useMemo, useEffect } from "react";

export default function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef();
  const end = useMemo(() => {
    const end = typeof value === "string" ? parseInt(value, 10) : value;
    return isNaN(end) ? 0 : end;
  }, [value]);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  return <span aria-live="polite">{count.toLocaleString()}</span>;
}
