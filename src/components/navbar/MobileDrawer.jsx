import React, { useEffect, useRef, useState } from "react";
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
  const closeTimerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    window.clearTimeout(closeTimerRef.current);

    if (isOpen) {
      setShouldRender(true);
      return undefined;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
    }, 220);

    return () => window.clearTimeout(closeTimerRef.current);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
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
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus?.();
    };
  }, [closeMenu, isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
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
            <img
              src="/Eventra.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 rounded-xl object-contain"
            />
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

        <div className="mobile-drawer-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4 safe-area-bottom">
          <NavbarLinks vertical={true} onClick={closeMenu} />

          {isAuthenticated ? (
            <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="min-h-[44px] min-w-0 px-3 py-2 text-base text-gray-600 dark:text-gray-300">
                <span className="block truncate">{user?.name || user?.email || "Account"}</span>
              </div>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="mobile-drawer-link flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/profile"
                onClick={closeMenu}
                className="mobile-drawer-link flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                View Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="mobile-drawer-link flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-base text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/30 dark:hover:text-red-300"
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
