import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, UserPlus, Info, HelpCircle, Sun, Moon, MousePointer, Bell } from "lucide-react";
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
  // Scroll lock: prevent background scroll when drawer is open
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
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
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
        className={`mobile-drawer-panel max-w-drawer bg-navbar shadow-premium-lg absolute top-0 right-0 flex w-[min(92vw,24rem)] flex-col transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mobile-landscape-compact border-border flex min-h-[64px] items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-card-bg ring-border flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1 ring-1">
              <img
                src="/favicon.png"
                alt=""
                aria-hidden="true"
                className="block h-full w-full object-contain"
              />
            </div>
            <h2 className="text-text xs:text-2xl truncate text-xl font-bold">Eventra</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="text-text-light hover:bg-bg-secondary focus-visible:ring-primary inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 text-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>

        <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-4 py-5">
          <NavbarLinks vertical onClick={closeMenu} />

          <div className="mt-4 px-1">
            <LanguageSelector className="w-full" />
          </div>

          <div className="border-border mt-6 border-t pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "border-primary bg-bg-secondary text-text"
                      : "text-text-light hover:bg-bg hover:text-text border-transparent"
                  }`}
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard/profile")
                      ? "border-primary bg-bg-secondary text-text"
                      : "text-text-light hover:bg-bg hover:text-text border-transparent"
                  }`}
                >
                  {t("nav.viewProfile")}
                </Link>
                <Link
                  to="/notifications"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/notifications")
                      ? "border-primary bg-bg-secondary text-text"
                      : "text-text-light hover:bg-bg hover:text-text border-transparent"
                  }`}
                >
                  <Bell className="h-5 w-5" />
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
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "border-primary bg-bg-secondary text-text"
                      : "text-text-light hover:bg-bg hover:text-text border-transparent"
                  }`}
                >
                  <Info className="h-5 w-5" />
                  {t("nav.about")}
                </Link>
                <Link
                  to="/faq"
                  onClick={closeMenu}
                  className={`mobile-drawer-link flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive("/faq")
                      ? "border-primary bg-bg-secondary text-text"
                      : "text-text-light hover:bg-bg hover:text-text border-transparent"
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                  {t("nav.faqFull")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="mobile-drawer-link text-text-light hover:bg-bg hover:text-text flex min-h-[48px] w-full items-center gap-2 rounded-lg border-l-2 border-transparent px-3 py-2 text-left text-sm font-medium transition-all duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  {t("nav.signOut")}
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={`flex w-full items-center gap-1.5 border-l-2 py-2 pl-3 text-sm font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <Info className="h-5 w-5" />
                  {t("nav.about")}
                </Link>
                <Link
                  to="/faq"
                  onClick={closeMenu}
                  className={`flex w-full items-center gap-1.5 border-l-2 py-2 pl-3 text-sm font-medium transition-all duration-200 ${
                    isActive("/faq")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                  {t("nav.faqFull")}
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={`flex w-full items-center gap-1.5 border-l-2 py-2 pl-3 text-sm font-medium transition-all duration-200 ${
                    isActive("/login")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <LogIn className="h-5 w-5" />
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className={`flex w-full items-center gap-1.5 border-l-2 py-2 pl-3 text-sm font-medium transition-all duration-200 ${
                    isActive("/signup")
                      ? "text-text border-primary font-semibold"
                      : "text-text-light hover:text-text border-transparent"
                  }`}
                >
                  <UserPlus className="h-5 w-5" />
                  {t("nav.signUp")}
                </Link>
              </div>
            )}
          </div>

          {/* Preferences Section (Theme & Cursor Toggles) - Unified Semantic Classes */}
          <div className="border-border mt-6 border-t pt-4 sm:hidden">
            <h3 className="text-text-light/80 mb-3 px-3 text-xs font-semibold tracking-wider uppercase">
              Preferences
            </h3>
            <div className="flex items-center gap-3 px-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="border-border text-text-light hover:bg-bg-secondary focus-visible:ring-primary flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? "Light" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={toggleCursor}
                className={`focus-visible:ring-primary flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 ${
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
