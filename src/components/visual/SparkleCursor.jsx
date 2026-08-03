// SparkleCursor.jsx
// Small particle sparkles emitted on mouse movement and click.
// No WebGL — pure Canvas 2D. Respects prefers-reduced-motion
// and is automatically disabled on touch/mobile devices.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const COLORS = ["#818cf8", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"];
const MAX_PARTICLES = 120;
const SPAWN_RATE = 3;           // particles per mousemove event
const CLICK_BURST = 12;         // extra particles on click

const randomBetween = (a, b) => a + Math.random() * (b - a);

const createParticle = (x, y) => ({
  x,
  y,
  vx: randomBetween(-2, 2),
  vy: randomBetween(-3, -0.5),
  alpha: 1,
  size: randomBetween(3, 7),
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  decay: randomBetween(0.018, 0.035),
});

const SparkleCursor = ({ enabled }) => {
  const canvasRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
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

    const spawnAt = (x, y, count = SPAWN_RATE) => {
      for (let i = 0; i < count; i++) {
        if (particlesRef.current.length < MAX_PARTICLES) {
          particlesRef.current.push(createParticle(x, y));
        }
      }
    };

    const onMouseMove = (e) => spawnAt(e.clientX, e.clientY);
    const onClick = (e) => spawnAt(e.clientX, e.clientY, CLICK_BURST);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        // Draw a 4-pointed star
        const s = p.size;
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + s * 0.3, p.y - s * 0.3);
        ctx.lineTo(p.x + s, p.y);
        ctx.lineTo(p.x + s * 0.3, p.y + s * 0.3);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - s * 0.3, p.y + s * 0.3);
        ctx.lineTo(p.x - s, p.y);
        ctx.lineTo(p.x - s * 0.3, p.y - s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.alpha -= p.decay;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
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

export default SparkleCursor;