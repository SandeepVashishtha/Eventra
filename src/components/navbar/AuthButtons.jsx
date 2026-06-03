import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Info, HelpCircle, LogIn } from "lucide-react";

const prefetchLogin = () => import("../auth/AuthPage");
const prefetchSignup = () => import("../auth/AuthPage");

const AuthButtons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, closeMenu]);

  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={isOpen ? menuId : undefined}
          className="flex items-center gap-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm font-medium text-text-light hover:bg-bg-secondary hover:text-text transition-colors">
            Profile
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {isOpen && (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-xl border border-border bg-navbar shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="space-y-1">
              <Link
                to="/about"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
              >
                <Info className="w-4 h-4" />
                About
              </Link>
              <Link
                to="/faq"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Frequently Asked Questions
              </Link>
            </div>

            <div role="separator" className="h-px bg-border my-2" />

            <Link
              to="/login"
              role="menuitem"
              onClick={closeMenu}
              onMouseEnter={() => prefetchLogin()}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-bg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/signup"
        onMouseEnter={() => prefetchSignup()}
        className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors whitespace-nowrap shadow-none"
      >
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;
