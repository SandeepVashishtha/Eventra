import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";
import useReducedMotion from "../hooks/useReducedMotion";

const FeedbackButton = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
      className={"fixed left-[1.625rem] z-[100] translate-y-1/2 bottom-6 fixed-floating-widget transition-opacity duration-300"}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Link
        to="/feedback"
        className="relative flex items-center justify-center p-3.5 bg-white text-black border border-black/15 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 group"
        // title="Share Feedback"
        aria-label="Share Feedback"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <FiMessageSquare className="text-2xl text-black" />
        </motion.div>

        <div className="pointer-events-none absolute left-full mr-3 whitespace-nowrap rounded-lg bg-white border border-black/15 px-3 py-2 text-sm text-black opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
          Share your feedback
          <div className=" absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-white"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeedbackButton;
