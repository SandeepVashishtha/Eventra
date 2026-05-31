import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
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
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className={`sticky top-0 left-0 w-full h-20 z-[200] transition-all duration-300 ${scrolled ? 'bg-navbar/95 backdrop-blur-md border-b border-border' : 'bg-transparent border-b border-transparent'}`}
      >
        <div className="h-full px-4 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Eventra home logo template" className="flex items-center shrink-0 min-w-0">
            <div className="flex min-w-0 items-center gap-2 xl:gap-3">
              <div className="flex h-10 w-10 xl:h-11 xl:w-11 flex-none items-center justify-center overflow-hidden rounded-xl bg-card-bg p-1 shadow-premium-sm ring-1 ring-border">
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
            <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            </div>
            <MobileNavbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} isAuthenticated={authenticated} user={user} logout={logout} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent" aria-hidden="true">
          <div className="h-full bg-primary transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }} />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);
