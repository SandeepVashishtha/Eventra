import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
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
    <div
      id="mobile-navigation-drawer"
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className={`fixed top-0 right-0 h-screen w-[85%] bg-white dark:bg-gray-900 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <img
            src="/Eventra.png"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 rounded-xl object-contain"
          />
          <h2 className="text-2xl font-bold">Eventra</h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMenu}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label="Close navigation menu"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-4 py-5">
        <NavbarLinks
          mobile
          onLinkClick={closeMenu}
          isAuthenticated={isAuthenticated}
          user={user}
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
            <div className="flex flex-col gap-4 mt-4">
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
                Login
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
  );
};

export default MobileDrawer;
