import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

const CursorToggleButton = ({ cursorEnabled, toggleCursor, isMobile }) => {
  if (isMobile) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleCursor}
        className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all"
      >
        {cursorEnabled ? (
          <MousePointer className="w-5 h-5 text-indigo-500" />
        ) : (
          <MousePointer className="w-5 h-5 text-zinc-400" />
        )}
        <span>{cursorEnabled ? "Fluid Cursor" : "Static Cursor"}</span>
      </motion.button>
    );
  }
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleCursor}
      title={cursorEnabled ? "Disable Fluid Cursor" : "Enable Fluid Cursor"}
      className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-zinc-200/60 dark:border-zinc-700/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] group"
    >
      <MousePointer
        className={`w-4 h-4 ${
          cursorEnabled
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-zinc-400 dark:text-zinc-500"
        }`}
      />
    </motion.button>
  );
};

export default CursorToggleButton;
