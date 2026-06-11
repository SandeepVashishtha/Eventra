import { useRef, useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, LogOut, User, ChevronDown, Info, HelpCircle } from "lucide-react";

const menuItems = [
  { labelKey: "nav.dashboard", path: "/dashboard", icon: LayoutDashboard },
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
    // Restore focus to the trigger button when the menu closes
    buttonRef.current?.focus();
  }, []);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  // Move focus into the first menu item whenever the menu opens
  useEffect(() => {
    if (!isOpen) return;
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const firstFocusable = menuEl.querySelector('a[href], button:not([aria-expanded])');
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

      // Focus trap — only active while the menu is open
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
        className="flex items-center gap-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {user?.profilePicture ? (
          <img
            loading="lazy"
            src={user.profilePicture}
            alt={`${user?.name || "User"} profile`}
            className="h-9 w-9 rounded-full border border-border object-cover transition-colors"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card-bg transition-colors">
            <User className="h-4.5 w-4.5 text-text-light" />
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-text-light transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-modal="true"
          aria-orientation="vertical"
          aria-label="Profile menu"
          className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-3 w-56 origin-top-right rounded-xl border border-border bg-navbar p-2 shadow-lg duration-100"
        >
          <div className="mb-2 border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-text">
              {user?.name || user?.username || "User"}
            </p>
            <p className="truncate text-xs text-text-light">
              {user?.email || "Logged in"}
            </p>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light transition-colors hover:bg-bg hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="my-2 h-px bg-border" />

          {/* Logout: uses semantic text-error / hover:bg-error/10 for dark-mode
              consistency, and focus-visible:ring-primary to match all other items */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="text-error hover:bg-error/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ProfileMenu);