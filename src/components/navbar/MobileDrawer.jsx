import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, UserPlus, Info, HelpCircle, Sun, Moon, MousePointer } from "lucide-react";
import NavbarLinks from "./NavbarLinks";
import { useTheme } from "../../context/ThemeContext";

const MobileDrawer = ({
  isOpen,
  closeMenu,
  isAuthenticated,
  logout,
  cursorEnabled,
  toggleCursor,
}) => {
  const location = useLocation();
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const isActive = (path) => location.pathname === path;
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [closeMenu, isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeMenu}
        className={`absolute inset-0 h-full w-full bg-black/50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        id="mobile-navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`mobile-drawer-panel absolute right-0 top-0 flex w-[min(92vw,24rem)] max-w-drawer flex-col bg-navbar shadow-premium-lg transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mobile-landscape-compact flex min-h-[64px] items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card-bg p-1 ring-1 ring-border">
              <img
                src="/favicon.png"
                alt=""
                aria-hidden="true"
                className="block h-full w-full object-contain"
              />
            </div>
            <h2 className="truncate text-xl font-bold text-text xs:text-2xl">
              Eventra
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 text-xl font-semibold text-text-light transition-colors hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>

        <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-4 py-5">
          <NavbarLinks
            vertical
            onClick={closeMenu}
          />

          <div className="mt-6 border-t border-border pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "border-primary bg-bg-secondary text-text"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard/profile")
                      ? "border-primary bg-bg-secondary text-text"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  View Profile
                </Link>
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "border-primary bg-bg-secondary text-text"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  <Info className="w-5 h-5" />
                  About
                </Link>
                <Link
                  to="/faq"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/faq")
                      ? "border-primary bg-bg-secondary text-text"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 border-transparent px-3 py-2 text-left text-sm font-medium text-text-light transition-all duration-200 hover:bg-bg hover:text-text"
                >
                  <LogIn className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={`flex items-center gap-1.5 py-2 text-sm font-medium transition-all duration-200 pl-3 border-l-2 w-full ${
                    isActive("/about")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <Info className="w-5 h-5" />
                  About
                </Link>
                <Link
                  to="/faq"
                  onClick={closeMenu}
                  className={`flex items-center gap-1.5 py-2 text-sm font-medium transition-all duration-200 pl-3 border-l-2 w-full ${
                    isActive("/faq")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={`flex items-center gap-1.5 py-2 text-sm font-medium transition-all duration-200 pl-3 border-l-2 w-full ${
                    isActive("/login")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className={`flex items-center gap-1.5 py-2 text-sm font-medium transition-all duration-200 pl-3 border-l-2 w-full ${
                    isActive("/signup")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Preferences Section (Theme & Cursor Toggles) - Unified Semantic Classes */}
          <div className="mt-6 border-t border-border pt-4 sm:hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-light/80 mb-3 px-3">
              Preferences
            </h3>
            <div className="flex items-center gap-3 px-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border text-sm font-medium text-text-light hover:bg-bg-secondary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? "Light" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={toggleCursor}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  cursorEnabled
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-text-light hover:bg-bg-secondary"
                }`}
              >
                <MousePointer size={16} />
                <span>Cursor: {cursorEnabled ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;