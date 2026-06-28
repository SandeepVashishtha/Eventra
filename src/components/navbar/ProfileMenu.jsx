import { useRef, useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  Info,
  HelpCircle,
  PlusCircle,
} from "lucide-react";

const menuItems = [
  { labelKey: "nav.dashboard", path: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.createEvent", path: "/events/create", icon: PlusCircle },
  { labelKey: "nav.viewProfile", path: "/dashboard/profile", icon: User },
  { labelKey: "nav.about", path: "/about", icon: Info },
  { labelKey: "nav.faqFull", path: "/faq", icon: HelpCircle },
];

const ProfileMenu = ({ user, logout }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return;
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const firstFocusable = menuEl.querySelector("a[href], button:not([aria-expanded])");
    firstFocusable?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) closeMenu();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key === "Tab" && isOpen && menuRef.current) {
        const focusable = Array.from(
          menuRef.current.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close profile menu" : "Open profile menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/80 hover:bg-white shadow-sm hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 p-1 pr-3 backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {user?.profilePicture ? (
          <img
            loading="lazy"
            src={user.profilePicture}
            alt={`${user?.name || "User"} profile`}
            className="w-7 h-7 rounded-full object-cover transition-colors ring-1 ring-border shadow-sm"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-card-bg flex items-center justify-center transition-colors ring-1 ring-border shadow-sm">
            <User className="text-text-light w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
        )}
        <span className="text-sm font-medium tracking-wide hidden sm:block text-text-light hover:text-text">{user?.name?.split(" ")[0] || "Profile"}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-light transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 mb-2 border-b border-border">
            <p className="text-sm font-semibold text-text truncate">
              {user?.name || user?.username || "User"}
            </p>
            <p className="text-xs text-text-light truncate">{user?.email || "Logged in"}</p>
          </div>

          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="h-px bg-border my-2" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-error hover:bg-error/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ProfileMenu);
