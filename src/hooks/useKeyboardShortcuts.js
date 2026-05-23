import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const useKeyboardShortcuts = ({
  onOpenHelp,
  onCloseHelp,
}) => {
  const navigate = useNavigate();
  const keyBuffer = useRef([]);

  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;

      const isTyping =
        active &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);

      if (isTyping) return;

      // Open modal
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      // Close modal
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseHelp();
        keyBuffer.current = [];
        return;
      }

      keyBuffer.current.push(e.key.toLowerCase());

      if (keyBuffer.current.length > 2) {
        keyBuffer.current.shift();
      }

      const combo = keyBuffer.current.join("");

      if (combo === "gh") {
        navigate("/");
        keyBuffer.current = [];
      }

      if (combo === "gl") {
        navigate("/login");
        keyBuffer.current = [];
      }

      if (combo === "gs") {
        navigate("/signup");
        keyBuffer.current = [];
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [navigate, onOpenHelp, onCloseHelp]);
};

export default useKeyboardShortcuts;