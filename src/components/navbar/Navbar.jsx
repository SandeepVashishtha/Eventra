import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import ThemeToggleButton from "../Layout/ThemeToggleButton";
import AuthButtons from "./AuthButtons";
import InstallAppButton from "../common/InstallAppButton";
import LanguageSelector from "../LanguageSelector";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "../notifications/NotificationBell";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const { isDarkMode, toggleTheme, setIsCustomizerOpen } = useTheme();

  const { user, isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();

  useBodyScrollLock(isMobileMenuOpen);
  const handleCloseModals = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    const searchInput = navRef.current?.querySelector(
      'input[type="text"], input[type="search"]'
    );

    if (searchInput) searchInput.focus();
  }, []);

  const handleNewEvent = useCallback(() => {
    const createEventBtn = navRef.current?.querySelector(
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
          setScrolled(scrollTop > 12);
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
      {/* Skip link — visually hidden until keyboard-focused; satisfies WCAG 2.4.1 Bypass Blocks */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className={`sticky top-0 left-0 w-full z-[200] transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-md bg-navbar/95 border-b border-border shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="relative px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Logo - Left Section */}
          <Link to="/" aria-label="Eventra home logo template" className="relative z-10 flex items-center shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-card-bg p-1 shadow-premium-sm ring-1 ring-border">
                <img
                  src="/favicon.png"
                  alt="Eventra Brand Logo"
                  className="block h-full w-full object-contain"
                  loading="eager"
                  decoding="async"
                  width="36"
                  height="36"
                />
              </div>
              <h1 className="truncate text-base sm:text-lg lg:text-xl font-heading font-semibold text-text tracking-tight">Eventra</h1>
            </div>
          </Link>

          {/* Desktop Links - Wrapping instead of absolute positioning */}
          <div className="hidden lg:flex items-center justify-center flex-1 ">
            <DesktopNavbar />
          </div>

          {/* Right Controls Container */}
          <div className="relative z-10 flex items-center gap-1 sm:gap-2.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5">
              <LanguageSelector compact />
              {authenticated ? (
                <>
                  <NotificationBell />
                  <ProfileMenu user={user} logout={logout} />
                </>
              ) : (
                <AuthButtons />
              )}
              <InstallAppButton />
              <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            </div>
            <ThemeToggleButton 
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              isMobile={false}
              setIsCustomizerOpen={setIsCustomizerOpen}
            />

            <div className="flex items-center gap-1 lg:hidden">
              {authenticated && <NotificationBell />}
              <MobileNavbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} isAuthenticated={authenticated} user={user} logout={logout} />
            </div>
          </div>
        </div>
        
        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent" aria-hidden="true">
          <div className="h-full bg-primary transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }} />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);