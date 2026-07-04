import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import ThemeToggleButton from "../Layout/ThemeToggleButton";
import AuthButtons from "./AuthButtons";
import LanguageSelector from "../LanguageSelector";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "../notifications/NotificationBell";

import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const navRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();

  const { isDarkMode, toggleTheme, setIsCustomizerOpen } = useTheme();

  useBodyScrollLock(isMobileMenuOpen);

  const handleCloseModals = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    const searchInput = navRef.current?.querySelector('input[type="text"], input[type="search"]');

    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleNewEvent = useCallback(() => {
    const createButton = navRef.current?.querySelector(
      '[aria-label*="Create Event"], [aria-label*="create"]'
    );

    if (createButton) {
      createButton.click();
    }
  }, []);

  useKeyboardShortcuts({
    onCloseModals: handleCloseModals,
    onSearchFocus: handleSearchFocus,
    onNewEvent: handleNewEvent,
  });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        setScrollProgress(progress);
        setScrolled(scrollTop > 12);

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white/70 backdrop-blur-md dark:bg-black/70 border-b border-gray-200/50 dark:border-zinc-800/50 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link to="/" aria-label="Eventra Home" className="flex items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-card-bg p-1 shadow-premium-sm ring-1 ring-border">
                  <img
                    src="/favicon.png"
                    alt="Eventra Logo"
                    className="h-full w-full object-contain"
                    width="32"
                    height="32"
                  />
                </div>

                <span className="font-heading text-base font-semibold tracking-tight text-text">
                  Eventra
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — allowed to flex-shrink */}
            <div className="hidden lg:flex flex-1 justify-center min-w-0 mx-1 overflow-visible">
              <DesktopNavbar />
            </div>

            {/* Right Controls */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <ThemeToggleButton
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  isMobile={false}
                  setIsCustomizerOpen={setIsCustomizerOpen}
                />
                {authenticated ? (
                  <>
                    <NotificationBell />
                    <LanguageSelector compact />
                    <ProfileMenu user={user} logout={logout} />
                  </>
                ) : (
                  <>
                    <LanguageSelector compact />
                    <AuthButtons />
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggleButton
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  isMobile={false}
                  setIsCustomizerOpen={setIsCustomizerOpen}
                />
                {authenticated && <NotificationBell />}

                <MobileNavbar
                  isOpen={isMobileMenuOpen}
                  setIsOpen={setIsMobileMenuOpen}
                  isAuthenticated={authenticated}
                  user={user}
                  logout={logout}
                />
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-full">
          <div
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{
              width: `${scrollProgress}%`,
            }}
          />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);
