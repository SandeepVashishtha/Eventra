import { useEffect, useRef } from "react";
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
        className={`mobile-drawer-panel absolute right-0 top-0 bottom-0 flex w-[min(92vw,24rem)] max-w-drawer flex-col bg-white shadow-2xl transition-transform duration-200 ease-out dark:bg-gray-900 ${
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

        <div className="mobile-drawer-scroll flex-1 min-h-0 overflow-y-auto px-4 py-5">
          <NavbarLinks
            vertical
            onClick={closeMenu}
            isAuthenticated={isAuthenticated}
            user={user}
          />

          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full justify-start items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full justify-start items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive("/dashboard/profile")
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>View Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="mobile-drawer-link flex min-h-[48px] w-full justify-start items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-left text-sm font-semibold text-rose-900 transition-all duration-200 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={`inline-flex min-h-[50px] w-full justify-start items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-slate-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 ${
                    isActive("/login") ? "ring-1 ring-indigo-500" : ""
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className={`inline-flex min-h-[50px] w-full justify-start items-center gap-2 rounded-2xl border border-indigo-600 bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive("/signup") ? "ring-2 ring-white/80" : ""
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
