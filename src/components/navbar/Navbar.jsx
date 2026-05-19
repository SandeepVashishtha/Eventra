import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useNavbarHeight from "./hooks/useNavbarHeight";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  useBodyScrollLock(isMobileMenuOpen);

  
  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 border-b border-border z-50 transition-all duration-300"
      >
        <div className="h-full px-6 flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center justify-center gap-2">
              <img src="/Eventra.png" alt="Eventra Logo" className="h-8 w-8 rounded-xl object-contain" />
              <h1 className="text-xl font-bold text-text">Eventra</h1>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <DesktopNavbar isAuthenticated={isAuthenticated()} user={user} logout={logout} />
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card-bg text-text transition-all duration-300 hover:scale-105"
            >
              <img src={isDarkMode ? "/sun.svg" : "/moon.svg"} alt="" />
            </button>
            <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            <MobileNavbar
              isOpen={isMobileMenuOpen}
              setIsOpen={setIsMobileMenuOpen}
              isAuthenticated={isAuthenticated()}
              user={user}
              logout={logout}
            />
          </div>
        </div>
      </nav>

      
    </>
  );
};

export default Navbar;
