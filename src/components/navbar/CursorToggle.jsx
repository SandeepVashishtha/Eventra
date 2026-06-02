import { MousePointer } from "lucide-react";

const CursorToggle = ({ cursorEnabled, toggleCursor }) => {
  return (
    <button
      type="button"
      onClick={toggleCursor}
      aria-pressed={cursorEnabled}
      aria-label="Toggle background cursor effects"
      title={
        cursorEnabled
          ? "Turn off background cursor effects"
          : "Turn on background cursor effects"
      }
      className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-205 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        cursorEnabled
          ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-400"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
      }`}
    >
      <MousePointer size={18} aria-hidden="true" />
    </button>
  );
};

export default CursorToggle;
