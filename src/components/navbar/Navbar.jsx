import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import AuthButtons from "./AuthButtons";
import ProfileMenu from "./ProfileMenu";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const authenticated = isAuthenticated();

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
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
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

  // Dark mode aware scrolled background — light mode same as before
  const scrolledBg = scrolled
    ? resolvedTheme === "dark"
      ? "linear-gradient(180deg, rgba(17,24,39,0.98) 0%, rgba(15,23,42,0.96) 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,248,251,0.96) 100%)"
    : undefined;

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className={`sticky top-0 left-0 w-full z-[200] transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-md border-b border-transparent shadow-[0_1px_0_rgba(15,23,42,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
        style={scrolledBg ? { background: scrolledBg } : undefined}
      >
        <div className="relative px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" aria-label="Eventra home logo template" className="relative z-10 flex items-center shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-card-bg p-1 shadow-premium-sm ring-1 ring-border">
                <img
                  src="/favicon.png"
                  alt="Eventra Brand Logo"
                  className="block h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <h1 className="truncate text-base sm:text-lg lg:text-xl font-heading font-semibold text-text tracking-tight">Eventra</h1>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center justify-center flex-1 overflow-x-auto">
            <DesktopNavbar />
          </div>

          {/* Right Controls */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="hidden xl:flex items-center gap-2.5">
              {authenticated ? (
                <ProfileMenu user={user} logout={logout} />
              ) : (
                <AuthButtons />
              )}

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card-bg hover:bg-primary/10 transition-colors duration-200"
              >
                {resolvedTheme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            </div>

            <div className="xl:hidden">
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