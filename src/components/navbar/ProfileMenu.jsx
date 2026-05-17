import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  User,
  Settings
} from "lucide-react";

const ProfileMenu = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-none"
      >
        {user?.profilePicture ? (
          <img loading="lazy"
            src={user.profilePicture}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-500 transition-colors">
            <User className="text-gray-600 dark:text-gray-300 w-5 h-5" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-56 p-2 z-50 border border-gray-100 dark:border-gray-800">
          <div className="px-3 py-2 mb-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'Logged in'}
            </p>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </Link>

          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;