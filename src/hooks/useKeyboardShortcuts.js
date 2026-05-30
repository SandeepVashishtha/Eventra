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

    return () => {
      unregister.forEach((cleanup) => cleanup());
      globalShortcutManager.clearBuffer();
    };
  }, [navigate, onOpenHelp]);
};

export default useKeyboardShortcuts;
