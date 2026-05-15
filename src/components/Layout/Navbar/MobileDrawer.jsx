import React from "react";
import { Link } from "react-router-dom";
import {
  User as UserIcon,
  LogOut,
  LogIn,
  LayoutDashboard,
  Sparkles,
  MousePointer,
} from "lucide-react";
import { UserCog } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { MobileNavLinks } from "./NavLinks";

const MobileDrawer = ({
  drawerRef,
  isMobileMenuOpen,
  closeBtnRef,
  navItems,
  location,
  openDropdown,
  setOpenDropdown,
  closeAllMenus,
  user,
  isAuthenticated,
  primaryLine,
  secondaryLine,
  handleLogoutClick,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  cursorEnabled,
  toggleCursor,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      id="mobile-drawer"
      ref={drawerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed top-0 right-0 h-dvh overflow-y-auto w-[88vw] max-w-sm shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out 
      bg-white backdrop-blur-lg dark:bg-gray-900/95
      ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      role="dialog"
      aria-modal={isMobileMenuOpen}
    >
      {/* Drawer header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 dark:border-white/20">
        <h2
          className="text-xl sm:text-2xl font-bold text-black dark:text-white"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Eventra
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-light bg-gray-100 dark:bg-white/10 hover:bg-gray-200"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button
            ref={closeBtnRef}
            onClick={closeAllMenus}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-grow p-3.5 sm:p-4 space-y-2 overflow-y-auto">
        <MobileNavLinks
          navItems={navItems}
          location={location}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          closeAllMenus={closeAllMenus}
        />
      </div>

      {/* Footer: auth + cursor toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-white/20">
        {isAuthenticated() ? (
          <div className="space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800 dark:text-white truncate">
                  {primaryLine}
                </p>
                {secondaryLine && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {secondaryLine}
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/dashboard"
              onClick={closeAllMenus}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${
                location.pathname === "/dashboard"
                  ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>

            <Link
              to="/profile"
              onClick={closeAllMenus}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${
                location.pathname === "/profile"
                  ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <UserCog className="w-5 h-5" />
              Edit Profile
            </Link>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              to="/login"
              onClick={closeAllMenus}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-transparent"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={closeAllMenus}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-black dark:text-white bg-white dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-white/10 border-2 border-black/15 dark:border-white/20 hover:border-black/25 dark:hover:border-white/30 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Get Started
            </Link>
          </div>
        )}

        <hr className="my-3" />

        <button
          onClick={toggleCursor}
          className="flex items-center gap-3
          w-full
          px-4 py-2.5
          rounded-lg
          bg-black
          text-white
          hover:bg-zinc-800
          transition-colors
          font-medium"
        >
          <MousePointer className="w-5 h-5" />
          {cursorEnabled ? "Turn Cursor OFF" : "Turn Cursor ON"}
        </button>
      </div>
    </div>
  );
};

export default MobileDrawer;