import React from "react";
import { MousePointer } from "lucide-react";

const CursorToggle = ({ cursorEnabled, toggleCursor }) => {
  return (
    <button
      type="button"
      onClick={toggleCursor}
      aria-pressed={cursorEnabled}
      title={
        cursorEnabled
          ? "Turn off background cursor effects"
          : "Turn on background cursor effects"
      }
      className={`rounded-lg border px-1 py-1 transition-colors ${
        cursorEnabled
          ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
          : "border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      }`}
    >
      <MousePointer aria-hidden="true" />
    </button>
  );
};

export default CursorToggle;
