import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import NavbarLinks from "./NavbarLinks";

const MobileDrawer = ({
  isOpen,
  closeMenu,
  isAuthenticated,
  user,
  logout,
}) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[85%] bg-white dark:bg-gray-900 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <img
            src="/Eventra.png"
            alt="Eventra Logo"
            className="h-8 w-8 rounded-xl object-contain"
          />
          <h2 className="text-2xl font-bold">Eventra</h2>
        </div>
        <button
          onClick={closeMenu}
          aria-label="Close navigation menu"
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          X
        </button>
      </div>

      <div className="p-4 overflow-x-auto space-y-6">
        <NavbarLinks vertical={true} onClick={closeMenu} />

        {isAuthenticated ? (
          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="flex items-center gap-3 py-3 px-1 text-gray-500 text-base">
              <span>{user?.name}</span>
            </div>
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className="text-sm font-medium py-2"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={closeMenu}
              className="text-sm font-medium py-2"
            >
              Edit Profile
            </Link>
            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="flex items-center gap-3 py-3 px-1 w-full text-left text-base text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            <Link
              to="/login"
              onClick={closeMenu}
              className={`flex items-center gap-1.5 py-2 text-sm font-medium transition-all duration-200 pl-3 border-l-2 w-full ${
                isActive("/login")
                  ? "text-black dark:text-white border-black dark:border-white font-semibold"
                  : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
              }`}
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>
            <Link
              to="/signup"
              onClick={closeMenu}
              className={`flex items-center gap-1.5 py-2 text-sm font-medium transition-all duration-200 pl-3 border-l-2 w-full ${
                isActive("/signup")
                  ? "text-black dark:text-white border-black dark:border-white font-semibold"
                  : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default MobileDrawer;