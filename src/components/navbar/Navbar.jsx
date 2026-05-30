import {
  memo,
  useRef,
  useState,
  useEffect,
} from "react";
import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import useBodyScrollLock from "./hooks/useBodyScrollLock";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();
  const { isDarkMode, toggleTheme } = useTheme();

  useBodyScrollLock(isMobileMenuOpen);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;

          const progress =
            docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

          setScrollProgress(progress);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className="sticky top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 border-b border-border z-[200] transition-all duration-300"
      >
        <div className="h-full px-4 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Eventra home logo template" className="flex items-center shrink-0 min-w-0">
            <div className="flex min-w-0 items-center gap-2 xl:gap-3">
              <div className="flex h-10 w-10 xl:h-11 xl:w-11 flex-none items-center justify-center overflow-hidden rounded-xl bg-gray-100 p-1 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                <img
                  src="/favicon.png"
                  alt="Eventra Brand Logo"
                  className="block h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <h1 className="truncate text-lg sm:text-xl xl:text-2xl font-heading font-bold text-text">Eventra</h1>
            </div>
          </Link>

          {/* Desktop Links should be in the middle of the navbar */}
          <DesktopNavbar isAuthenticated={authenticated} user={user} logout={logout} />

          {/* Right Controls Container */}
          <div className="flex items-center gap-2 xl:gap-4 shrink-0">
          {/* Hide these on mobile */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={isDarkMode}
              className="theme-toggle relative flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="transition-transform duration-500">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </div>
            </button>
            <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            </div>
            <MobileNavbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} isAuthenticated={authenticated} user={user} logout={logout} />
          </div>
        </div>
        <div iv className="absolute bottom-0 left-0 w-full h-1 bg-transparent" aria-hidden="true">
          <div className="h-full bg-blue-500 transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }} />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);
