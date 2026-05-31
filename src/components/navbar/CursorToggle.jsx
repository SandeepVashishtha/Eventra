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
      className={`h-9 w-9 rounded-full border transition-colors flex items-center justify-center shadow-none ${
        cursorEnabled
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card-bg text-text-light hover:bg-bg-secondary"
      }`}
    >
      <MousePointer className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};

export default CursorToggle;
