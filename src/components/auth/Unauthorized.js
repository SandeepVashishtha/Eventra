import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const Unauthorized = () => {
  const prefersReducedMotion = useReducedMotion();

  // Predefined bubble positions around the card
  const bubblePositions = [
    { top: "10%", left: "5%" },
    { top: "20%", right: "10%" },
    { bottom: "15%", left: "15%" },
    { bottom: "5%", right: "5%" },
    { top: "50%", left: "2%" },
    { top: "50%", right: "2%" },
  ];

  // Framer Motion variants for floating effect
  const floatingVariants = {
    float: (i) => ({
      y: [0, -20 - i * 3, 0],
      x: [0, 20 + i * 5, 0],
      transition: {
        duration: prefersReducedMotion ? 0 : 6 + i,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-red-100 to-red-200 px-4 dark:from-red-900/40 dark:via-gray-900 dark:to-black">
      {/* Floating decorative bubbles */}
      {bubblePositions.map((pos, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={floatingVariants}
          animate="float"
          className="absolute rounded-full bg-red-400/20 dark:bg-red-500/10"
          style={{
            width: 40 + i * 10,
            height: 40 + i * 10,
            ...pos,
          }}
        />
      ))}

      {/* Main Card container */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-4">
          {/* 🔥 FIX: Replaced infinite pulse with motion-aware entry animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200 }}
          >
            <XCircle className="h-20 w-20 text-red-500" />
          </motion.div>

          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don’t have permission to access this page.
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="mb-4 text-gray-500 dark:text-gray-500">
            This page requires special permissions. If you think this is an error, contact an
            administrator.
          </p>

          <Link
            to="/"
            className="inline-block transform rounded-lg bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-red-600"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
