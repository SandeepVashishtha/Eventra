import React from "react";
import { MousePointer } from "lucide-react";

const CursorToggle = ({ cursorEnabled, toggleCursor }) => {
  return (
    <button
      onClick={toggleCursor}
      className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
    >
      <MousePointer />
    </button>
  );
};

export default CursorToggle;