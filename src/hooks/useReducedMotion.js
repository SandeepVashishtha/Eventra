/**
 * @file useReducedMotion.js
 * @module hooks/useReducedMotion
 *
 * @description
 * Custom React hook that reads and reactively tracks the user's
 * `prefers-reduced-motion` accessibility preference via the
 * CSS Media Queries Level 5 API.
 *
 * The hook is safe to use in server-side rendering (SSR) environments:
 * it guards every access to `window` and `window.matchMedia` with
 * `typeof` checks, so it will not throw during Node.js / SSR execution.
 * In those environments the initial value defaults to `false` (motion
 * permitted), which is the least-surprising behaviour for a server render.
 */
import { useEffect, useState } from "react";

/**
 * Detects whether the user has requested reduced motion at the OS or
 * browser level, and re-renders the consuming component automatically
 * whenever that preference changes at runtime.
 *
 * Internally the hook evaluates the CSS media feature
 * `(prefers-reduced-motion: reduce)` using `window.matchMedia`. The
 * initial state is resolved synchronously inside the `useState` lazy
 * initialiser — avoiding a one-frame flash of un-reduced motion on
 * first render. A `change` event listener is then attached for the
 * lifetime of the component so that the returned value stays in sync
 * if the user updates their system preference while the page is open.
 *
 * **SSR / non-browser environments**
 * When `window` or `window.matchMedia` is unavailable the hook returns
 * `false` (motion permitted) and skips attaching the event listener.
 * No warnings or errors are produced.
 *
 * **Accessibility note**
 * The [WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions)](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
 * recommends disabling non-essential motion when this preference is set.
 * Use the returned flag to conditionally suppress animations, transitions,
 * parallax effects, and auto-playing carousels.
 *
 * @returns {boolean} `true` when the user's current system setting maps to
 *   `prefers-reduced-motion: reduce`; `false` when the media feature does
 *   not match or when `window.matchMedia` is unavailable (SSR, old browsers).
 *
 * @example
 * // Conditionally apply a CSS transition based on user preference
 * import { useReducedMotion } from "hooks/useReducedMotion";
 *
 * function AnimatedBanner() {
 *   const prefersReduced = useReducedMotion();
 *
 *   return (
 *     <div
 *       style={{
 *         transition: prefersReduced ? "none" : "transform 0.4s ease",
 *         transform: isVisible ? "translateY(0)" : "translateY(-20px)",
 *       }}
 *     >
 *       Welcome!
 *     </div>
 *   );
 * }
 *
 * @example
 * // Choose between a motion variant and a static variant of a component
 * import { useReducedMotion } from "hooks/useReducedMotion";
 * import MotionCard from "components/MotionCard";
 * import StaticCard from "components/StaticCard";
 *
 * function Card(props) {
 *   const prefersReduced = useReducedMotion();
 *   return prefersReduced ? <StaticCard {...props} /> : <MotionCard {...props} />;
 * }
 */
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  return prefersReduced;
}

export default useReducedMotion;
