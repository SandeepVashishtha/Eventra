import React, {
  useRef,
  useState,
  useEffect,
} from "react";

import { Link } from "react-router-dom";

import {
  Moon,
  Sun,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";

import useBodyScrollLock from "./hooks/useBodyScrollLock";

const Navbar = ({
  cursorEnabled,
  toggleCursor,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  useBodyScrollLock(isMobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className="sticky top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 border-b border-border z-[200] transition-all duration-300"
      >
        <div
          className="
            h-full
            px-4
            flex
            items-center
            justify-between
          "
        >
          {/* Logo */}
          <Link to="/" aria-label="Eventra home">
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <img
                src="/Eventra.png"
                alt=""
                aria-hidden="true"
                className="
                  h-8
                  w-8
                  rounded-xl
                  object-contain
                  bg-gray-200
                  dark:bg-transparent
                  p-1
                "
              />

              <h1
                className="
                  text-xl
                  font-bold
                  text-text
                "
              >
                Eventra
              </h1>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <DesktopNavbar
              isAuthenticated={isAuthenticated()}
              user={user}
              logout={logout}
            />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={isDarkMode}
              className="theme-toggle relative flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="transition-transform duration-500">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </div>
            </button>

            {/* Cursor Toggle */}
            <CursorToggle
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
            />

            {/* Mobile Navbar */}
            <MobileNavbar
              isOpen={isMobileMenuOpen}
              setIsOpen={setIsMobileMenuOpen}
              isAuthenticated={isAuthenticated()}
              user={user}
              logout={logout}
            />
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent">
          <div
            className="h-full bg-blue-500 transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
