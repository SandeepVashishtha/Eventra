import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import ThemeToggleButton from "../Layout/ThemeToggleButton";
import InstallAppButton from "../common/InstallAppButton";
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

    window.addEventListener("scroll", handleScroll, { passive: true });
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
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/30 ${
          scrolled ? "shadow-premium-md border-primary/10" : "shadow-premium-sm border-transparent"
        }`}
      >
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
          {/* FIXED: Added overflow-hidden and min-width-0 to prevent overflow */}
          <div className="flex h-16 items-center justify-between gap-2 overflow-hidden min-w-0">
            
            {/* Logo - Fixed width */}
            <Link to="/" aria-label="Eventra Home" className="flex items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-1 shadow-md shadow-primary/10 ring-1 ring-primary/20 dark:ring-blue-500/30 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/favicon.png"
                    alt="Eventra Logo"
                    className="h-full w-full object-contain"
                    width="32"
                    height="32"
                  />
                </div>
                <span className="font-heading text-base font-bold tracking-wider bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Eventra
                </span>
              </div>
            </Link>

            {/* FIXED: Desktop Navigation - Added flex-shrink and min-width-0 */}
            <div className="hidden lg:flex flex-1 justify-center min-w-0 mx-1 overflow-hidden">
              <DesktopNavbar />
            </div>

            {/* Controls & CTAs */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              {/* Desktop CTAs & Profile */}
              <div className="hidden lg:flex items-center gap-2">
                {authenticated ? (
                  <>
                    <NotificationBell />
                    <ProfileMenu user={user} logout={logout} />
                  </>
                ) : (
                  <AuthButtons />
                )}
              </div>

              {/* Mobile Notifications */}
              <div className="flex items-center gap-2 lg:hidden">
                {authenticated && <NotificationBell />}
              </div>

              {/* Navigation Drawer Toggle */}
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
        </div>

        <div aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-full">
          <div
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);