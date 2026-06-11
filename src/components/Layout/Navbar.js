import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Book,
  Bell,
  Bookmark,
  Calendar,
  CalendarDays,
  FolderKanban,
  HelpCircle,
  Home,
  Info,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trophy,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ConfirmationModal from "../common/ConfirmationModal";
import CommandPalette from "../common/CommandPalette";
import {
  getUserDisplayNames,
  clearBodyScrollStyles,
  setBodyScrollStyles,
} from "./navbarHelpers";
import BrandMark from "./BrandMark";
import ThemeToggleButton from "./ThemeToggleButton";
import CursorToggleButton from "./CursorToggleButton";
import AuthButtons from "./AuthButtons";
import DesktopNavLink from "./DesktopNavLink";
import DesktopNavGroup from "./DesktopNavGroup";
import UserProfileDropdown from "./UserProfileDropdown";
import MobileDrawer from "./MobileDrawer";
import ThemeCustomizer from "./ThemeCustomizer";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
  {
    name: "Events",
    icon: <Calendar className="h-5 w-5" />,
    subItems: [
      { name: "Explore Events", href: "/events", icon: <Calendar className="h-5 w-5" /> },
      { name: "Event Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
      { name: "Bookmarks",      href: "/bookmarks", icon: <Bookmark className="h-5 w-5" /> },
      { name: "Reminders",      href: "/reminders", icon: <Bell className="h-5 w-5" /> },
    ],
  },
  { name: "Hackathons", href: "/hackathons", icon: <Trophy className="h-5 w-5" /> },
  { name: "Projects", href: "/projects", icon: <FolderKanban className="h-5 w-5" /> },
  {
    name: "Community",
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { name: "Leaderboard", href: "/leaderboard", icon: <Trophy className="h-5 w-5" /> },
      { name: "Contributors", href: "/contributors", icon: <Users className="h-5 w-5" /> },
      { name: "Contributors Guide", href: "/contributorguide", icon: <Book className="h-5 w-5" /> },
      { name: "Community Events", href: "/community-event", icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    name: "More",
    icon: <MoreHorizontal className="h-5 w-5" />,
    subItems: [
      { name: "About", href: "/about", icon: <Info className="h-5 w-5" /> },
      { name: "FAQ", href: "/faq", icon: <HelpCircle className="h-5 w-5" /> },
      { name: "Contact", href: "/contact", icon: <MessageSquare className="h-5 w-5" /> },
    ],
  },
];

const DesktopNavLinks = ({ openDropdown, setOpenDropdown }) => {
  const location = useLocation();
  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center pl-6 lg:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href
          ? (item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href))
          : item.subItems?.some(s => location.pathname.startsWith(s.href));

        if (item.subItems) {
          return (
            <DesktopNavGroup key={item.name} item={item} isActive={isActive} isOpen={openDropdown === item.name} onToggle={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === item.name ? null : item.name); }} setOpenDropdown={setOpenDropdown} />
          );
        }
        return <DesktopNavLink key={item.name} item={item} isActive={isActive} />;
      })}
    </div>
  );
};

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const handleToggle = () => setShowCommandPalette((prev) => !prev);
    const handleClose = () => setShowCommandPalette(false);

    window.addEventListener("toggleCommandPalette", handleToggle);
    window.addEventListener("closeCommandPalette", handleClose);

    return () => {
      window.removeEventListener("toggleCommandPalette", handleToggle);
      window.removeEventListener("closeCommandPalette", handleClose);
    };
  }, []);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);
  const navRef = useRef(null);
  
  // 🔥 FIX: Track mounted state for async logout safety
  const isMounted = useRef(true);

  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme, setIsCustomizerOpen } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { primary: primaryLine, secondary: secondaryLine } = getUserDisplayNames(user);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    clearBodyScrollStyles();
    try {
      toggleBtnRef.current?.focus();
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: isMobileMenuOpen }));
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setBodyScrollStyles(window.scrollY || 0);
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      clearBodyScrollStyles();
    }
    return clearBodyScrollStyles;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAllMenus();
        return;
      }
      if (e.key === "Tab") {
        const focusable = drawer.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (navRef.current) setNavHeight(navRef.current.offsetHeight);
    const handleResize = () => {
      if (navRef.current) setNavHeight(navRef.current.offsetHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchCurrentXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const delta = (touchCurrentXRef.current ?? 0) - (touchStartXRef.current ?? 0);
    if (delta > 50) closeAllMenus();
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  // 🔥 FIX: Made handler async and added unmount safety guards
  const handleConfirmLogout = async () => {
    if (isMounted.current) {
      setShowLogoutModal(false);
    }
    
    // Await logout to ensure backend token/context clears before navigation
    await logout();
    
    if (isMounted.current) {
      toast.success("You have been logged out successfully.", {
        className: "custom-toast",
        autoClose: 3000,
      });
      navigate("/");
    }
  };
  
  const handleCancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      {/* Skip navigation — visible only on keyboard focus, WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          isMobileMenuOpen || showLogoutModal
            ? "bg-black/60 opacity-100"
            : showProfileDropdown || openDropdown
              ? "bg-transparent opacity-100"
              : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
        aria-hidden="true"
      />
      <nav
        ref={navRef}
        aria-label="Main navigation"
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
        className="fixed top-2 right-2 left-2 z-[90] mx-auto max-w-7xl overflow-visible rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg shadow-indigo-500/5 backdrop-blur-xl transition-all duration-300 sm:top-4 sm:right-4 sm:left-4 dark:border-slate-800/80 dark:bg-slate-950/80"
      >
        <div className="neon-navbar-border"></div>

        <div className="mx-auto flex min-h-[68px] w-full max-w-screen-2xl items-center justify-between gap-4 overflow-visible px-4 md:px-6 xl:px-10">
          
          {/* Logo */}
          <Link
            to="/"
            className="z-20 mr-2 flex min-w-0 shrink-0 items-center"
          >
            <BrandMark />
          </Link>

          {/* Centered Desktop Nav Links */}
          <DesktopNavLinks openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />

          {/* Right Controls */}
          <div className="hidden shrink-0 items-center gap-2 pl-2 lg:flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCommandPalette(true)}
              title="Open Command Palette (⌘K)"
              className="group mr-1 flex items-center gap-2 rounded-full border border-zinc-200/60 bg-zinc-100 px-3 py-1.5 transition-all duration-300 hover:bg-indigo-50 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] focus:outline-none dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:hover:bg-indigo-900/40"
            >
              <Search className="h-4 w-4 text-zinc-500 group-hover:text-indigo-500 dark:text-zinc-400 dark:group-hover:text-indigo-400" />
              <div className="flex items-center gap-0.5 text-[9px] font-black tracking-widest text-zinc-400 uppercase group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                <span>⌘</span>
                <span>K</span>
              </div>
            </motion.button>

            <ThemeToggleButton
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              isMobile={false}
              setIsCustomizerOpen={setIsCustomizerOpen}
            />

            <CursorToggleButton
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
              isMobile={false}
            />

            <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700"></div>

            {isAuthenticated() ? (
              <UserProfileDropdown
                user={user}
                primaryLine={primaryLine}
                secondaryLine={secondaryLine}
                showProfileDropdown={showProfileDropdown}
                setShowProfileDropdown={setShowProfileDropdown}
                location={location}
                handleLogoutClick={handleLogoutClick}
              />
            ) : (
              <AuthButtons isMobile={false} />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="ml-auto lg:hidden">
            <button
              ref={toggleBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        drawerRef={drawerRef}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        closeAllMenus={closeAllMenus}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        closeBtnRef={closeBtnRef}
        handleLogoutClick={handleLogoutClick}
        primaryLine={primaryLine}
        secondaryLine={secondaryLine}
        cursorEnabled={cursorEnabled}
        toggleCursor={toggleCursor}
        navItems={NAV_ITEMS}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        cursorEnabled={cursorEnabled}
        toggleCursor={toggleCursor}
        isAuthenticated={isAuthenticated}
        handleLogoutClick={handleLogoutClick}
      />

      <ThemeCustomizer />

      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;