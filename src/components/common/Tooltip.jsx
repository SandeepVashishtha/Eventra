import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/**
 * Tooltip Component
 * 
 * A highly customizable and accessible tooltip using Framer Motion and React Portal.
 */
const Tooltip = ({ 
  children, 
  content, 
  position = "top", 
  delay = 300,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  let timer;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top;

    if (position === "bottom") y = rect.bottom;
    if (position === "left") {
      x = rect.left;
      y = rect.top + rect.height / 2;
    }
    if (position === "right") {
      x = rect.right;
      y = rect.top + rect.height / 2;
    }

    setCoords({ x, y });
    timer = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timer);
    setIsVisible(false);
  };

  const positionVariants = {
    top: { top: coords.y - 10, left: coords.x, x: "-50%", y: "-100%" },
    bottom: { top: coords.y + 10, left: coords.x, x: "-50%", y: "0%" },
    left: { top: coords.y, left: coords.x - 10, x: "-100%", y: "-50%" },
    right: { top: coords.y, left: coords.x + 10, x: "0%", y: "-50%" }
  };

  const arrowVariants = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700",
    left: "right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700",
    right: "left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700"
  };

  return (
    <div 
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed",
              pointerEvents: "none",
              zIndex: 9999,
              ...positionVariants[position]
            }}
            className={`px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap ${className}`}
          >
            {content}
            <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowVariants[position]}`} />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
