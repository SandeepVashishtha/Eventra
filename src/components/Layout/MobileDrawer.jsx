import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, User as UserIcon, LayoutDashboard, UserCog, LogOut, LogIn, Sparkles, MousePointer } from 'lucide-react';
import ThemeToggleButton from "../common/ThemeToggleButton";

const MobileDrawer = ({
  drawerRef,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  isMobileMenuOpen,
  closeBtnRef,
  closeAllMenus,
  navItems,
  openDropdown,
  setOpenDropdown,
  isAuthenticated,
  user,
  primaryLine,
  secondaryLine,
  handleLogoutClick,
  cursorEnabled,
  toggleCursor
}) => {
  const location = useLocation();

  return (
    <div
      id="mobile-drawer"
      ref={drawerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed top-0 right-0 h-dvh overflow-y-auto w-[88vw] max-w-sm shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out 
      bg-white backdrop-blur-lg dark:bg-zinc-950/95
      ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      role="dialog"
      aria-modal={isMobileMenuOpen}
    >
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 dark:border-white/20">
        <h2
          className="text-xl sm:text-2xl font-bold text-black dark:text-white"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Eventra
        </h2>

        <div className="flex items-center gap-3">
          <ThemeToggleButton className="lg:hidden" />
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

      <div className="flex-grow p-3.5 sm:p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href
            ? location.pathname === item.href
            : item.subItems?.some((sub) => location.pathname === sub.href);
          if (item.subItems) {
            return (
              <div key={item.name}>
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === item.name ? null : item.name
                    )
                  }
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium ${
                    isActive
                      ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon} {item.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === item.name ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === item.name && (
                  <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-200 dark:border-white/20 space-y-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={closeAllMenus}
                          className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium ${
                            isSubActive
                              ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {sub.icon}
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={closeAllMenus}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${
                isActive
                  ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/20">
        {isAuthenticated() ? (
          <div className="space-y-1">
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
