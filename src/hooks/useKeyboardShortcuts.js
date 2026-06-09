import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * useKeyboardShortcuts Hook
 * 
 * Centralized manager for keyboard shortcuts.
 * 
 * @param {Object} shortcuts - Mapping of keys to handlers
 * @param {boolean} disabled - Global disable toggle
 */
export const useKeyboardShortcuts = (shortcuts = {}, disabled = false) => {
  const navigate = useNavigate();

  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const keyBuffer = useRef([]);
  const timeoutRef = useRef(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (disabled) return;

      const activeElement = document.activeElement;
      const isTyping =
        activeElement && (
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.isContentEditable ||
          activeElement.contentEditable === "true" ||
          activeElement.getAttribute?.("contenteditable") === "true"
        );

      const key = event.key;
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Ignore shortcuts if the user is typing, except for the Escape key
      if (isTyping && key !== "Escape") return;

      // Normalize key
      let keyString = "";
      if (ctrl) keyString += "ctrl+";
      if (alt) keyString += "alt+";
      if (shift) keyString += "shift+";
      keyString += key.toLowerCase();

      // 1. Direct handler match (e.g. "ctrl+k", "alt+d", or physical key mapping like "r", "c", etc.)
      const handler = shortcutsRef.current[keyString] || shortcutsRef.current[key.toLowerCase()];

      if (handler) {
        event.preventDefault();
        handler(event);
        return;
      }

      // 2. Global Shortcuts & Dynamic Callbacks Fallbacks

      // ALT Navigation Shortcuts
      if (keyString === "alt+d") {
        if (navigate) {
          event.preventDefault();
          navigate("/dashboard");
        }
        return;
      }

      if (keyString === "alt+e") {
        if (navigate) {
          event.preventDefault();
          navigate("/events");
        }
        return;
      }

      if (keyString === "alt+p") {
        if (navigate) {
          event.preventDefault();
          navigate("/profile");
        }
        return;
      }

      // Search focus shortcut
      if (keyString === "/") {
        event.preventDefault();
        if (shortcutsRef.current.onSearchFocus) {
          shortcutsRef.current.onSearchFocus();
        } else {
          const input = document.querySelector('nav input[type="text"], nav input[type="search"]') ||
                        document.querySelector('input[type="text"], input[type="search"]');
          if (input) input.focus();
        }
        return;
      }

      // Ctrl + K shortcut
      if (keyString === "ctrl+k") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("toggleCommandPalette"));
        if (shortcutsRef.current.onCloseHelp) {
          shortcutsRef.current.onCloseHelp();
        }
        const input = document.querySelector('nav input[type="text"], nav input[type="search"]') ||
                      document.querySelector('input[type="text"], input[type="search"]');
        if (input) input.focus();
        return;
      }

      // Escape shortcut
      if (key === "Escape") {
        window.dispatchEvent(new CustomEvent("closeCommandPalette"));
        let handled = false;
        if (shortcutsRef.current.onCloseHelp) {
          shortcutsRef.current.onCloseHelp();
          handled = true;
        }
        if (shortcutsRef.current.onCloseModals) {
          shortcutsRef.current.onCloseModals();
          handled = true;
        }
        if (shortcutsRef.current.onClose) {
          shortcutsRef.current.onClose();
          handled = true;
        }
        if (handled) {
          event.preventDefault();
        }
        keyBuffer.current = [];
        return;
      }

      // Shift+? or Shift+/ for opening help modal
      if (shift && (key === "?" || key === "/")) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("closeCommandPalette"));
        if (shortcutsRef.current.onOpenHelp) {
          shortcutsRef.current.onOpenHelp();
        }
        return;
      }

      // 3. Sequence keys fallback navigation (e.g. 'g' -> 'h')
      const hasModalOpen =
        shortcutsRef.current.isOpen ||
        document.body.style.overflow === "hidden" ||
        document.querySelector('[role="dialog"]');

      if (hasModalOpen) return;
      if (ctrl || alt || shift || event.metaKey) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      keyBuffer.current.push(key.toLowerCase());
      if (keyBuffer.current.length > 2) {
        keyBuffer.current.shift();
      }

      const combo = keyBuffer.current.join("");
      timeoutRef.current = setTimeout(() => {
        keyBuffer.current = [];
      }, 1000);

      const navRoutes = {
        gh: "/",
        gl: "/login",
        gs: "/signup",
        ge: "/events",
        gc: "/calendar",
        gb: "/bookmarks",
        gr: "/reminders",
        gk: "/hackathons",
        gp: "/projects",
        ga: "/leaderboard",
        gf: "/faq",
        gd: "/dashboard",
      };

      if (navRoutes[combo] && navigate) {
        navigate(navRoutes[combo]);
        keyBuffer.current = [];
      }
    },
    [disabled, navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
