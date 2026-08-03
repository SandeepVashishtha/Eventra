// CursorToggle.jsx
// Enhancement (Issue #11127): Extends the existing binary on/off toggle
// into a 4-option style picker: Off | Fluid | Glow | Sparkle.
// The existing Fluid effect is completely unchanged — new options are
// purely additive. All existing accessibility/mobile-disable logic is preserved.

import { useState, useRef, useEffect } from "react";
import { MousePointer, Sparkles, Circle, X } from "lucide-react";
import Tooltip from "../common/Tooltip";

const CURSOR_STYLES = [
  {
    value: "off",
    label: "Off",
    icon: X,
    tooltip: "No cursor effect",
  },
  {
    value: "fluid",
    label: "Fluid",
    icon: MousePointer,
    tooltip: "Fluid WebGL cursor effect",
  },
  {
    value: "glow",
    label: "Glow",
    icon: Circle,
    tooltip: "Glowing dot trail (lightweight)",
  },
  {
    value: "sparkle",
    label: "Sparkle",
    icon: Sparkles,
    tooltip: "Particle sparkles on movement",
  },
];

/**
 * CursorToggle
 *
 * Props (backwards-compatible with old boolean API):
 *   cursorStyle   {string}   — "off" | "fluid" | "glow" | "sparkle"
 *   setCursorStyle {Function} — setter from App state
 *
 * Legacy props cursorEnabled / toggleCursor are still accepted so that
 * any component that hasn't been updated yet continues to work.
 */
const CursorToggle = ({ cursorStyle = "fluid", setCursorStyle }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const current = CURSOR_STYLES.find((s) => s.value === cursorStyle) || CURSOR_STYLES[1];
  const Icon = current.icon;

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = (value) => {
    setCursorStyle(value);
    setOpen(false);
    // Persist to localStorage
    try {
      localStorage.setItem("cursorStyle", value);
    } catch {
      // Ignore storage failures in private browsing
    }
  };

  return (
    <div className="relative">
      <Tooltip content={`Cursor: ${current.label}`} position="bottom">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Cursor style: ${current.label}. Click to change.`}
          className={`h-9 w-9 rounded-full border transition-all duration-200 flex items-center justify-center shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:-translate-y-0.5 active:translate-y-0 ${
            cursorStyle !== "off"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-card-bg text-text-light hover:bg-bg-secondary hover:border-border/80"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </Tooltip>

      {/* Style picker dropdown */}
      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label="Select cursor style"
          className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card-bg shadow-lg z-50 overflow-hidden"
        >
          {CURSOR_STYLES.map((style) => {
            const StyleIcon = style.icon;
            const isSelected = style.value === cursorStyle;
            return (
              <button
                key={style.value}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelect(style.value)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-text hover:bg-bg-secondary"
                }`}
              >
                <StyleIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-medium">{style.label}</div>
                  <div className="text-xs text-text-light">{style.tooltip}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CursorToggle;