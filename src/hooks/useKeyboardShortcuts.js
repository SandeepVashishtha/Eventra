import { useEffect } from "react";

const useKeyboardShortcuts = ({ onOpenHelp, onCloseHelp }) => {
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        ["INPUT", "TEXTAREA"].includes(active.tagName);

      if (isTyping) return;

      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onCloseHelp();
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [onOpenHelp, onCloseHelp]);
};

export default useKeyboardShortcuts;