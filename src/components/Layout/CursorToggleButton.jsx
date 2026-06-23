import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

const CursorToggleButton = ({ cursorEnabled, toggleCursor, isMobile }) => {
  if (isMobile) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleCursor}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 font-semibold text-zinc-900 transition-all hover:bg-zinc-200 dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/80"
      >
        {cursorEnabled ? (
          <MousePointer className="h-5 w-5 text-indigo-500" />
        ) : (
          <MousePointer className="h-5 w-5 text-zinc-400" />
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
      className="group flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/60 bg-zinc-100 transition-all duration-300 hover:bg-indigo-50 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] focus:outline-none dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:hover:bg-indigo-900/40"
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
