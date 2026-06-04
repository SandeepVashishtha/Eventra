import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, UserPlus, Sun, Moon, MousePointer } from "lucide-react";
import NavbarLinks from "./NavbarLinks";
import { useTheme } from "../../context/ThemeContext";
import AuthButtons from "./AuthButtons";

const MobileDrawer = ({
  isOpen,
  closeMenu,
  isAuthenticated,
  user,
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
        className={`mobile-drawer-panel absolute right-0 top-0 flex h-full w-[min(92vw,24rem)] max-w-drawer flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mobile-landscape-compact flex min-h-[64px] items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 p-1 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <img
                src="/favicon.png"
                alt=""
                aria-hidden="true"
                className="block h-full w-full object-contain"
              />
            </div>
            <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white xs:text-2xl">
              Eventra
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 text-xl font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>

        <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-4 py-5">
          <NavbarLinks
            vertical
            onClick={closeMenu}
          />

          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "border-black bg-gray-100 text-black dark:border-white dark:bg-gray-800 dark:text-white"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard/profile")
                      ? "border-black bg-gray-100 text-black dark:border-white dark:bg-gray-800 dark:text-white"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-white"
                  }`}
                >
                  View Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 border-transparent px-3 py-2 text-left text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <AuthButtons isMobile onActionClick={closeMenu} />
            )}
          </div>

          {/* Preferences Section (Theme & Cursor Toggles) - Visible only on mobile where main navbar controls are hidden */}
          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800 sm:hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-3">
              Preferences
            </h3>
            <div className="flex items-center gap-3 px-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? "Light" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={toggleCursor}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  cursorEnabled
                    ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
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
