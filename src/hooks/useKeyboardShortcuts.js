import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const useKeyboardShortcuts = ({
  onOpenHelp,
  onCloseHelp,
  isOpen,
}) => {
  const navigate = useNavigate();
  const keyBuffer = useRef([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;

      const isTyping =
        active &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);

      if (isTyping) return;

      // Safe normalized key
      let key = String(e?.key || "").toLowerCase();

      if (!key) return;

      // Map ? shifted key to / for virtual matrix consistency
      if (key === "?") {
        key = "/";
      }

      // Open modal (Shift + ? or Shift + /)
      if (e.shiftKey && key === "/") {
        e.preventDefault();
        onOpenHelp?.();
        return;
      }

      // Close modal
      if (key === "escape") {
        e.preventDefault();
        onCloseHelp?.();
        keyBuffer.current = [];
        return;
      }

      // Prevent navigation shortcuts if the shortcuts modal is open
      if (isOpen) return;

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
      document.removeEventListener("keydown", handler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, onOpenHelp, onCloseHelp, isOpen]);
};

export default useKeyboardShortcuts;