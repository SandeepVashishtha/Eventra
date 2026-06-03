import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import AuthButtons from "./AuthButtons";
import ProfileMenu from "./ProfileMenu";
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
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

          setScrollProgress(progress);
          setScrolled(scrollTop > 12);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className={`sticky top-0 left-0 w-full z-[200] transition-all duration-300 ${
          scrolled 
            ? 'backdrop-blur-md border-b border-slate-200/50 shadow-sm' 
            : 'bg-transparent border-b border-transparent'
        }`}
        style={scrolled ? {
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,248,251,0.96) 100%)',
        } : undefined}
      >
        <div className="px-6 py-3 flex items-center justify-between w-full gap-4">
          
          {/* 1. Left Section: Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" aria-label="Eventra home logo" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-card-bg p-1 shadow-premium-sm ring-1 ring-border">
                <img
                  src="/favicon.png"
                  alt="Eventra Brand Logo"
                  className="block h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <h1 className="text-lg font-heading font-bold text-text tracking-tight">Eventra</h1>
            </Link>
          </div>

          {/* 2. Middle Section: Maps the nav links with equal spacing */}
          <div className="hidden xl:flex items-center justify-center min-w-0">
            <DesktopNavbar />
          </div>

          {/* 3. Right Section: Profile & System Buttons */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <div className="hidden xl:flex items-center gap-3">
              {authenticated ? (
                <ProfileMenu user={user} logout={logout} />
              ) : (
                <AuthButtons />
              )}
              <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            </div>

            <div className="xl:hidden">
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
        
        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent" aria-hidden="true">
          <div className="h-full bg-primary transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }} />
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);