// src/components/whatsnew/WhatsNewBell.jsx
import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useWhatsNew } from "../../hooks/useWhatsNew";
import WhatsNewDropdown from "./WhatsNewDropdown";

export default function WhatsNewBell() {
  const { entries, hasUnread, markAsRead } = useWhatsNew();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && hasUnread) {
      markAsRead();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="What's New"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Sparkles className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        {hasUnread && (
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <WhatsNewDropdown
          entries={entries}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}