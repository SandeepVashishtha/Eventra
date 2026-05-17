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
        className="fixed top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700/50 z-[110] overflow-x-hidden transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-black dark:text-white tracking-tighter truncate max-w-[200px] sm:max-w-none">
              Eventra
            </h1>
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