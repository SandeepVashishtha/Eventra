import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Info, HelpCircle, LogIn } from "lucide-react";

const AuthButtons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu]);

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Profile Dropdown for Unauthenticated Users */}
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="flex items-center gap-2 rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
            Profile
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="space-y-1">
              <Link
                to="/about"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Info className="w-4 h-4" />
                About
              </Link>
              <Link
                to="/faq"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Frequently Asked Questions
              </Link>
            </div>
            
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
            
            <Link
              to="/login"
              role="menuitem"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/signup"
        className="px-4 py-2 bg-yellow-200 text-black rounded-lg text-sm font-semibold hover:bg-yellow-300 dark:bg-amber-800 dark:text-white dark:hover:bg-amber-900 transition-colors whitespace-nowrap"
      >
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;
