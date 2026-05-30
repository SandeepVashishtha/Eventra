import React from "react";
import { MousePointer } from "lucide-react";

const CursorToggle = ({ cursorEnabled, toggleCursor }) => {
  return (
    <button
      type="button"
      onClick={toggleCursor}
      aria-pressed={cursorEnabled}
      aria-label={cursorEnabled ? "Disable fluid cursor effect" : "Enable fluid cursor effect"}
      title={cursorEnabled ? "Fluid cursor: On" : "Fluid cursor: Off"}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
        cursorEnabled
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      }`}
    >
      <MousePointer className="w-4 h-4" />
      <span className="hidden sm:inline">{cursorEnabled ? "FX On" : "FX Off"}</span>
    </button>
  );
};

export default CursorToggle;
