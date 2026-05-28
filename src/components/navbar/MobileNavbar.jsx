import React from "react";
import { Menu } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

const MobileNavbar = ({ isOpen, setIsOpen, isAuthenticated, user, logout }) => {
  return (
    <>
      <button aria-label="button"
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
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
