import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Route-type based transition picker
const getVariants = (pathname) => {
  if (["/login", "/signup", "/auth"].some((p) => pathname.startsWith(p))) {
    // Slide up for auth pages
    return {
      initial: { opacity: 0, y: 24, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -16, scale: 0.98 },
    };
  }
  if (pathname.startsWith("/events/") || pathname.startsWith("/hackathons/")) {
    // Slide in from right for detail pages
    return {
      initial: { opacity: 0, x: 32 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -32 },
    };
  }
  if (pathname.startsWith("/dashboard")) {
    // Fade + slight scale for dashboard
    return {
      initial: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.01 },
    };
  }
  // Default: smooth fade + subtle slide
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const getTransition = (pathname) => {
  if (pathname.startsWith("/events/") || pathname.startsWith("/hackathons/")) {
    return { duration: 0.28, ease: [0.32, 0, 0.67, 0] };
  }
  return { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] };
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? reducedMotionVariants : getVariants(location.pathname);

  const transition = prefersReducedMotion ? { duration: 0.15 } : getTransition(location.pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className="min-h-[inherit] w-full"
        style={{
          willChange: "opacity, transform",
          transform: "translateZ(0)", // GPU acceleration
          backfaceVisibility: "hidden", // Prevent flicker
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
