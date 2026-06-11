import { Menu } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

const MobileNavbar = ({
  isOpen,
  setIsOpen,
  isAuthenticated,
  user,
  logout,
  cursorEnabled,
  toggleCursor,
}) => {
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mobile-menu-button inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-3 text-text-light transition-colors hover:bg-bg-secondary hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="mobile-navigation-drawer"
        title={isOpen ? "Close menu" : "Open menu"}
      >
        <Menu
          className="h-6 w-6 transition-transform duration-200"
          aria-hidden="true"
        />
      </button>

      <MobileDrawer
        isOpen={isOpen}
        closeMenu={() => setIsOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
        cursorEnabled={cursorEnabled}
        toggleCursor={toggleCursor}
      />
    </>
  );
};

export default MobileNavbar;