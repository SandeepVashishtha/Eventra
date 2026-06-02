import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import ProfileMenu from "./ProfileMenu";
import AuthButtons from "./AuthButtons";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();
  const { isDarkMode, toggleTheme } = useTheme();

  useBodyScrollLock(isMobileMenuOpen);
  const handleCloseModals = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    const searchInput = document.querySelector(
      'input[type="text"], input[type="search"]'
    );

    if (searchInput) searchInput.focus();
  }, []);

  const handleNewEvent = useCallback(() => {
    const createEventBtn = document.querySelector(
      '[aria-label*="Create Event"], [aria-label*="create"]'
    );

    if (createEventBtn) createEventBtn.click();
  }, []);

  useKeyboardShortcuts({
    onCloseModals: handleCloseModals,
    onSearchFocus: handleSearchFocus,
    onNewEvent: handleNewEvent,
  });

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
        className="sticky top-0 left-0 w-full h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-850 z-[200] transition-all duration-300"
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Eventra home logo template" className="flex items-center shrink-0 min-w-0">
            <div className="flex min-w-0 items-center gap-2.5 xl:gap-3">
              <div className="flex h-10 w-10 xl:h-11 xl:w-11 flex-none items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-1.5 shadow-xs ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
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

          {/* Desktop Links centered in the middle of the navbar */}
          <DesktopNavbar />

          {/* Right Controls & Actions Container */}
          <div className="flex items-center gap-2 xl:gap-4 shrink-0">
            {/* Desktop Auth/Profile Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {authenticated ? (
                <ProfileMenu user={user} logout={logout} />
              ) : (
                <AuthButtons />
              )}
            </div>

            {/* Vertical Divider - Hidden on mobile/tablet */}
            <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

            {/* Utility Controls (Theme, Cursor) */}
            <div className="hidden sm:flex items-center gap-2 xl:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
                aria-pressed={isDarkMode}
                className="theme-toggle relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="transition-transform duration-500">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </div>
              </button>
              <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            </div>

            <MobileNavbar
              isOpen={isMobileMenuOpen}
              setIsOpen={setIsMobileMenuOpen}
              isAuthenticated={authenticated}
              user={user}
              logout={logout}
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent" aria-hidden="true">
          <div className="h-full bg-blue-500 transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }} />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);
