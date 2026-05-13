import { motion } from "framer-motion";

/**
 * PageTransition – wraps every route element to provide
 * a smooth fade + slide-up entrance and a quick fade-out exit.
 *
 * Kept intentionally lightweight:
 *   • opacity  : avoids a blank-white flash between pages
 *   • translateY: gives a subtle "lift" that feels native
 *   • No layout shifts – uses will-change & translateZ(0) for GPU compositing
 */

const variants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: {
      duration: 0.28,
      ease: [0.55, 0.06, 0.68, 0.19], // ease-in-quad
    },
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      className="page-transition-wrapper"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
