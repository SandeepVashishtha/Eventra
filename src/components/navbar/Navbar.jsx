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
        className="fixed top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 border-b border-border z-50 transition-all duration-300"
      >
        <div className="h-full px-6 flex items-center justify-between">

          {/* Logo */}
          <Link to="/">
            <h1 className="text-3xl font-bold text-text">
              Eventra
            </h1>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* Dark Mode Toggle */}
          <button
  onClick={toggleTheme}
  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card-bg text-text transition-all duration-300 hover:scale-105"
>
  {isDarkMode ? "☀️" : "🌙"}
</button>

            {/* Desktop Navbar */}
  <DesktopNavbar
  isAuthenticated={isAuthenticated()}
  user={user}
  logout={logout}
/>

            {/* Mobile Navbar */}
            <MobileNavbar
              isOpen={isMobileMenuOpen}
              setIsOpen={setIsMobileMenuOpen}
            />
          </div>
        </div>
      </nav>

      {/* Navbar Spacer */}
      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;