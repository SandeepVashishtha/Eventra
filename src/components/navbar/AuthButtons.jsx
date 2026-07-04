import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Info,
  HelpCircle,
  LogIn,
  User,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";

const prefetchLogin = () => import("../../components/auth/Login");
const prefetchSignup = () => import("../../components/auth/Signup");

const AuthButtons = ({ isLoggedIn = false }) => {
  const { t } = useTranslation();
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
    <div className="flex items-center justify-center gap-1.5">
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={isOpen ? menuId : undefined}
          className="flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/80 hover:bg-white shadow-sm hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-text-light hover:text-text backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-3 py-1.5 text-sm font-medium tracking-wide"
        >
          <span>{isLoggedIn ? t("nav.profile") : t("nav.account")}</span>
          <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5} />
        </button>

        {isOpen && (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="space-y-1">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t("nav.dashboard") || "Dashboard"}
                  </Link>
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {t("nav.myProfile") || "My Profile"}
                  </Link>
                  <Link
                    to="/create-event"
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {t("nav.createEvent") || "Create Event"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/about"
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    {t("nav.about")}
                  </Link>
                  <Link
                    to="/faq"
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {t("nav.faqFull")}
                  </Link>
                </>
              )}
            </div>

            <div role="separator" className="h-px bg-border my-2" />

            {isLoggedIn ? (
              <Link
                to="/logout"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-bg transition-colors"
              >
                {t("nav.signOut") || "Sign Out"}
              </Link>
            ) : (
              <Link
                to="/login"
                role="menuitem"
                onClick={closeMenu}
                onMouseEnter={() => prefetchLogin()}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-bg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {t("nav.signIn")}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Context-Aware Primary CTA */}
      {isLoggedIn ? (
        <Link
          to="/create-event"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          {t("nav.createEvent") || "Create Event"}
        </Link>
      ) : (
        <Link
          to="/signup"
          onMouseEnter={() => prefetchSignup()}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          {t("nav.getStarted")}
        </Link>
      )}
    </div>
  );
};

export default AuthButtons;
