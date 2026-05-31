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
      className={`rounded-lg border px-1 py-1 transition-colors flex items-center justify-center ${
        cursorEnabled
          ? "border-primary bg-primary text-white shadow-premium-sm"
          : "border-border bg-card-bg text-text-light"
      }`}
    >
      <MousePointer aria-hidden="true" />
    </button>
  );
};

export default CursorToggle;
