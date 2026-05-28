import NotificationBell from "../common/NotificationBell.jsx";
import { useTheme } from "../../context/ThemeContext";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ConfirmationModal from "../common/ConfirmationModal";
import CommandPalette from "../common/CommandPalette";

import { UserCog } from "lucide-react";
import {
  Home,
  Calendar,
  CalendarDays,
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
  Bookmark,
  Bell,
  HelpCircle,
  ChevronDown,
  MousePointer,
  Moon,
  Sun,
  MoreHorizontal,
  Search,
  Palette,
} from "lucide-react";


// --- Helpers to reduce complexity ---
const getUserDisplayNames = (user) => {
  if (!user) return { primary: "User", secondary: null };
  const primary =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username?.trim() ||
    user.email?.trim() ||
    "User";
  const secondaryCand = user.email?.trim() || user.username?.trim() || "";
  const secondary = secondaryCand && secondaryCand !== primary ? secondaryCand : null;
  return { primary, secondary };
};

const clearBodyScrollStyles = () => {
  try {
    const stored = document.body.style.top;
    Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
    if (stored) window.scrollTo(0, parseInt(stored, 10) * -1 || 0);
  } catch (e) {
    /* ignore */
  }
};

const setBodyScrollStyles = (top) => {
  Object.assign(document.body.style, {
    position: "fixed",
    top: `-${top}px`,
    left: "0",
    right: "0",
    width: "100%",
  });
};

const ThemeToggleButton = ({ isDarkMode, toggleTheme, isMobile, setIsCustomizerOpen }) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2.5 w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
          <span>{isDarkMode ? "Switch to Light" : "Switch to Dark"}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCustomizerOpen && setIsCustomizerOpen(true)}
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold border-none shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Palette className="w-5 h-5" />
          <span>THEME Customizer</span>
        </motion.button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <motion.span
          key={isDarkMode ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-zinc-600 group-hover:text-indigo-500 dark:text-zinc-400 dark:group-hover:text-indigo-400"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsCustomizerOpen && setIsCustomizerOpen(true)}
        title="Open Theme Customizer"
        className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none bg-gradient-to-r from-indigo-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-pink-500/20 border border-indigo-200/50 dark:border-indigo-800/40 hover:shadow-[0_0_12px_rgba(236,72,153,0.3)] text-indigo-550 dark:text-indigo-400 cursor-pointer"
      >
        <Palette className="w-4 h-4 animate-pulse text-indigo-500 dark:text-indigo-400" />
      </motion.button>
    </div>
  );
};

const CursorToggleButton = ({ cursorEnabled, toggleCursor, isMobile }) => {
  if (isMobile) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleCursor}
        className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all"
      >
        {cursorEnabled ? (
          <MousePointer className="w-5 h-5 text-indigo-500" />
        ) : (
          <MousePointer className="w-5 h-5 text-zinc-400" />
        )}
        <span>{cursorEnabled ? "Fluid Cursor" : "Static Cursor"}</span>
      </motion.button>
    );
  }
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleCursor}
      title={cursorEnabled ? "Disable Fluid Cursor" : "Enable Fluid Cursor"}
      className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-zinc-200/60 dark:border-zinc-700/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] group"
    >
      <MousePointer
        className={`w-4 h-4 ${
          cursorEnabled
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-zinc-400 dark:text-zinc-500"
        }`}
      />
    </motion.button>
  );
};

const AuthButtons = ({ isMobile, closeAllMenus }) => (
  <div className={isMobile ? "space-y-3 mt-4" : "flex items-center space-x-6"}>
    <Link
      to="/login"
      onClick={isMobile ? closeAllMenus : undefined}
      className={
        isMobile
          ? "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all duration-300"
          : "text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
      }
    >
      {isMobile && <LogIn className="w-5 h-5" />}Sign In
    </Link>
    <Link
      to="/signup"
      onClick={isMobile ? closeAllMenus : undefined}
      className={
        isMobile
          ? "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-zinc-900 dark:text-white bg-transparent border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300"
          : "flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 whitespace-nowrap"
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
    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium border ${
      isActive
        ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
        : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 border-transparent"
    }`}
  >
    {item.icon}
    {item.name}
  </Link>
);

const MobileNavGroup = ({ item, isActive, isOpen, onToggle, closeAllMenus, location }) => (
  <div key={item.name}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`mobile-nav-group-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium border ${
        isActive
          ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
          : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 border-transparent"
      }`}
    >
      <span className="flex items-center gap-3">
        {item.icon} {item.name}
      </span>
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div
        id={`mobile-nav-group-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
        className="mt-2 ml-3 pl-3 border-l-2 border-gray-200 dark:border-white/20 space-y-1"
      >
        {item.subItems.map((sub) => {
          const isSubActive = location.pathname.startsWith(sub.href);
          return (
            <Link
              key={sub.name}
              to={sub.href}
              onClick={closeAllMenus}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium border ${
                isSubActive
                  ? "bg-indigo-100/40 dark:bg-indigo-500/15 border-indigo-200/50 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border-transparent"
              }`}
            >
              {sub.icon}
              {sub.name}
            </Link>
          );
        })}
      </div>
    )}
  </div>
);

const DesktopNavLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.href}
    className={`relative group text-[12px] font-semibold transition-all duration-200 whitespace-nowrap px-2.5 py-1.5 rounded-full ${
      isActive
        ? "text-indigo-700 dark:text-indigo-300"
        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    }`}
    style={
      isActive
        ? {
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1.5px solid rgba(99, 102, 241, 0.45)',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.08)',
          }
        : { border: '1.5px solid transparent' }
    }
  >
    {item.name}
  </Link>
);

const DesktopNavGroup = ({ item, isActive, isOpen, onToggle, setOpenDropdown, location }) => {
  const menuId = `desktop-nav-menu-${item.name.toLowerCase().replace(/\s+/g, "-")}`;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(event);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpenDropdown(null);
    }
  };

  return (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-controls={menuId}
      className={`relative group flex items-center gap-1.5 text-[13px] xl:text-[14px] font-medium transition-all duration-200 whitespace-nowrap px-3.5 py-1.5 rounded-lg ${
      className={`relative group flex items-center gap-1 text-[12px] xl:text-[13px] font-medium transition-all duration-200 whitespace-nowrap px-2.5 py-1.5 rounded-lg ${
        isActive || isOpen
          ? "text-indigo-600 dark:text-indigo-400 font-semibold"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
      }`}
    >
      <span className="relative z-10 flex items-center gap-1">
        {item.name}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </span>

      {(isActive || isOpen) && (
        <>
          <motion.span
            layoutId="activeBox"
            className="absolute inset-0 bg-indigo-100/60 dark:bg-indigo-500/20 border border-indigo-200/80 dark:border-indigo-500/50 rounded-lg -z-0"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
          <motion.span
            layoutId="activeBoxGlow"
            className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 dark:via-indigo-400 blur-[1.5px] -z-0"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        </>
      )}
    </button>

    {isOpen && (
      <motion.div
        id={menuId}
        role="menu"
        aria-label={`${item.name} navigation`}
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute left-1/2 -translate-x-1/2 mt-4 w-60 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(99,102,241,0.1)] rounded-2xl z-50 border border-white/40 dark:border-zinc-700/40 p-2 overflow-hidden"
      >
        {item.subItems.map((sub) => (
          <Link
            key={sub.name}
            to={sub.href}
            onClick={() => setOpenDropdown(null)}
            role="menuitem"
            className={`group flex items-center gap-3 w-full px-3 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200 border ${
              location.pathname.startsWith(sub.href)
                ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
            }`}
          >
            {React.cloneElement(sub.icon, {
              className: `w-5 h-5 transition-colors ${
                location.pathname.startsWith(sub.href)
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              }`,
            })}
            {sub.name}
          </Link>
        ))}
      </motion.div>
    )}
  </div>
  );
};
const MobileDrawerFooter = ({ 
  isAuthenticated, user, primaryLine, secondaryLine, closeAllMenus, location, 
  handleLogoutClick, isDarkMode, toggleTheme, cursorEnabled, toggleCursor 
      {/* Render dropdown via portal so it's never clipped by overflow-x-auto */}
      <AnimatePresence>
        {isOpen && createPortal(
          <motion.div
            key={`dd-${item.name}`}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
            className="w-60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(99,102,241,0.1)] rounded-2xl border border-white/40 dark:border-zinc-700/40 p-2 overflow-hidden"
          >
            {item.subItems.map((sub) => (
              <Link
                key={sub.name}
                to={sub.href}
                onClick={() => setOpenDropdown(null)}
                className={`group flex items-center gap-3 w-full px-3 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200 border ${
                  location.pathname.startsWith(sub.href)
                    ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
                }`}
              >
                {React.cloneElement(sub.icon, {
                  className: `w-5 h-5 transition-colors ${
                    location.pathname.startsWith(sub.href)
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`,
                })}
                {sub.name}
              </Link>
            ))}
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
);
const MobileDrawerFooter = ({
  isAuthenticated,
  user,
  primaryLine,
  secondaryLine,
  closeAllMenus,
  location,
  handleLogoutClick,
  isDarkMode,
  toggleTheme,
  cursorEnabled,
  toggleCursor,
}) => (
  <div className="border-t border-gray-200 dark:border-zinc-800/50 bg-gray-50 dark:bg-zinc-900/50">
    <div className="p-4">
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
      <div className="flex gap-3 mt-4">
        <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} isMobile={true} />
        <CursorToggleButton
  cursorEnabled={cursorEnabled}
  toggleCursor={toggleCursor}
  isMobile={true}
/>

<NotificationBell />
        
      </div>
    </div>
  </div>
);

const UserProfileDropdown = ({
  user,
  primaryLine,
  secondaryLine,
  showProfileDropdown,
  setShowProfileDropdown,
  location,
  handleLogoutClick,
}) => (
  <div className="relative profile-container">
    <button 
      onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
      type="button"
      aria-label="Open user menu"
      aria-expanded={showProfileDropdown}
      aria-haspopup="menu"
      aria-controls="user-profile-menu"
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
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
          id="user-profile-menu"
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
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
            <Link role="menuitem" to="/dashboard" onClick={() => setShowProfileDropdown(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/dashboard" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link role="menuitem" to="/dashboard/achievements" onClick={() => setShowProfileDropdown(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/dashboard/achievements" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <Trophy className="w-4 h-4" />Achievements
            </Link>
            <Link role="menuitem" to="/profile" onClick={() => setShowProfileDropdown(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/profile" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <UserCog className="w-4 h-4" />Edit Profile
            </Link>
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <button type="button" role="menuitem" onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <LogOut className="w-4 h-4" />Logout
            <Link
              to="/dashboard"
              onClick={() => setShowProfileDropdown(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/dashboard" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/dashboard/achievements"
              onClick={() => setShowProfileDropdown(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/dashboard/achievements" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </Link>
            <Link
              to="/dashboard/profile"
              onClick={() => setShowProfileDropdown(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/dashboard/profile" ? "bg-black/5 dark:bg-white/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <UserCog className="w-4 h-4" />
              View Profile
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
);

const MobileUserSection = ({
  user,
  primaryLine,
  secondaryLine,
  closeAllMenus,
  location,
  handleLogoutClick,
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-3 px-3 py-2 mb-2">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
      <div>
        <p className="font-semibold text-gray-800 dark:text-white truncate">{primaryLine}</p>
        {secondaryLine && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{secondaryLine}</p>
        )}
      </div>
    </div>
    <Link
      to="/dashboard"
      onClick={closeAllMenus}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${location.pathname === "/dashboard" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      <LayoutDashboard className="w-5 h-5" />
      Dashboard
    </Link>
    <Link
      to="/dashboard/achievements"
      onClick={closeAllMenus}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${location.pathname === "/dashboard/achievements" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      <Trophy className="w-5 h-5" />
      Achievements
    </Link>
    <Link
      to="/dashboard/profile"
      onClick={closeAllMenus}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${location.pathname === "/dashboard/profile" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      <UserCog className="w-5 h-5" />
      View Profile
    </Link>
    <button
      onClick={handleLogoutClick}
      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  </div>
);

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
  { name: "Calendar", href: "/calendar", icon: <CalendarDays className="w-5 h-5" /> },
  { name: "Bookmarks", href: "/bookmarks", icon: <Bookmark className="w-5 h-5" /> },
  { name: "Reminders", href: "/reminders", icon: <Bell className="w-5 h-5" /> },
  {
   name: "Event Hub", 
    icon: <Calendar className="w-5 h-5" />,
    subItems: [
      { name: "Explore Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
      { name: "Event Calendar", href: "/calendar", icon: <CalendarDays className="w-5 h-5" /> },
      { name: "Saved Events",   href: "/bookmarks", icon: <Bookmark className="w-5 h-5" /> },
      { name: "Reminders",      href: "/reminders", icon: <Bell className="w-5 h-5" /> },
    ],
  },
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
  {
    name: "More",
    icon: <MoreHorizontal className="w-5 h-5" />,
    subItems: [
      
      { name: "About", href: "/about", icon: <Info className="w-5 h-5" /> },
      { name: "FAQ", href: "/faq", icon: <HelpCircle className="w-5 h-5" /> },
      { name: "Contact", href: "/contact", icon: <MessageSquare className="w-5 h-5" /> },
    ],
  },
];

const NavList = ({ location, openDropdown, onToggleGroup, onLinkClick, isMobile }) => (
  <>
    {NAV_ITEMS.map((item) => {
        const isActive = item.href
          ? (item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href))
          : item.subItems?.some(s => location.pathname.startsWith(s.href));

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
          <DesktopNavLink key={item.name} item={item} isActive={isActive} onClick={onLinkClick} />
        );
      })}
    </>
);

const DesktopNavLinks = ({ openDropdown, setOpenDropdown, location }) => {
  return (
    <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 pl-6">
      <NavList
        location={location}
        openDropdown={openDropdown}
        onToggleGroup={(name) => setOpenDropdown(openDropdown === name ? null : name)}
        isMobile={false}
      />
    </div>
  );
};

const MobileDrawerHeader = ({ closeBtnRef, closeAllMenus }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800/50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-gray-900 dark:text-white">Menu</span>
    </div>
    <button
      ref={closeBtnRef}
      type="button"
      onClick={closeAllMenus}
      aria-label="Close navigation menu"
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
    >
      <ChevronDown className="w-6 h-6 rotate-90" />
    </button>
  </div>
);

const MobileDrawer = ({ isOpen, drawerRef, openDropdown, setOpenDropdown, closeAllMenus, handleTouchStart, handleTouchMove, handleTouchEnd, closeBtnRef, handleLogoutClick, primaryLine, secondaryLine, cursorEnabled, toggleCursor }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-drawer"
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-y-0 right-0 h-dvh overflow-y-auto w-[88vw] max-w-[20rem] sm:max-w-sm shadow-2xl z-50 flex flex-col bg-white backdrop-blur-lg dark:bg-gray-900/95"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <MobileDrawerHeader closeBtnRef={closeBtnRef} closeAllMenus={closeAllMenus} />

          <div className="flex-grow p-3.5 sm:p-4 space-y-2 overflow-y-auto">
            <NavList
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
        </motion.div>
      )}
    </AnimatePresence>
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
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    try {
      toggleBtnRef.current?.focus();
    } catch (e) {
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
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success("You have been logged out successfully.", {
      className: "custom-toast",
      autoClose: 3000,
    });
    navigate("/");
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          isMobileMenuOpen || showLogoutModal
            ? "bg-black/60 opacity-100"
            : showProfileDropdown || openDropdown
              ? "bg-transparent opacity-100"
              : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
      />
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
        className="fixed top-0 left-0 w-full z-40 shadow-sm bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-300 overflow-visible"
      >
        <div className="neon-navbar-border"></div>

        <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-[68px] px-4 md:px-6 xl:px-10 gap-4 w-full overflow-hidden">
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 z-20 mr-2"
          >
            <img
              src="/Eventra.png"
              alt="Eventra Logo"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Centered Desktop Nav Links */}
          <div className="flex-1 flex justify-start min-w-0">
            <DesktopNavLinks openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} location={location} />
          </div>

          {/* Right Controls */}
          <div className="hidden xl:flex items-center gap-4 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCommandPalette(true)}
              title="Open Command Palette (⌘K)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 focus:outline-none bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-zinc-200/60 dark:border-zinc-700/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] group"
            >
              <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              <div className="flex items-center gap-0.5 text-[9px] font-black tracking-widest text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 uppercase">
                <span>⌘</span>
                <span>K</span>
              </div>
            </motion.button>

            <ThemeToggleButton
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              isMobile={false}
            />

            <CursorToggleButton
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
              isMobile={false}
            />

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

          {/* Mobile menu button */}
          <div className="lg:hidden ml-auto">
            <button 
              ref={toggleBtnRef} 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-expanded={isMobileMenuOpen} 
              aria-haspopup="dialog"
          {/* Mobile Menu Button */}
          <div className="xl:hidden flex-shrink-0">
            <button
              ref={toggleBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
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

      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;