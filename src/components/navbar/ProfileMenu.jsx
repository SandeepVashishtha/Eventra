import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, LogOut, User, ChevronDown, Info, HelpCircle } from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "View Profile",
    path: "/dashboard/profile",
    icon: User,
  },
  {
    label: "About",
    path: "/about",
    icon: Info,
  },
  {
    label: "Frequently Asked Questions",
    path: "/faq",
    icon: HelpCircle,
  },
];

const ProfileMenu = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [closeMenu]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={
          isOpen
            ? "Close profile menu"
            : "Open profile menu"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {user?.profilePicture ? (
          <img
            loading="lazy"
            src={user.profilePicture}
            alt={`${user?.name || user?.username || "User"} profile`}
            className="w-9 h-9 rounded-full object-cover border border-border transition-colors"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-card-bg border border-border flex items-center justify-center transition-colors">
            <User className="text-text-light w-4.5 h-4.5" />
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-text-light transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-border bg-navbar shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* User Info */}
          <div className="px-3 py-2 mb-2 border-b border-border">
            <p className="text-sm font-semibold text-text truncate">
              {user?.name || user?.username || "User"}
            </p>

            <p className="text-xs text-text-light truncate">
              {user?.email || "Logged in"}
            </p>
          </div>

          {/* Menu Links */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-light hover:bg-bg hover:text-text transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-2" />

          {/* Logout */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ProfileMenu);
