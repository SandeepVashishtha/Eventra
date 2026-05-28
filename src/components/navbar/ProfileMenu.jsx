import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

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
        className="flex items-center gap-2 rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
      >
        {user?.profilePicture ? (
          <img
            loading="lazy"
            src={user.profilePicture}
            alt={`${user?.name || user?.username || "User"} profile`}
            className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-500 transition-colors">
            <User className="text-gray-600 dark:text-gray-300 w-5 h-5" />
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* User Info */}
          <div className="px-3 py-2 mb-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.name || user?.username || "User"}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

          {/* Logout */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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