import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Info, HelpCircle, LogIn } from "lucide-react";

const prefetchLogin = () => import("../../components/auth/Login");
const prefetchSignup = () => import("../../components/auth/Signup");

const AuthButtons = () => {
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
          <div className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-medium text-text-light transition-colors hover:bg-bg-secondary hover:text-text">
            {t("nav.profile")}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {isOpen && (
          <div
            id={menuId}
            role="menu"
            className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-xl border border-border bg-navbar p-2 shadow-lg duration-100"
          >
            <div className="space-y-1">
              <Link
                to="/about"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light transition-colors hover:bg-bg hover:text-text"
              >
                <Info className="h-4 w-4" />
                {t("nav.about")}
              </Link>
              <Link
                to="/faq"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light transition-colors hover:bg-bg hover:text-text"
              >
                <HelpCircle className="h-4 w-4" />
                {t("nav.faqFull")}
              </Link>
            </div>

            <div role="separator" className="my-2 h-px bg-border" />

            <Link
              to="/login"
              role="menuitem"
              onClick={closeMenu}
              onMouseEnter={() => prefetchLogin()}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-bg"
            >
              <LogIn className="h-4 w-4" />
              {t("nav.signIn")}
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/signup"
        onMouseEnter={() => prefetchSignup()}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:translate-y-0"
      >
        {t("nav.getStarted")}
      </Link>
    </div>
  );
};

export default AuthButtons;
