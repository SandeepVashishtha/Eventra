import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  User,
  UserCog,
} from "lucide-react";

const ProfileMenu = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User profile menu"
        className="rounded-full p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {user?.profilePicture ? (
          <img
            loading="lazy"
            src={user.profilePicture}
            alt="profile"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="h-5 w-5" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-56 rounded-lg bg-white p-2 shadow-xl dark:bg-gray-900"
        >
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            to="/profile"
            role="menuitem"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <UserCog className="h-4 w-4" />
            Edit Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-gray-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
