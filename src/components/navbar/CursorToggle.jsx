import { MousePointer } from "lucide-react";
import Tooltip from "../common/Tooltip";

const CursorToggle = ({ cursorEnabled, toggleCursor }) => {
  return (
    <Tooltip
      content={cursorEnabled ? "Turn off cursor effects" : "Turn on cursor effects"}
      position="bottom"
    >
      <button
        type="button"
        onClick={toggleCursor}
        aria-pressed={cursorEnabled}
        aria-label="Toggle background cursor effects"
        className={`h-9 w-9 rounded-full border transition-colors flex items-center justify-center shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          cursorEnabled
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card-bg text-text-light hover:bg-bg-secondary"
        }`}
      >
        <MousePointer className="h-4 w-4" aria-hidden="true" />
      </button>
    </Tooltip>
  );
};

export default CursorToggle;