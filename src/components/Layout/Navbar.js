import { useTheme } from '../../context/ThemeContext';
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../common/ConfirmationModal";
import { toast } from "react-toastify";
import {
  Home, Calendar, Sparkles, FolderKanban, Users, Trophy,
  Info, LayoutDashboard, User as UserIcon, LogOut, LogIn,
  MessageSquare, Book, HelpCircle, ChevronDown, MousePointer,
  UserCog, Menu, X, Sun, Moon
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

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
  Moon,
  Sun
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
    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    className={isMobile 
      ? "flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
      : "flex items-center gap-1 px-2 py-1 mr-2 text-xs font-normal bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
    }
  >
    {isDarkMode ? (
      <Sun className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
    ) : (
      <Moon className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
    )}
    {isMobile ? (isDarkMode ? "Dark OFF" : "Dark ON") : (isDarkMode ? "DARK" : "LIGHT")}
  </button>
);

const CursorToggleButton = ({ cursorEnabled, toggleCursor, isMobile }) => (
  <button
    onClick={toggleCursor}
    title={cursorEnabled ? "Disable Fluid Cursor" : "Enable Fluid Cursor"}
    className={isMobile 
      ? "flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
      : "flex items-center gap-1 px-2 py-1 mr-3 text-xs font-normal bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
    }
  >
    <MousePointer className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
    {isMobile ? (cursorEnabled ? "Cursor OFF" : "Cursor ON") : (cursorEnabled ? "CURSOR" : "STATIC")}
  </button>
);

const AuthButtons = ({ isMobile, closeAllMenus }) => (
  <div className={isMobile ? "space-y-3" : "flex items-center space-x-1"}>
    <Link 
      to="/login" 
      onClick={isMobile ? closeAllMenus : undefined} 
      className={isMobile 
        ? "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-transparent"
        : "px-4 py-2 text-base font-medium text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white transition-colors"
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
            {React.cloneElement(sub.icon, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" })}
            {sub.name}
          </Link>
        ))}
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
    <div className="flex gap-2 mb-2">
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
        <div className="w-8 h-8 rounded-full dark:bg-white/20 bg-gray-300 flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-gray-600 dark:text-white" />
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
  { name: "Home",       href: "/",           icon: <Home         className="w-4 h-4" /> },
  { name: "Events",     href: "/events",      icon: <Calendar     className="w-4 h-4" /> },
  { name: "Hackathons", href: "/hackathons",  icon: <Sparkles     className="w-4 h-4" /> },
  { name: "Projects",   href: "/projects",    icon: <FolderKanban className="w-4 h-4" /> },
  {
    name: "Community",
    icon: <Users className="w-4 h-4" />,
    subItems: [
      { name: "Leaderboard",        href: "/leaderBoard",     icon: <Trophy className="w-4 h-4" /> },
      { name: "Contributors",       href: "/contributors",    icon: <Users  className="w-4 h-4" /> },
      { name: "Contributors Guide", href: "/contributorguide",icon: <Book   className="w-4 h-4" /> },
      { name: "Community Events",   href: "/communityEvent",  icon: <Users  className="w-4 h-4" /> },
    ],
  },
  { name: "About",   href: "/about",   icon: <Info          className="w-4 h-4" /> },
  { name: "FAQ",     href: "/faq",     icon: <HelpCircle    className="w-4 h-4" /> },
  { name: "Contact", href: "/contact", icon: <MessageSquare className="w-4 h-4" /> },
];

// Shared active/inactive class strings — eliminates repeated ternary chains
const LINK_ACTIVE   = "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400";
const LINK_INACTIVE = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";
const ICON_ACTIVE   = "text-violet-500";
const ICON_INACTIVE = "text-gray-400 dark:text-gray-500";

// ─── Tiny reusable helpers ────────────────────────────────────────────────────

/** Renders a user avatar — profile picture or gradient fallback */
const UserAvatar = ({ profilePicture, size = "sm" }) => {
  const dims  = { sm: "w-8 h-8",  md: "w-10 h-10", lg: "w-11 h-11" };
  const icons = { sm: "w-4 h-4",  md: "w-5 h-5",   lg: "w-6 h-6"  };

  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt="Profile"
        className={`${dims[size]} rounded-full object-cover ring-2 ring-violet-400/40 shadow`}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  }
  return (
    <div className={`${dims[size]} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow`}>
      <UserIcon className={`${icons[size]} text-white`} />
    </div>
  );
};

/** Small active-state dot used in dropdowns */
const ActiveDot = () => (
  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
);

/** Gradient bar shown at the top of dropdowns / drawer */
const GradientBar = () => (
  <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 flex-shrink-0" />
);

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

const ThemeToggle = ({ compact = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const size = compact ? "w-8 h-8" : "w-9 h-9";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative flex items-center justify-center ${size} rounded-full
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        hover:bg-gray-100 dark:hover:bg-gray-700
        shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDarkMode ? (
          <motion.span key="sun"
            initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}     transition={{ duration: 0.2 }}
          >
            <Sun  className="w-4 h-4 text-amber-400" />
          </motion.span>
        ) : (
          <motion.span key="moon"
            initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}   transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 text-indigo-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

// ─── Cursor Toggle ────────────────────────────────────────────────────────────

const CursorToggle = ({ cursorEnabled, toggleCursor }) => (
  <button
    onClick={toggleCursor}
    title={cursorEnabled ? "Disable custom cursor" : "Enable custom cursor"}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
      shadow-sm hover:shadow-md transition-all duration-200
      ${cursorEnabled
        ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
  >
    <MousePointer className="w-3.5 h-3.5" />
    {cursorEnabled ? "Cursor ON" : "Cursor OFF"}
  </button>
);

// ─── Desktop: single dropdown panel ──────────────────────────────────────────

/**
 * Extracted from DesktopDropdownItem to cut its line count and complexity.
 * Renders the floating panel of sub-links.
 */
const DesktopDropdownPanel = ({ subItems, onClose }) => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8,  scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 8,  scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 z-50
        bg-white dark:bg-gray-900
        border border-gray-100 dark:border-gray-800
        rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40
        overflow-hidden"
    >
      <GradientBar />
      <div className="p-1.5">
        {subItems.map((sub) => {
          const isActive = location.pathname === sub.href;
          return (
            <Link
              key={sub.name}
              to={sub.href}
              onClick={onClose}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150
                ${isActive ? LINK_ACTIVE : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <span className={isActive ? ICON_ACTIVE : "text-gray-400 dark:text-gray-500"}>
                {sub.icon}
              </span>
              {sub.name}
              {isActive && <ActiveDot />}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

/** Button + panel for a nav item that has sub-links (desktop) */
const DesktopDropdownItem = ({ item, openDropdown, setOpenDropdown, isActive }) => {
  const isOpen = openDropdown === item.name;

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : item.name); }}
        className={`flex items-center gap-1 text-sm font-medium px-1 py-0.5 rounded transition-all duration-200
          ${isActive || isOpen
            ? "text-violet-600 dark:text-violet-400"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          }`}
      >
        {item.name}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <DesktopDropdownPanel
            subItems={item.subItems}
            onClose={() => setOpenDropdown(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Desktop: Nav Links row ───────────────────────────────────────────────────

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
    <div className="hidden lg:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href
          ? location.pathname === item.href
          : item.subItems?.some((sub) => location.pathname === sub.href);

        if (item.subItems) {
          return (
            <DesktopDropdownItem
              key={item.name}
              item={item}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              isActive={isActive}
            />
          );
        }

        return (
          <Link
            key={item.name}
            to={item.href}
            className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200
              ${isActive
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            {item.name}
            {isActive && (
              <motion.span
                layoutId="desktop-active-pill"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-violet-500"
              />
            )}
          </Link>
        );
      })}
    <div className="hidden lg:flex absolute left-[48%] transform -translate-x-1/2 space-x-5 z-10">
      <NavList 
        location={location} 
        openDropdown={openDropdown} 
        onToggleGroup={(name) => setOpenDropdown(openDropdown === name ? null : name)} 
        isMobile={false} 
      />
    </div>
  );
};

// ─── Desktop: Auth ────────────────────────────────────────────────────────────

const DesktopGuestButtons = () => (
  <div className="flex items-center gap-2">
    <Link to="/login"
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
        text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
        hover:bg-gray-100 dark:hover:bg-gray-800
        border border-transparent hover:border-gray-200 dark:hover:border-gray-700
        transition-all duration-200"
    >
      <LogIn className="w-4 h-4" /> Sign In
    </Link>
    <Link to="/signup"
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg
        text-white bg-gradient-to-r from-violet-600 to-indigo-600
        hover:from-violet-700 hover:to-indigo-700
        shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30
        hover:-translate-y-0.5 transition-all duration-200"
    >
      <Sparkles className="w-4 h-4" /> Get Started
    </Link>
  </div>
);

/**
 * Extracted from DesktopProfileDropdown.
 * Renders just the user info header card inside the dropdown.
 */
const ProfileDropdownHeader = ({ user, primaryLine, secondaryLine }) => (
  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
    <div className="flex items-center gap-3">
      <UserAvatar profilePicture={user?.profilePicture} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{primaryLine}</p>
        {secondaryLine && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{secondaryLine}</p>
        )}
        <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium
          bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
          ● Online
        </span>
      </div>
    </div>
  </div>
);

/**
 * Extracted from DesktopProfileDropdown.
 * Renders Dashboard / Edit Profile links.
 */
const ProfileDropdownLinks = ({ onClose }) => {
  const location = useLocation();
  const links = [
    { to: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard"    },
    { to: "/profile",   icon: <UserCog         className="w-4 h-4" />, label: "Edit Profile" },
  ];

  return (
    <div className="p-2">
      {links.map(({ to, icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link key={to} to={to} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${active ? LINK_ACTIVE : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            <span className={active ? ICON_ACTIVE : ICON_INACTIVE}>{icon}</span>
            {label}
            {active && <ActiveDot />}
          </Link>
        );
      })}
    </div>
  );
};

/** Full profile dropdown panel (header + links + logout) */
const DesktopProfileDropdown = ({ user, primaryLine, secondaryLine, onLogoutClick, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 10,  scale: 0.96 }}
    animate={{ opacity: 1, y: 0,   scale: 1    }}
    exit={{    opacity: 0, y: 10,  scale: 0.96 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute right-0 top-full mt-2.5 w-64 z-50
      bg-white dark:bg-gray-900
      border border-gray-100 dark:border-gray-800
      rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
      overflow-hidden"
  >
    <GradientBar />
    <ProfileDropdownHeader user={user} primaryLine={primaryLine} secondaryLine={secondaryLine} />
    <ProfileDropdownLinks onClose={onClose} />
    <div className="p-2 border-t border-gray-100 dark:border-gray-800">
      <button onClick={onLogoutClick}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
          text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  </motion.div>
);

/** Chooses between guest buttons and the profile button+dropdown */
const DesktopAuthSection = ({
  user, isAuthenticated, primaryLine, secondaryLine,
  onLogoutClick, showProfileDropdown, setShowProfileDropdown,
}) => {
  if (!isAuthenticated()) return <DesktopGuestButtons />;

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full
          border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800
          hover:border-violet-300 dark:hover:border-violet-600
          shadow-sm hover:shadow-md transition-all duration-200"
      >
        <UserAvatar profilePicture={user?.profilePicture} size="sm" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
          {primaryLine}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {showProfileDropdown && (
          <DesktopProfileDropdown
            user={user}
            primaryLine={primaryLine}
            secondaryLine={secondaryLine}
            onLogoutClick={onLogoutClick}
            onClose={() => setShowProfileDropdown(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mobile: pieces ───────────────────────────────────────────────────────────

/**
 * Extracted from MobileNavItem.
 * Renders the animated sub-link list shown when a parent item is expanded.
 */
const MobileSubMenu = ({ subItems, closeAllMenus }) => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{    height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="ml-4 mt-1 pl-3 border-l-2 border-violet-100 dark:border-violet-900/50 space-y-0.5 pb-1">
        {subItems.map((sub) => {
          const isActive = location.pathname === sub.href;
          return (
            <Link key={sub.name} to={sub.href} onClick={closeAllMenus}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive ? LINK_ACTIVE : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <span className={isActive ? ICON_ACTIVE : "text-gray-400"}>{sub.icon}</span>
              {sub.name}
            </Link>
          );
        })}
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
    </motion.div>
  );
};

/** One nav row in the mobile drawer (with or without sub-items) */
const MobileNavItem = ({ item, openDropdown, setOpenDropdown, closeAllMenus }) => {
  const location = useLocation();
  const isActive = item.href
    ? location.pathname === item.href
    : item.subItems?.some((sub) => location.pathname === sub.href);
  const isOpen   = openDropdown === item.name;

  const rowClass = `flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
    ${isActive ? LINK_ACTIVE : LINK_INACTIVE}`;

  // Item with sub-menu
  if (item.subItems) {
    return (
      <div>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : item.name)}
          className={`${rowClass} justify-between`}
        >
          <span className="flex items-center gap-3">
            <span className={isActive ? ICON_ACTIVE : ICON_INACTIVE}>{item.icon}</span>
            {item.name}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && <MobileSubMenu subItems={item.subItems} closeAllMenus={closeAllMenus} />}
        </AnimatePresence>
      </div>
    );
  }

  // Plain link
  return (
    <Link to={item.href} onClick={closeAllMenus} className={`${rowClass} gap-3`}>
      <span className={isActive ? ICON_ACTIVE : ICON_INACTIVE}>{item.icon}</span>
      {item.name}
      {isActive && <ActiveDot />}
    </Link>
  );
};

const MobileGuestButtons = ({ closeAllMenus }) => (
  <div className="space-y-2.5 pt-1">
    <Link to="/login" onClick={closeAllMenus}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold
        text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700 transition-all duration-200"
    >
      <LogIn className="w-4 h-4" /> Sign In
    </Link>
    <Link to="/signup" onClick={closeAllMenus}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold
        text-white bg-gradient-to-r from-violet-600 to-indigo-600
        hover:from-violet-700 hover:to-indigo-700
        shadow-md shadow-violet-500/30 transition-all duration-200"
    >
      <Sparkles className="w-4 h-4" /> Get Started
    </Link>
  </div>
);

/**
 * Extracted from MobileAuthenticatedSection.
 * Renders only the user identity card at the top of the auth block.
 */
const MobileUserCard = ({ user, primaryLine, secondaryLine }) => (
  <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl
    bg-gradient-to-r from-violet-50 to-indigo-50
    dark:from-violet-900/20 dark:to-indigo-900/20
    border border-violet-100 dark:border-violet-900/40"
  >
    <UserAvatar profilePicture={user?.profilePicture} size="md" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{primaryLine}</p>
      {secondaryLine && (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{secondaryLine}</p>
      )}
    </div>
  </div>
);

/**
 * Extracted from MobileAuthenticatedSection.
 * Renders Dashboard / Edit Profile links for mobile.
 */
const MobileProfileLinks = ({ closeAllMenus }) => {
  const location = useLocation();
  const links = [
    { to: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard"    },
    { to: "/profile",   icon: <UserCog         className="w-4 h-4" />, label: "Edit Profile" },
  ];

  return (
    <>
      {links.map(({ to, icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link key={to} to={to} onClick={closeAllMenus}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${active ? LINK_ACTIVE : `${LINK_INACTIVE}`}`}
          >
            <span className={active ? ICON_ACTIVE : ICON_INACTIVE}>{icon}</span>
            {label}
          </Link>
        );
      })}
    </>
  );
};

/** Combines user card + profile links + logout for authenticated mobile users */
const MobileAuthenticatedSection = ({ user, primaryLine, secondaryLine, closeAllMenus, handleLogoutClick }) => (
  <div className="space-y-1">
    <MobileUserCard user={user} primaryLine={primaryLine} secondaryLine={secondaryLine} />
    <MobileProfileLinks closeAllMenus={closeAllMenus} />
    <button onClick={handleLogoutClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
        text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
    >
      <LogOut className="w-4 h-4" /> Logout
    </button>
  </div>
);

// ─── Mobile: Drawer header ────────────────────────────────────────────────────

/**
 * Extracted from MobileDrawer.
 * Sticky top bar with logo, theme toggle and close button.
 */
const MobileDrawerHeader = ({ closeBtnRef, closeAllMenus }) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
    <Link
      to="/"
      onClick={closeAllMenus}
      className="text-xl font-bold text-gray-900 dark:text-white"
      style={{ fontFamily: '"Anton", sans-serif' }}
    >
      Eventra
    </Link>
    <div className="flex items-center gap-2">
      <ThemeToggle compact />
      <button
        ref={closeBtnRef}
        onClick={closeAllMenus}
        aria-label="Close menu"
        className="flex items-center justify-center w-8 h-8 rounded-full
          text-gray-500 dark:text-gray-400
          bg-gray-100 dark:bg-gray-800
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors duration-150"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ─── Mobile: Drawer footer ────────────────────────────────────────────────────

/**
 * Extracted from MobileDrawer.
 * Bottom section: auth block + cursor toggle.
 */
const MobileDrawerFooter = ({ primaryLine, secondaryLine, closeAllMenus, handleLogoutClick, toggleCursor, cursorEnabled }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="flex-shrink-0 px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
      {isAuthenticated() ? (
        <MobileAuthenticatedSection
          user={user}
          primaryLine={primaryLine}
          secondaryLine={secondaryLine}
          closeAllMenus={closeAllMenus}
          handleLogoutClick={handleLogoutClick}
        />
      ) : (
        <MobileGuestButtons closeAllMenus={closeAllMenus} />
      )}
      <div className="pt-1">
        <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
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

// ─── Mobile: Drawer (now tiny — just layout shell) ───────────────────────────

/**
 * MobileDrawer is now a pure layout shell.
 * All logic lives in sub-components, keeping cyclomatic complexity at 1.
 */
const MobileDrawer = ({
  isOpen, drawerRef, openDropdown, setOpenDropdown, closeAllMenus,
  handleTouchStart, handleTouchMove, handleTouchEnd, closeBtnRef,
  toggleCursor, cursorEnabled, handleLogoutClick, primaryLine, secondaryLine,
}) => (
  <div
    id="mobile-drawer"
    ref={drawerRef}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    role="dialog"
    aria-modal={isOpen}
    aria-label="Navigation menu"
    className={`fixed top-0 right-0 h-dvh w-[85vw] max-w-[340px] flex flex-col z-50
      bg-white dark:bg-gray-950
      border-l border-gray-100 dark:border-gray-800
      shadow-2xl shadow-black/20
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
  >
    <GradientBar />

    <MobileDrawerHeader closeBtnRef={closeBtnRef} closeAllMenus={closeAllMenus} />

    {/* Scrollable nav list */}
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5 min-h-0">
      {NAV_ITEMS.map((item) => (
        <MobileNavItem
          key={item.name}
          item={item}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          closeAllMenus={closeAllMenus}
        />
      ))}
    </nav>

    <MobileDrawerFooter
      primaryLine={primaryLine}
      secondaryLine={secondaryLine}
      closeAllMenus={closeAllMenus}
      handleLogoutClick={handleLogoutClick}
      toggleCursor={toggleCursor}
      cursorEnabled={cursorEnabled}
    />
  </div>
);

// ─── Custom hooks ─────────────────────────────────────────────────────────────

const useScrollLock = (isLocked) => {
  useEffect(() => {
    const unlock = () => {
      const stored = document.body.style.top;
      Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
      if (stored) window.scrollTo(0, parseInt(stored || "0", 10) * -1 || 0);
    };
    if (isLocked) {
      const prevTop = window.scrollY || 0;
      Object.assign(document.body.style, { position: "fixed", top: `-${prevTop}px`, left: "0", right: "0", width: "100%" });
    } else {
      unlock();
    }
    return unlock;
  }, [isLocked]);
};

const useDrawerKeyboardTrap = (isOpen, drawerRef, closeAllMenus) => {
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeAllMenus(); return; }
      if (e.key !== "Tab") return;
      const els = [...drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')];
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey  && document.activeElement === first) { e.preventDefault(); last.focus();  }
      if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, drawerRef, closeAllMenus]);
};

const useNavHeight = (navRef) => {
  const [h, setH] = useState(0);
  useEffect(() => {
    const update = () => { if (navRef.current) setH(navRef.current.offsetHeight); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [navRef]);
  return h;
};

const useSwipeToClose = (onClose) => {
  const sx = useRef(null), cx = useRef(null);
  return {
    handleTouchStart: (e) => { sx.current = cx.current = e.touches[0].clientX; },
    handleTouchMove:  (e) => { cx.current = e.touches[0].clientX; },
    handleTouchEnd:   ()  => { if ((cx.current ?? 0) - (sx.current ?? 0) > 50) onClose(); sx.current = cx.current = null; },
  };
};

const useUserDisplayName = (user) => {
  const primaryLine =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username?.trim() ||
    user?.email?.trim() ||
    "User";
  const secondary = user?.email?.trim() || user?.username?.trim() || "";
  return { primaryLine, secondaryLine: secondary && secondary !== primaryLine ? secondary : null };
};

const useScrolled = (threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen,    setIsMobileMenuOpen]    = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openDropdown,        setOpenDropdown]        = useState(null);
  const [showLogoutModal,     setShowLogoutModal]     = useState(false);

  const drawerRef    = useRef(null);
  const closeBtnRef  = useRef(null);
  const toggleBtnRef = useRef(null);
  const navRef       = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const scrolled = useScrolled();

  const { primaryLine, secondaryLine }                        = useUserDisplayName(user);
  const navHeight                                              = useNavHeight(navRef);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeToClose(closeAllMenus);

  useScrollLock(isMobileMenuOpen);
  useDrawerKeyboardTrap(isMobileMenuOpen, drawerRef, closeAllMenus);
  const { primary: primaryLine, secondary: secondaryLine } = getUserDisplayNames(user);

  function closeAllMenus() {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    try { toggleBtnRef.current?.focus(); } catch (_) {}
  }
    clearBodyScrollStyles();
    try { toggleBtnRef.current?.focus(); } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: isMobileMenuOpen }));
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) setTimeout(() => closeBtnRef.current?.focus(), 50);
    if (isMobileMenuOpen) {
      setBodyScrollStyles(window.scrollY || 0);
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      clearBodyScrollStyles();
    }
    return clearBodyScrollStyles;
  }, [isMobileMenuOpen]);

  useEffect(() => { closeAllMenus(); }, [location.pathname]);

  const handleLogoutClick   = () => { setShowLogoutModal(true); setShowProfileDropdown(false); };
  const handleCancelLogout  = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success("You have been logged out successfully.", { autoClose: 3000 });
    navigate("/");
  };

  const overlayVisible = isMobileMenuOpen || showProfileDropdown || !!openDropdown || showLogoutModal;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeAllMenus}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300
          ${overlayVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Navbar */}
      <nav
        ref={navRef}
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="600"
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300
          ${scrolled
            ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-md shadow-black/5 border-b border-gray-200/80 dark:border-gray-800/80"
            : "bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900"
          }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center h-16 px-4 sm:px-6 lg:px-8 gap-8">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: '"Anton", sans-serif' }}>
              Eventra
            </span>
          </Link>

          {/* Desktop centered nav */}
          <div className="hidden lg:flex flex-1 justify-center">
            <DesktopNavLinks openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
          </div>

          {/* Desktop right controls */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0 ml-auto">
            <CursorToggle cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
            <ThemeToggle />
            <DesktopAuthSection
              user={user}
              isAuthenticated={isAuthenticated}
              primaryLine={primaryLine}
              secondaryLine={secondaryLine}
              onLogoutClick={handleLogoutClick}
              showProfileDropdown={showProfileDropdown}
              setShowProfileDropdown={setShowProfileDropdown}
            />
          <div className="hidden lg:flex items-center ml-auto z-20">
            <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} isMobile={false} />
            <CursorToggleButton cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} isMobile={false} />

            <div className="flex items-center space-x-2 ml-2">
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
          </div>

          {/* Mobile right controls */}
          <div className="lg:hidden ml-auto flex items-center gap-2">
            <ThemeToggle compact />
            <button
              ref={toggleBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="flex items-center justify-center w-9 h-9 rounded-xl
                text-gray-600 dark:text-gray-300
                bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                border border-gray-200 dark:border-gray-700
                transition-all duration-200"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}     transition={{ duration: 0.15 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span key="menu"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}   transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
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
        toggleCursor={toggleCursor}
        cursorEnabled={cursorEnabled}
        handleLogoutClick={handleLogoutClick}
        primaryLine={primaryLine}
        secondaryLine={secondaryLine}
      />

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