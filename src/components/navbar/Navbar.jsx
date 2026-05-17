import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useNavbarHeight from "./hooks/useNavbarHeight";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  useBodyScrollLock(isMobileMenuOpen);

  const navHeight = useNavbarHeight(navRef);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 border-b z-50"
      >
        <div className="h-full px-6 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-3xl font-bold">Eventra</h1>
          </Link>

          <DesktopNavbar
            isAuthenticated={isAuthenticated()}
            user={user}
            logout={logout}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            cursorEnabled={cursorEnabled}
            toggleCursor={toggleCursor}
          />

          <MobileNavbar
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
          />
        </div>
      </nav>

      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;