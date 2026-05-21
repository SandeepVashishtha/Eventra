import React from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const TRANSITION = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] };

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Wraps route content with a short fade/slide on pathname change.
 * Respects prefers-reduced-motion (also aligned with MotionConfig in index.js).
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotionVariants : pageVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={TRANSITION}
        className="min-h-[inherit] w-full"
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
