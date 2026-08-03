// GlowCursor.jsx
// Lightweight glowing dot trail — no WebGL required.
// Follows the pointer with a CSS-animated radial glow and a short
// trail of fading ghost dots. Respects prefers-reduced-motion and
// is automatically disabled on touch/mobile devices.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const TRAIL_LENGTH = 8;        // number of ghost dots
const GLOW_SIZE = 28;          // px diameter of the main dot
const TRAIL_SIZE = 12;         // px diameter of trail dots
const TRAIL_DECAY = 0.12;      // opacity step per trail position

const GlowCursor = ({ enabled }) => {
  const canvasRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const positionsRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices or when reduced motion is preferred
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!enabled || prefersReducedMotion || isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Push current position into trail
      positionsRef.current.push({ ...mouseRef.current });
      if (positionsRef.current.length > TRAIL_LENGTH) {
        positionsRef.current.shift();
      }

      // Draw trail dots (oldest = most faded)
      positionsRef.current.forEach((pos, i) => {
        const alpha = (i / TRAIL_LENGTH) * TRAIL_DECAY * TRAIL_LENGTH;
        const size = TRAIL_SIZE * (i / TRAIL_LENGTH);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.5})`;
        ctx.fill();
      });

      // Draw main glow dot
      const { x, y } = mouseRef.current;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, GLOW_SIZE);
      grad.addColorStop(0, "rgba(129, 140, 248, 0.85)");
      grad.addColorStop(0.4, "rgba(99, 102, 241, 0.4)");
      grad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.beginPath();
      ctx.arc(x, y, GLOW_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, prefersReducedMotion]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default GlowCursor;