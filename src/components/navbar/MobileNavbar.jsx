import React from "react";
import MobileDrawer from "./MobileDrawer";

const MobileNavbar = ({ isOpen, setIsOpen, isAuthenticated, user, logout }) => {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
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