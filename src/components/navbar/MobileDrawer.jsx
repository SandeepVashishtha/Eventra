import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LogIn,
  UserPlus,
  Info,
  HelpCircle,
  Sun,
  Moon,
  MousePointer,
  Bell,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import NavbarLinks from "./NavbarLinks";
import LanguageSelector from "../LanguageSelector";
import { useTheme } from "../../context/ThemeContext";

const MobileDrawer = ({
  isOpen,
  closeMenu,
  isAuthenticated,
  logout,
  cursorEnabled,
  toggleCursor,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const isActive = (path) => location.pathname === path;
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();

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

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

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
        {/* Header */}
        <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card-bg p-1 ring-1 ring-border">
              <img
                src="/favicon.png"
                alt=""
                aria-hidden="true"
                className="block h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <h2 className="truncate text-xl font-bold text-text xs:text-2xl">Eventra</h2>
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

        <div className="flex h-[calc(100%-64px)] flex-col overflow-y-auto px-4 py-4">
          {/* Main Navigation - Consistent with Desktop */}
          <NavbarLinks vertical onClick={closeMenu} />

          {/* Quick Actions (P3) */}
          {isAuthenticated && (
            <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-light/80 mb-3 px-1">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/events/create"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-primary hover:bg-bg-secondary transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  {t("nav.createEvent") || "Create Event"}
                </Link>
                <Link
                  to="/hackathons"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-text-light hover:bg-bg-secondary transition-colors"
                >
                  Join Hackathon
                </Link>
              </div>
            </div>
          )}

          {/* Language Selector */}
          <div className="mt-6 px-1">
            <LanguageSelector className="w-full" />
          </div>

          {/* User Section */}
          <div className="mt-6 border-t border-border pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "border-primary bg-bg-secondary text-text font-semibold"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t("nav.dashboard")}
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard/profile")
                      ? "border-primary bg-bg-secondary text-text font-semibold"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  <UserPlus className="w-5 h-5" /> {/* You can change icon if needed */}
                  {t("nav.viewProfile") || "My Profile"}
                </Link>

                <Link
                  to="/notifications"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/notifications")
                      ? "border-primary bg-bg-secondary text-text font-semibold"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "border-primary bg-bg-secondary text-text font-semibold"
                      : "border-transparent text-text-light hover:bg-bg hover:text-text"
                  }`}
                >
                  <Info className="w-5 h-5" />
                  {t("nav.about")}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-bg hover:text-red-600 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  {t("nav.signOut")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "border-primary text-text font-semibold"
                      : "border-transparent text-text-light hover:text-text"
                  }`}
                >
                  <Info className="w-5 h-5" />
                  {t("nav.about")}
                </Link>
                <Link
                  to="/faq"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/faq")
                      ? "border-primary text-text font-semibold"
                      : "border-transparent text-text-light hover:text-text"
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  {t("nav.faqFull")}
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/login")
                      ? "border-primary text-text font-semibold"
                      : "border-transparent text-text-light hover:text-text"
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/signup")
                      ? "border-primary text-text font-semibold"
                      : "border-transparent text-text-light hover:text-text"
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  {t("nav.signUp")}
                </Link>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-light/80 mb-3 px-1">
              Preferences
            </h3>
            <div className="flex gap-3 px-1">
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={isDarkMode}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium hover:bg-bg-secondary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? "Light" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={toggleCursor}
                aria-pressed={cursorEnabled}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  cursorEnabled
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border hover:bg-bg-secondary"
                }`}
              >
                <MousePointer size={18} />
                <span>Cursor {cursorEnabled ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
