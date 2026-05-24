import React from "react";
import MobileDrawer from "./MobileDrawer";

const MobileNavbar = ({ isOpen, setIsOpen, isAuthenticated, user, logout }) => {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      <MobileDrawer
        isOpen={isOpen}
        closeMenu={() => setIsOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
      />
    </>
  );
};

export default MobileNavbar;