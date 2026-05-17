import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";

const ProfileMenu = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on navigation
  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
      >
        {user?.profilePicture ? (
          <img loading="lazy"
            src={user.profilePicture}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <User />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-56 p-2 z-[100]">
          <Link
            to="/dashboard"
            onClick={handleItemClick}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <button
            onClick={() => {
              handleItemClick();
              logout();
            }}
            className="flex items-center gap-2 px-3 py-2 w-full text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;