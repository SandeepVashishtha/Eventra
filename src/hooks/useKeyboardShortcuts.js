import { useEffect, useCallback } from "react";

/**
 * useKeyboardShortcuts Hook
 * 
 * Centralized manager for keyboard shortcuts.
 * 
 * @param {Object} shortcuts - Mapping of keys to handlers
 * @param {boolean} disabled - Global disable toggle
 */
export const useKeyboardShortcuts = (shortcuts = {}, disabled = false) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (disabled) return;

      // Ignore shortcuts when typing in inputs or textareas
      const activeElement = document.activeElement;
      const isTyping = 
        activeElement.tagName === "INPUT" || 
        activeElement.tagName === "TEXTAREA" || 
        activeElement.isContentEditable;

      const key = event.key;
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Special handling for search ('/') and help ('?')
      // We allow '/' even if not typing if it's explicitly handled
      
      // Build a unique key string for mapping
      let keyString = "";
      if (ctrl) keyString += "ctrl+";
      if (alt) keyString += "alt+";
      if (shift) keyString += "shift+";
      keyString += key.toLowerCase();

      // Find matching handler
      const handler = shortcuts[keyString] || shortcuts[key.toLowerCase()];

      if (handler) {
        // If typing, only allow specific shortcuts (like esc)
        if (isTyping && key !== "Escape") return;

        event.preventDefault();
        handler(event);
      }
    },
    [shortcuts, disabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
