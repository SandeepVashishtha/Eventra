import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, UserPlus, Info, HelpCircle } from "lucide-react";
import NavbarLinks from "./NavbarLinks";

const MobileDrawer = ({
  isOpen,
  closeMenu,
  isAuthenticated,
  user,
  logout,
}) => {
  const location = useLocation();
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const isActive = (path) => location.pathname === path;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeMenu}
        className={`absolute inset-0 h-full w-full bg-black/50 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        id="mobile-navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`mobile-drawer-panel absolute right-0 top-0 flex w-[min(92vw,24rem)] max-w-drawer flex-col bg-white shadow-2xl transition-transform duration-200 ease-out dark:bg-gray-900 ${
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
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "border-black bg-gray-100 text-black dark:border-white dark:bg-gray-800 dark:text-white"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-white"
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
                      ? "border-black bg-gray-100 text-black dark:border-white dark:bg-gray-800 dark:text-white"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-white"
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
                  className="mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 border-transparent px-3 py-2 text-left text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-white"
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
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
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
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
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
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
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
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
