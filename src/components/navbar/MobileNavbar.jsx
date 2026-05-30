import { Menu } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

const MobileNavbar = ({ isOpen, setIsOpen, isAuthenticated, user, logout }) => {
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mobile-menu-button xl:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-3 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
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
      />
    </>
  );
};

export default MobileNavbar;