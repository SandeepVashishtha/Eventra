import React, {
  memo,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Moon, Sun, Search, Bell, User, ChevronDown, 
  Plus, Settings, LogOut, HelpCircle, Globe, 
  WifiOff, Download, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CursorToggle from "./CursorToggle";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import { useScrollProgress } from "../../hooks/useScrollProgress"; // ✅ New custom hook
import ShortcutHint from "../common/ShortcutHint"; // ✅ New component

// 🎨 Animation variants for dropdowns & menus
const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const navRef = useRef(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const authenticated = isAuthenticated();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // ✅ Use custom hook for scroll progress (better performance)
  const scrollProgress = useScrollProgress();

  // ✅ Lock body scroll when mobile menu or modals are open
  useBodyScrollLock(isMobileMenuOpen || isUserMenuOpen || isSearchOpen || showShortcuts);

  // 🌐 Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 📱 PWA Install Prompt Detection
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 30s if user hasn't installed
      const timer = setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowPWAInstall(true);
        }
      }, 30000);
      return () => clearTimeout(timer);
    };
    
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // 🔍 Close search on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setShowShortcuts(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🖱️ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌨️ Keyboard shortcuts handler
  const handleCloseModals = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setShowShortcuts(false);
    setIsUserMenuOpen(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  const handleNewEvent = useCallback(() => {
    if (authenticated) {
      navigate("/events/create", { state: { from: location.pathname } });
    } else {
      navigate("/login", { state: { from: "/events/create", intent: "create_event" } });
    }
  }, [authenticated, navigate, location.pathname]);

  const handleInstallPWA = useCallback(async () => {
    if (!deferredPrompt) return;
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === "accepted") {
        setShowPWAInstall(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("PWA install failed:", err);
    }
  }, [deferredPrompt]);

  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [searchQuery, navigate]);

  // ✅ Keyboard shortcuts config
  useKeyboardShortcuts({
    onCloseModals: handleCloseModals,
    onSearchFocus: handleSearchFocus,
    onNewEvent: handleNewEvent,
    onToggleTheme: toggleTheme,
    onShowShortcuts: () => setShowShortcuts(prev => !prev),
  });

  // 🎨 Gradient for scroll progress
  const progressGradient = useMemo(() => {
    if (scrollProgress < 33) return "from-blue-500 to-cyan-400";
    if (scrollProgress < 66) return "from-cyan-400 to-emerald-400";
    return "from-emerald-400 to-lime-400";
  }, [scrollProgress]);

  // 🔔 Mock notification count (replace with real API)
  const notificationCount = useMemo(() => {
    return user?.notifications?.filter(n => !n.read).length || 0;
  }, [user]);

  return (
    <>
      {/* ♿ Skip Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none transition-all"
      >
        Skip to main content
      </a>

      {/* 🌐 Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/90 dark:bg-amber-600/90 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2"
            role="status"
            aria-live="polite"
          >
            <WifiOff size={14} className="animate-pulse" />
            <span>You're offline. Some features may be limited.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 PWA Install Banner */}
      <AnimatePresence>
        {showPWAInstall && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-indigo-600 text-white text-sm py-2 px-4 flex items-center justify-center gap-3"
            role="region"
            aria-label="Install Eventra app"
          >
            <span>🚀 Install Eventra for a better experience!</span>
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium"
            >
              <Download size={12} /> Install
            </button>
            <button
              onClick={() => setShowPWAInstall(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎨 Main Navbar */}
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className={`sticky top-0 left-0 w-full h-20 z-[200] transition-all duration-300 ${
          scrollProgress > 5 
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20" 
            : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        }`}
      >
        {/* 📊 Scroll Progress Bar with Gradient */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800" aria-hidden="true">
          <motion.div 
            className={`h-full bg-gradient-to-r ${progressGradient}`}
            style={{ originX: 0 }}
            animate={{ scaleX: scrollProgress / 100 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        <div className="h-full px-4 max-w-7xl mx-auto flex items-center justify-between">
          {/* 🏷️ Logo & Brand */}
          <Link 
            to="/" 
            aria-label="Eventra home"
            className="flex items-center gap-3 group"
          >
            <motion.img 
              src="/Eventra.png" 
              alt="Eventra" 
              className="h-12 w-auto object-contain rounded-xl bg-gray-100 dark:bg-gray-800 p-1"
              whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            <motion.h1 
              className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
              whileHover={{ scale: 1.02 }}
            >
              Eventra
            </motion.h1>
          </Link>

          {/* 🔍 Search Bar (Expandable) */}
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.form
                key="search-expanded"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "min(400px, 50vw)", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSearchSubmit}
                className="relative flex-1 max-w-md mx-4"
                role="search"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, organizers, tags..."
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  aria-label="Search events"
                />
                <button
                  type="button"
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </motion.form>
            ) : (
              <motion.button
                key="search-collapsed"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={handleSearchFocus}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm group"
                aria-label="Open search (Ctrl+K)"
                title="Search (Ctrl+K)"
              >
                <Search size={16} className="group-hover:text-indigo-500 transition-colors" />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="ml-auto text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded hidden sm:block">
                  Ctrl+K
                </kbd>
              </motion.button>
            )}
          </AnimatePresence>

          {/* 🎮 Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Nav Links */}
            <div className="hidden lg:block">
              <DesktopNavbar 
                isAuthenticated={authenticated} 
                user={user} 
                logout={logout} 
                onNewEvent={handleNewEvent}
              />
            </div>

            {/* 🔔 Notifications */}
            {authenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
                onClick={() => navigate("/notifications")}
              >
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1.5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </motion.button>
            )}

            {/* 🌙 Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={isDarkMode}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Toggle theme (T)"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDarkMode ? "sun" : "moon"}
                  initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* 🖱️ Cursor Toggle */}
            <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />

            {/* 🌍 Language Switcher (Future) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-1 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              aria-label="Change language"
              title="Language"
            >
              <Globe size={16} className="text-gray-600 dark:text-gray-300" />
              <span className="hidden md:inline text-xs font-medium">EN</span>
            </motion.button>

            {/* 👤 User Menu (Authenticated) */}
            {authenticated && user && (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open user menu"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=6366f1&color=fff`}
                      alt={`${user.name || user.email}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700"
                      loading="lazy"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" aria-label="Online" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                    aria-hidden="true" 
                  />
                </motion.button>

                {/* 📋 Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl shadow-black/10 dark:shadow-black/30 z-[250]"
                      role="menu"
                      aria-label="User menu"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1" role="none">
                        {[
                          { icon: User, label: "Profile", href: `/profile/${user.id}`, shortcut: "P" },
                          { icon: Settings, label: "Settings", href: "/settings", shortcut: "," },
                          { icon: Bell, label: "Notifications", href: "/notifications", shortcut: "N", badge: notificationCount },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            role="menuitem"
                          >
                            <span className="flex items-center gap-3">
                              <item.icon size={16} className="text-gray-400" aria-hidden="true" />
                              {item.label}
                            </span>
                            {item.badge > 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <kbd className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded hidden sm:block">
                              {item.shortcut}
                            </kbd>
                          </Link>
                        ))}
                      </div>

                      {/* Divider & Logout */}
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button
                        onClick={handleLogout}
                        disabled={authLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        role="menuitem"
                      >
                        <LogOut size={16} aria-hidden="true" />
                        {authLoading ? "Signing out..." : "Sign out"}
                        <kbd className="ml-auto text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded hidden sm:block">
                          Q
                        </kbd>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 🔑 Auth Buttons (Not Authenticated) */}
            {!authenticated && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  state={{ from: location.pathname }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Plus size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Sign up</span>
                </Link>
              </div>
            )}

            {/* 📱 Mobile Menu Toggle */}
            <MobileNavbar 
              isOpen={isMobileMenuOpen} 
              setIsOpen={setIsMobileMenuOpen} 
              isAuthenticated={authenticated} 
              user={user} 
              logout={logout}
              onNewEvent={handleNewEvent}
            />
          </div>
        </div>
      </nav>

      {/* ⌨️ Keyboard Shortcuts Modal */}
      <ShortcutHint 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
        shortcuts={[
          { keys: ["Ctrl", "K"], action: "Open search", icon: Search },
          { keys: ["Ctrl", "N"], action: "Create new event", icon: Plus },
          { keys: ["T"], action: "Toggle theme", icon: isDarkMode ? Sun : Moon },
          { keys: ["?"], action: "Show shortcuts", icon: HelpCircle },
          { keys: ["Esc"], action: "Close modals", icon: X },
        ]}
      />
    </>
  );
};

export default memo(Navbar);