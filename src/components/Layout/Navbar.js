import { useTheme } from '../../context/ThemeContext';
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../common/ConfirmationModal";
import { toast } from "react-toastify";
import { UserCog } from "lucide-react";
import {
  Home,
  Calendar,
  Sparkles,
  FolderKanban,
  Users,
  Trophy,
  Info,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  LogIn,
  MessageSquare,
  Book,
  HelpCircle,
  ChevronDown,
  MousePointer,
  Sun,
  Moon
} from "lucide-react";

// --- Helpers to reduce complexity ---
const getUserDisplayNames = (user) => {
  if (!user) return { primary: "User", secondary: null };
  const primary = (user.fullName?.trim()) || 
                 [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || 
                 (user.username?.trim()) || 
                 (user.email?.trim()) || 
                 "User";
  const secondaryCand = (user.email?.trim()) || (user.username?.trim()) || "";
  const secondary = secondaryCand && secondaryCand !== primary ? secondaryCand : null;
  return { primary, secondary };
};

const clearBodyScrollStyles = () => {
  try {
    const stored = document.body.style.top;
    Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
    if (stored) window.scrollTo(0, parseInt(stored, 10) * -1 || 0);
  } catch (e) { /* ignore */ }
};

const setBodyScrollStyles = (top) => {
  Object.assign(document.body.style, { position: "fixed", top: `-${top}px`, left: "0", right: "0", width: "100%" });
};

const ThemeToggleButton = ({ isDarkMode, toggleTheme, isMobile }) => (
  <button
    onClick={toggleTheme}
    aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    className={isMobile
      ? "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
      : "flex items-center gap-1.5 px-2.5 py-1 mr-2 text-xs font-medium border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
    }
  >
    {isDarkMode ? (
      <Sun className={isMobile ? "w-5 h-5 text-amber-500" : "w-4 h-4 text-amber-500"} />
    ) : (
      <Moon className={isMobile ? "w-5 h-5 text-indigo-500" : "w-4 h-4 text-indigo-500"} />
    )}
    {isMobile
      ? (isDarkMode ? "Light Mode" : "Dark Mode")
      : (isDarkMode ? "LIGHT" : "DARK")
    }
  </button>
);

const CursorToggleButton = ({ cursorEnabled, toggleCursor, isMobile }) => (
  <button
    onClick={toggleCursor}
    aria-label={cursorEnabled ? "Disable Fluid Cursor" : "Enable Fluid Cursor"}
    title={cursorEnabled ? "Disable Fluid Cursor" : "Enable Fluid Cursor"}
    className={isMobile
      ? "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
      : "flex items-center gap-1.5 px-2.5 py-1 mr-3 text-xs font-medium border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
    }
  >
    <MousePointer className={isMobile
      ? `w-5 h-5 ${cursorEnabled ? "text-emerald-500" : "text-gray-400"}`
      : `w-4 h-4 ${cursorEnabled ? "text-emerald-500" : "text-gray-400"}`
    } />
    {isMobile
      ? (cursorEnabled ? "Cursor On" : "Cursor Off")
      : (cursorEnabled ? "ON" : "OFF")
    }
  </button>
);

const AuthButtons = ({ isMobile, closeAllMenus }) => (
  <div className={isMobile ? "space-y-3" : "flex items-center space-x-3"}>
    <Link 
      to="/login" 
      onClick={isMobile ? closeAllMenus : undefined} 
      className={isMobile 
        ? "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-transparent"
        : "px-4 py-2 text-sm font-medium text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white transition-colors"
      }
    >
      {isMobile && <LogIn className="w-5 h-5" />}Sign In
    </Link>
    <Link 
      to="/signup" 
      onClick={isMobile ? closeAllMenus : undefined} 
      className={isMobile
        ? "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-black dark:text-white bg-white dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-white/10 border-2 border-black/15 dark:border-white/20 hover:border-black/25 dark:hover:border-white/30 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        : "px-5 py-2 text-sm font-semibold text-white transition-all duration-300 bg-black hover:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20"
      }
    >
      {isMobile && <Sparkles className="w-5 h-5" />}Get Started
    </Link>
  </div>
);

const MobileNavLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.href}
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${
      isActive
        ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
    }`}
  >
    {item.icon}{item.name}
  </Link>
);

const MobileNavGroup = ({ item, isActive, isOpen, onToggle, closeAllMenus, location }) => (
  <div key={item.name}>
    <button
      onClick={onToggle}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium ${
        isActive
          ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      <span className="flex items-center gap-3">{item.icon} {item.name}</span>
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-200 dark:border-white/20 space-y-1">
        {item.subItems.map((sub) => {
          const darkActiveBg = item.name === 'Community' ? 'dark:bg-black/60' : 'dark:bg-white/15';
          return (
            <Link
              key={sub.name}
              to={sub.href}
              onClick={closeAllMenus}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium ${
                location.pathname === sub.href
                  ? `bg-black/10 ${darkActiveBg} border border-black/10 dark:border-white/20 text-black dark:text-white`
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {sub.icon}{sub.name}
            </Link>
          );
        })}
      </div>
    )}
  </div>
);

const DesktopNavLink = ({ item, isActive }) => (
  <Link
    to={item.href}
    className={`text-base font-medium transition-colors ${
      isActive
        ? "text-black dark:text-white"
        : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
    }`}
  >
    {item.name}
  </Link>
);

const DesktopNavGroup = ({ item, isActive, isOpen, onToggle, setOpenDropdown, location }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 text-base font-medium transition-colors ${
        isActive || isOpen
          ? "text-black dark:text-white"
          : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
      }`}
    >
      {item.name}
      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl rounded-lg z-50 border border-black/10 dark:border-white/20 p-2"
      >
        {item.subItems.map((sub) => {
          const darkActiveBg = item.name === 'Community' ? 'dark:bg-black/60' : 'dark:bg-white/15';
          return (
            <Link
              key={sub.name}
              to={sub.href}
              onClick={() => setOpenDropdown(null)}
              className={`group flex items-center gap-3 w-full px-3 py-2 text-base font-medium rounded-md transition-colors ${
                location.pathname === sub.href
                  ? `bg-black/10 ${darkActiveBg} text-black dark:text-white`
                  : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {React.cloneElement(sub.icon, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" })}
              {sub.name}
            </Link>
          );
        })}
      </motion.div>
    )}
  </div>
);

const MobileDrawerHeader = ({ closeBtnRef, closeAllMenus }) => (
  <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 dark:border-white/20">
    <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontFamily: '"Anton", sans-serif' }}>
      Eventra
    </h2>
    <div className="flex items-center gap-3">
      <button
        ref={closeBtnRef}
        onClick={closeAllMenus}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

const MobileDrawerFooter = ({ 
  isAuthenticated, user, primaryLine, secondaryLine, closeAllMenus, location, 
  handleLogoutClick, isDarkMode, toggleTheme, cursorEnabled, toggleCursor 
}) => (
  <div className="p-4 border-t border-gray-200 dark:border-white/20">
    {isAuthenticated() ? (
      <MobileUserSection 
        user={user} 
        primaryLine={primaryLine} 
        secondaryLine={secondaryLine} 
        closeAllMenus={closeAllMenus} 
        location={location} 
        handleLogoutClick={handleLogoutClick} 
      />
    ) : (
      <AuthButtons isMobile={true} closeAllMenus={closeAllMenus} />
    )}
    <div className="flex gap-2 mt-3">
      <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} isMobile={true} />
      <CursorToggleButton cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} isMobile={true} />
    </div>
  </div>
);

const UserProfileDropdown = ({ 
  user, primaryLine, secondaryLine, showProfileDropdown, setShowProfileDropdown, 
  location, handleLogoutClick 
}) => (
  <div className="relative profile-container">
    <button 
      onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
      className="flex items-center gap-2 text-sm font-medium text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white transition-colors"
    >
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" onError={(e) => (e.currentTarget.style.display = "none")} />
      ) : (
       <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
        {primaryLine?.charAt(0).toUpperCase()}
      </div>
      )}
    </button>
    <AnimatePresence>
      {showProfileDropdown && (
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20" onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-800 to-indigo-950 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{primaryLine}</p>
                {secondaryLine && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{secondaryLine}</p>}
              </div>
            </div>
          </div>
          <div className="p-2 bg-white dark:bg-gray-900">
            <Link to="/dashboard" onClick={() => setShowProfileDropdown(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/dashboard" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link to="/profile" onClick={() => setShowProfileDropdown(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/profile" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <UserCog className="w-4 h-4" />Edit Profile
            </Link>
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <button onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const MobileUserSection = ({ 
  user, primaryLine, secondaryLine, closeAllMenus, location, handleLogoutClick 
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-3 px-3 py-2 mb-2">
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
      <div>
        <p className="font-semibold text-gray-800 dark:text-white truncate">{primaryLine}</p>
        {secondaryLine && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{secondaryLine}</p>}
      </div>
    </div>
    <Link to="/dashboard" onClick={closeAllMenus} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${location.pathname === "/dashboard" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}>
      <LayoutDashboard className="w-5 h-5" />Dashboard
    </Link>
    <Link to="/profile" onClick={closeAllMenus} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${location.pathname === "/profile" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}>
      <UserCog className="w-5 h-5" />Edit Profile
    </Link>
    <button onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium">
      <LogOut className="w-5 h-5" />Logout
    </button>
  </div>
);

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
  { name: "Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
  { name: "Hackathons", href: "/hackathons", icon: <Trophy className="w-5 h-5" /> },
  { name: "Projects", href: "/projects", icon: <FolderKanban className="w-5 h-5" /> },
  {
    name: "Community",
    icon: <Users className="w-5 h-5" />,
    subItems: [
      { name: "Leaderboard", href: "/leaderBoard", icon: <Trophy className="w-5 h-5" /> },
      { name: "Contributors", href: "/contributors", icon: <Users className="w-5 h-5" /> },
      { name: "Contributors Guide", href: "/contributorguide", icon: <Book className="w-5 h-5" /> },
      { name: "Community Events", href: "/communityEvent", icon: <Users className="w-5 h-5" /> },
    ],
  },
  { name: "About", href: "/about", icon: <Info className="w-5 h-5" /> },
  { name: "FAQ", href: "/faq", icon: <HelpCircle className="w-5 h-5" /> },
  { name: "Contact", href: "/contact", icon: <MessageSquare className="w-5 h-5" /> },
];

const NavList = ({ location, openDropdown, onToggleGroup, onLinkClick, isMobile }) => (
  <>
    {NAV_ITEMS.map((item) => {
      const isActive = item.href 
        ? location.pathname === item.href 
        : item.subItems?.some(s => location.pathname === s.href);
      
      if (item.subItems) {
        return isMobile ? (
          <MobileNavGroup key={item.name} item={item} isActive={isActive} isOpen={openDropdown === item.name} onToggle={() => onToggleGroup(item.name)} closeAllMenus={onLinkClick} location={location} />
        ) : (
          <DesktopNavGroup key={item.name} item={item} isActive={isActive} isOpen={openDropdown === item.name} onToggle={(e) => { e.stopPropagation(); onToggleGroup(item.name); }} setOpenDropdown={onToggleGroup} location={location} />
        );
      }
      return isMobile ? (
        <MobileNavLink key={item.name} item={item} isActive={isActive} onClick={onLinkClick} />
      ) : (
        <DesktopNavLink key={item.name} item={item} isActive={isActive} />
      );
    })}
  </>
);

const DesktopNavLinks = ({ openDropdown, setOpenDropdown }) => {
  const location = useLocation();
  return (
    <div className="hidden lg:flex flex-1 justify-center items-center gap-8 lg:gap-12 xl:gap-16 z-10">
      <NavList 
        location={location} 
        openDropdown={openDropdown} 
        onToggleGroup={(name) => setOpenDropdown(openDropdown === name ? null : name)} 
        isMobile={false} 
      />
    </div>
  );
};

const MobileDrawer = ({ isOpen, drawerRef, openDropdown, setOpenDropdown, closeAllMenus, handleTouchStart, handleTouchMove, handleTouchEnd, closeBtnRef, toggleCursor, cursorEnabled, handleLogoutClick, primaryLine, secondaryLine }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <div
      id="mobile-drawer"
      ref={drawerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed top-0 right-0 h-dvh overflow-y-auto w-[88vw] max-w-sm shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out bg-white backdrop-blur-lg dark:bg-gray-900/95 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      role="dialog"
      aria-modal={isOpen}
    >
      <MobileDrawerHeader closeBtnRef={closeBtnRef} closeAllMenus={closeAllMenus} />

      <div className="flex-grow p-3.5 sm:p-4 space-y-2 overflow-y-auto">
        <NavList 
          location={location} 
          openDropdown={openDropdown} 
          onToggleGroup={(name) => setOpenDropdown(openDropdown === name ? null : name)} 
          onLinkClick={closeAllMenus} 
          isMobile={true} 
        />
      </div>

      <MobileDrawerFooter 
        isAuthenticated={isAuthenticated} 
        user={user} 
        primaryLine={primaryLine} 
        secondaryLine={secondaryLine} 
        closeAllMenus={closeAllMenus} 
        location={location} 
        handleLogoutClick={handleLogoutClick} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        cursorEnabled={cursorEnabled} 
        toggleCursor={toggleCursor} 
      />
    </div>
  );
};

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { primary: primaryLine, secondary: secondaryLine } = getUserDisplayNames(user);

  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    clearBodyScrollStyles();
    try { toggleBtnRef.current?.focus(); } catch (e) { /* ignore */ }
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

  useEffect(() => { closeAllMenus(); }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeAllMenus(); return; }
      if (e.key === "Tab") {
        const focusable = drawer.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchCurrentXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const start = touchStartXRef.current;
    const end = touchCurrentXRef.current;
    if (typeof start !== "number" || typeof end !== "number") return;
    const deltaX = end - start;
    if (deltaX > 50) {
      closeAllMenus();
    }
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
    {
      name: "Hackathons",
      href: "/hackathons",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      name: "Community",
      icon: <Users className="w-5 h-5" />,
      subItems: [
        {
          name: "Leaderboard",
          href: "/leaderBoard",
          icon: <Trophy className="w-5 h-5" />,
        },
        {
          name: "Contributors",
          href: "/contributors",
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: "Contributors Guide",
          href: "/contributorguide",
          icon: <Book className="w-5 h-5" />,
        },
        {
          name: "Community Events",
          href: "/communityEvent",
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
    { name: "About", href: "/about", icon: <Info className="w-5 h-5" /> },
    { name: "FAQ", href: "/faq", icon: <HelpCircle className="w-5 h-5" /> },
    {
      name: "Contact",
      href: "/contact",
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success("You have been logged out successfully.", { className: "custom-toast", autoClose: 3000 });
    navigate("/");
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isMobileMenuOpen || showProfileDropdown || openDropdown || showLogoutModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeAllMenus}
      />

      <nav
        ref={navRef}
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
        className="fixed top-0 left-0 w-full z-40 shadow-sm bg-white dark:bg-gray-900 border-b border-black/10 dark:border-white/10"
      >
        <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
          {/* Logo on the left */}
          <Link to="/" className="flex-shrink-0 z-20">
            <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white" style={{ fontFamily: '"Anton", sans-serif' }}>
              Eventra
            </h2>
          </Link>

          {/* Centered nav links */}
          <div className="hidden lg:flex flex-1 justify-center items-center gap-8 lg:gap-12 xl:gap-16 z-10">
            {navItems.map((item) => {
              const isActive = item.href
                ? location.pathname === item.href
                : item.subItems?.some((sub) => location.pathname === sub.href);
              if (item.subItems) {
                return (
                  <div key={item.name} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === item.name ? null : item.name
                        );
                      }}
                      className={`flex items-center gap-1 text-base font-medium transition-colors ${
                        isActive || openDropdown === item.name
                          ? "text-black dark:text-white"
                          : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl rounded-lg z-50 border border-black/10 dark:border-white/20 p-2"
                      >
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group flex items-center gap-3 w-full px-3 py-2 text-base font-medium rounded-md transition-colors ${
                              location.pathname === sub.href
                                ? "bg-black/10 dark:bg-white/15 text-black dark:text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                            }`}
                          >
                            {React.cloneElement(sub.icon, {
                              className:
                                "w-5 h-5 text-gray-500 dark:text-gray-400",
                            })}
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-base font-medium transition-colors ${
                    isActive
                      ? "text-black dark:text-white"
                      : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Group: Auth Controls and Mobile Toggle - FIXED VERSION */}
          <div className="hidden lg:flex items-center ml-auto z-20">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-xl text-gray-700 dark:text-white hover:opacity-70 transition-opacity mr-2"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons - FIXED: removed the broken syntax */}
            {isAuthenticated() ? (
              <div className="relative profile-container ml-2">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 text-sm font-medium text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white transition-colors"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full dark:bg-white/20 bg-gray-300 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-600 dark:text-white" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                          {user?.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-800 to-indigo-950 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {primaryLine}
                            </p>
                            {secondaryLine && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {secondaryLine}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2 bg-white dark:bg-gray-900">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowProfileDropdown(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            location.pathname === "/dashboard"
                              ? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setShowProfileDropdown(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            location.pathname === "/profile"
                              ? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <UserCog className="w-4 h-4" />
                          Edit Profile
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-semibold text-white transition-all duration-300 bg-black hover:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden ml-auto">
            <button 
              ref={toggleBtnRef} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-expanded={isMobileMenuOpen} 
              aria-label="Open navigation" 
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 h-dvh overflow-y-auto w-[88vw] max-w-sm shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out bg-white backdrop-blur-lg dark:bg-gray-900/95 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal={isMobileMenuOpen}
      >
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 dark:border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontFamily: '"Anton", sans-serif' }}>
            Eventra
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full text-text-light bg-gray-100 dark:bg-white/10 hover:bg-gray-200">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              ref={closeBtnRef}
              onClick={closeAllMenus}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-grow p-3.5 sm:p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href
              ? location.pathname === item.href
              : item.subItems?.some((sub) => location.pathname === sub.href);
            if (item.subItems) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium ${
                      isActive
                        ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-3">{item.icon} {item.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === item.name && (
                    <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-200 dark:border-white/20 space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={closeAllMenus}
                          className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium ${
                            location.pathname === sub.href
                              ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {sub.icon}{sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeAllMenus}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${
                  isActive
                    ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {item.icon}{item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/20">
          {isAuthenticated() ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white truncate">{primaryLine}</p>
                  {secondaryLine && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{secondaryLine}</p>}
                </div>
              </div>
              <Link to="/dashboard" onClick={closeAllMenus} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${location.pathname === "/dashboard" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}>
                <LayoutDashboard className="w-5 h-5" />Dashboard
              </Link>
              <Link to="/profile" onClick={closeAllMenus} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${location.pathname === "/profile" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}>
                <UserCog className="w-5 h-5" />Edit Profile
              </Link>
              <button onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium">
                <LogOut className="w-5 h-5" />Logout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link to="/login" onClick={closeAllMenus} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-transparent">
                <LogIn className="w-5 h-5" />Sign In
              </Link>
              <Link to="/signup" onClick={closeAllMenus} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-black dark:text-white bg-white dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-white/10 border-2 border-black/15 dark:border-white/20 hover:border-black/25 dark:hover:border-white/30 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                <Sparkles className="w-5 h-5" />Get Started
              </Link>
            </div>
          )}
          <hr className="my-3" />
          <button onClick={toggleCursor} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors font-medium">
            <MousePointer className="w-5 h-5" />
            {cursorEnabled ? "Turn Cursor OFF" : "Turn Cursor ON"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />

      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;