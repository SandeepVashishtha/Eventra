import React from "react";
import { Link } from "react-router-dom";
import NavbarLinks from "./NavbarLinks";

const MobileDrawer = ({
  isOpen,
  closeMenu,
  isAuthenticated,
  user,
  logout,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[85%] bg-white dark:bg-gray-900 z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-2xl font-bold">Eventra</h2>

        <button
          onClick={closeMenu}
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          X
        </button>
      </div>

      <div className="p-4 overflow-x-auto space-y-6">
  <NavbarLinks />

  {isAuthenticated && (
    <div className="flex flex-col gap-4 border-t pt-4">
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
        className="text-left text-sm font-medium py-2 text-red-500"
      >
        Logout
      </button>
    </div>
  )}
</div>
    </div>
  );
};

export default MobileDrawer;