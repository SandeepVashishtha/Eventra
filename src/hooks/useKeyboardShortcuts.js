import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { globalShortcutManager } from "../utils/shortcutManager";

const NAVIGATION_SHORTCUTS = [
  ["g h", "/"],
  ["g l", "/login"],
  ["g s", "/signup"],
  ["g e", "/events"],
  ["g c", "/calendar"],
  ["g b", "/bookmarks"],
  ["g r", "/reminders"],
  ["g k", "/hackathons"],
  ["g p", "/projects"],
  ["g a", "/leaderBoard"],
  ["g f", "/faq"],
  ["g d", "/dashboard"],
];

const useKeyboardShortcuts = ({
  onOpenHelp,
  isOpen,
}) => {
  const navigate = useNavigate();
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const unregister = [];

    if (onOpenHelp) {
      unregister.push(
        globalShortcutManager.register({
          id: "keyboard-help.open",
          shortcut: "shift+/",
          handler: () => onOpenHelp(),
        })
      );
    }

    NAVIGATION_SHORTCUTS.forEach(([shortcut, path]) => {
      unregister.push(
        globalShortcutManager.register({
          id: `navigation.${shortcut.replace(/\s+/g, "")}`,
          shortcut,
          handler: () => {
            if (!isOpenRef.current) {
              navigate(path);
            }
          },
        })
      );
    });
      const isTyping =
        active &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);

      let key = String(e?.key || "").toLowerCase();

      if (!key) return;

      // Trigger Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggleCommandPalette"));
        return;
      }

      if (isTyping && key !== "escape") return;

      // Map ? shifted key to / for virtual matrix consistency
      if (key === "?") {
        key = "/";
      }

      // Command Palette (Ctrl + K or Cmd + K)
      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggleCommandPalette"));
        onCloseHelp?.(); // Close Shortcuts Modal if open
        return;
      }

      // Open modal (Shift + ? or Shift + /)
      if (e.shiftKey && key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("closeCommandPalette"));
        onOpenHelp?.();
        return;
      }

      // Close modal
      if (key === "escape") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("closeCommandPalette"));
        onCloseHelp?.();
        keyBuffer.current = [];
        return;
      }

      // Prevent navigation shortcuts if any modal is open
      const hasModalOpen = isOpen || document.body.style.overflow === "hidden" || document.querySelector('[role="dialog"]');
      if (hasModalOpen) return;

      // Ignore navigation sequences if standard command modifier keys are active
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Clear existing active timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      keyBuffer.current.push(key);

      if (keyBuffer.current.length > 2) {
        keyBuffer.current.shift();
      }

      const combo = keyBuffer.current.join("");

      // Start a 1-second timeout to clear the buffer
      timeoutRef.current = setTimeout(() => {
        keyBuffer.current = [];
      }, 1000);

      if (combo === "gh") {
        navigate("/");
        keyBuffer.current = [];
      } else if (combo === "gl") {
        navigate("/login");
        keyBuffer.current = [];
      } else if (combo === "gs") {
        navigate("/signup");
        keyBuffer.current = [];
      } else if (combo === "ge") {
        navigate("/events");
        keyBuffer.current = [];
      } else if (combo === "gc") {
        navigate("/calendar");
        keyBuffer.current = [];
      } else if (combo === "gb") {
        navigate("/bookmarks");
        keyBuffer.current = [];
      } else if (combo === "gr") {
        navigate("/reminders");
        keyBuffer.current = [];
      } else if (combo === "gk") {
        navigate("/hackathons");
        keyBuffer.current = [];
      } else if (combo === "gp") {
        navigate("/projects");
        keyBuffer.current = [];
      } else if (combo === "ga") {
        navigate("/leaderboard");
        keyBuffer.current = [];
      } else if (combo === "gf") {
        navigate("/faq");
        keyBuffer.current = [];
      } else if (combo === "gd") {
        navigate("/dashboard");
        keyBuffer.current = [];
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      unregister.forEach((cleanup) => cleanup());
      globalShortcutManager.clearBuffer();
    };
  }, [navigate, onOpenHelp]);
};

export default useKeyboardShortcuts;
