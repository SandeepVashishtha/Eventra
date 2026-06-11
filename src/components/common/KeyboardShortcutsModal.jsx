import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Keyboard, Sparkles, X } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useModalStack } from "../../hooks/useModalStack";

const shortcutData = [
  {
    action: "Open shortcuts help",
    shortcut: "Shift + ?",
    keys: ["shift", "/"],
    category: "General",
    workflow: "Help & Guidance"
  },
  {
    action: "Close modal / Cancel",
    shortcut: "Esc",
    keys: ["escape"],
    category: "General",
    workflow: "Navigation"
  },
  {
    action: "Open Command Palette",
    shortcut: "Ctrl + K / ⌘ + K",
    keys: ["control", "k"],
    category: "General",
    workflow: "Quick Search"
  },
  {
    action: "Navigate to Home",
    shortcut: "g + h",
    keys: ["g", "h"],
    category: "Navigation",
    workflow: "Dashboard"
  },
  {
    action: "Navigate to Events",
    shortcut: "g + e",
    keys: ["g", "e"],
    category: "Navigation",
    workflow: "Events"
  },
  {
    action: "Navigate to Calendar",
    shortcut: "g + c",
    keys: ["g", "c"],
    category: "Navigation",
    workflow: "Events"
  },
  {
    action: "Navigate to Bookmarks",
    shortcut: "g + b",
    keys: ["g", "b"],
    category: "Navigation",
    workflow: "User"
  },
  {
    action: "Navigate to Reminders",
    shortcut: "g + r",
    keys: ["g", "r"],
    category: "Navigation",
    workflow: "User"
  },
  {
    action: "Navigate to Hackathons",
    shortcut: "g + k",
    keys: ["g", "k"],
    category: "Navigation",
    workflow: "Events"
  },
  {
    action: "Navigate to Projects",
    shortcut: "g + p",
    keys: ["g", "p"],
    category: "Navigation",
    workflow: "Developer"
  },
  {
    action: "Navigate to Leaderboard",
    shortcut: "g + a",
    keys: ["g", "a"],
    category: "Navigation",
    workflow: "Community"
  },
  {
    action: "Navigate to FAQ",
    shortcut: "g + f",
    keys: ["g", "f"],
    category: "Navigation",
    workflow: "Help & Guidance"
  },
  {
    action: "Navigate to Dashboard",
    shortcut: "g + d",
    keys: ["g", "d"],
    category: "Navigation",
    workflow: "User"
  },
  {
    action: "Navigate to Login",
    shortcut: "g + l",
    keys: ["g", "l"],
    category: "Navigation",
    workflow: "Auth"
  },
  {
    action: "Navigate to Signup",
    shortcut: "g + s",
    keys: ["g", "s"],
    category: "Navigation",
    workflow: "Auth"
  },
  {
    action: "Register for Event",
    shortcut: "R",
    keys: ["r"],
    category: "Event Detail",
    workflow: "Registration"
  },
  {
    action: "Copy Event Link",
    shortcut: "C",
    keys: ["c"],
    category: "Event Detail",
    workflow: "Sharing"
  },
  {
    action: "Open Share Modal",
    shortcut: "S",
    keys: ["s"],
    category: "Event Detail",
    workflow: "Sharing"
  },
  {
    action: "Print / Save as PDF",
    shortcut: "P",
    keys: ["p"],
    category: "Event Detail",
    workflow: "Export"
  }
];

const virtualKeys = [
  { label: "Esc", id: "escape" },
  { label: "Shift", id: "shift" },
  { label: "Ctrl", id: "control" },
  { label: "Alt", id: "alt" },
  { label: "Cmd / Win", id: "meta" },
  { label: "a", id: "a" },
  { label: "b", id: "b" },
  { label: "c", id: "c" },
  { label: "d", id: "d" },
  { label: "e", id: "e" },
  { label: "f", id: "f" },
  { label: "g", id: "g" },
  { label: "h", id: "h" },
  { label: "k", id: "k" },
  { label: "l", id: "l" },
  { label: "p", id: "p" },
  { label: "r", id: "r" },
  { label: "s", id: "s" },
  { label: "? / /", id: "/" },
  { label: "Spacebar", id: " " }
];

const ShortcutRow = ({ action, keys, isPressed }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/50 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/40 dark:bg-slate-900/40"
  >
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {action}
      </span>
      <span className="mt-0.5 text-[10px] font-extrabold tracking-wider text-indigo-500 uppercase">
        Keyboard trigger
      </span>
    </div>

    <div className="flex items-center gap-1.5">
      {keys.map((k, idx) => {
        const active = isPressed(k);
        return (
          <kbd
            key={`${k}-${idx}`}
            className={`
              px-2.5 py-1.5 rounded-lg border text-xs font-black uppercase tracking-tight shadow-sm transition-all duration-150
              ${active
                ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-transparent scale-95 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              }
            `}
          >
            {k === " " ? "Space" : k === "escape" ? "Esc" : k}
          </kbd>
        );
      })}
    </div>
  </motion.div>
);

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const { containerRef: trapRef } = useFocusTrap(isOpen, onClose);
  const { isTopmost } = useModalStack(isOpen);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (!isTopmost()) return;

      // Bypass tracking if editing standard forms/inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }
      
      let key = e.key.toLowerCase();
      if (key === "?") key = "/";

      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        // Explicitly map standard physical modifiers
        if (e.shiftKey) next.add("shift");
        if (e.ctrlKey) next.add("control");
        if (e.altKey) next.add("alt");
        if (e.metaKey) next.add("meta");
        return next;
      });
    };

    const handleKeyUp = (e) => {
      if (!isTopmost()) return;

      let key = e.key.toLowerCase();
      if (key === "?") key = "/";

      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        if (!e.shiftKey) next.delete("shift");
        if (!e.ctrlKey) next.delete("control");
        if (!e.altKey) next.delete("alt");
        if (!e.metaKey) next.delete("meta");
        return next;
      });
    };

    const handleBlur = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isOpen, isTopmost]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setPressedKeys(new Set());
    }
  }, [isOpen]);

  const isKeyPressed = (keyId) => {
    return pressedKeys.has(keyId.toLowerCase());
  };

  const filteredShortcuts = shortcutData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.action.toLowerCase().includes(query) ||
      item.shortcut.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.workflow.toLowerCase().includes(query)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Interactive Modal Sheet */}
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 280, damping: 25 }}
            className="relative flex max-h-[calc(100vh-4rem)] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-7 dark:border-slate-800/40 dark:bg-slate-900/90"
          >
            {/* Header Title */}
            <div className="mb-6 flex flex-shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute -inset-0.5 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-70 blur" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-indigo-400">
                    <Keyboard className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h2 id="keyboard-shortcuts-title" className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl dark:text-white">
                    Keyboard Shortcuts
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Navigate Eventra with visual tactile hotkeys
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close keyboard shortcuts"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shadow-sm transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Tactical Live Keyboard Display */}
            <div className="mb-6 flex-shrink-0 rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/30 dark:bg-slate-950/30">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Sparkles className="animate-spin-slow h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
                  Interactive Live Keyboard Matrix
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {virtualKeys.map((key) => {
                  const active = isKeyPressed(key.id);
                  return (
                    <motion.div
                      key={key.id}
                      animate={active ? { scale: 0.94, y: 1 } : { scale: 1, y: 0 }}
                      className={`
                        px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all duration-150 select-none
                        ${active
                          ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-transparent"
                          : "bg-white dark:bg-slate-800 border-b-4 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 border-l border-r border-t border-slate-200/30 dark:border-slate-700/10"
                        }
                      `}
                    >
                      {key.label}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Filter Input */}
            <div className="relative mb-5 flex-shrink-0">
              <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 py-3 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-colors outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-950/20 dark:text-white dark:focus:border-indigo-400"
              />
            </div>

            {/* Dynamic Shortcuts List Area */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1" data-lenis-prevent>
              <AnimatePresence mode="popLayout">
                {filteredShortcuts.length > 0 ? (
                  filteredShortcuts.map((item) => (
                    <ShortcutRow
                      key={item.action}
                      action={item.action}
                      shortcut={item.shortcut}
                      keys={item.keys}
                      isPressed={isKeyPressed}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-800"
                  >
                    <Search className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      No shortcuts found
                    </h3>
                    <p className="mt-1 max-w-[240px] text-xs text-slate-500 dark:text-slate-400">
                      Try entering another search criteria or category name.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Footer Assist */}
            <div className="mt-5 flex-shrink-0 border-t border-slate-200/50 pt-3 text-center dark:border-slate-800/40">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                Press keys on physical keyboard to trigger highlight
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
