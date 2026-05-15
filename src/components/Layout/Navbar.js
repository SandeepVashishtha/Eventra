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

const NAV_ITEMS = [
  { name: "Home",       href: "/",          icon: <Home        className="w-4 h-4" /> },
  { name: "Events",     href: "/events",     icon: <Calendar    className="w-4 h-4" /> },
  { name: "Hackathons", href: "/hackathons", icon: <Sparkles    className="w-4 h-4" /> },
  { name: "Projects",   href: "/projects",   icon: <FolderKanban className="w-4 h-4" /> },
  {
    name: "Community",
    icon: <Users className="w-4 h-4" />,
    subItems: [
      { name: "Leaderboard",       href: "/leaderBoard",    icon: <Trophy  className="w-4 h-4" /> },
      { name: "Contributors",      href: "/contributors",   icon: <Users   className="w-4 h-4" /> },
      { name: "Contributors Guide",href: "/contributorguide",icon: <Book   className="w-4 h-4" /> },
      { name: "Community Events",  href: "/communityEvent", icon: <Users   className="w-4 h-4" /> },
    ],
  },
  { name: "About",   href: "/about",   icon: <Info         className="w-4 h-4" /> },
  { name: "FAQ",     href: "/faq",     icon: <HelpCircle   className="w-4 h-4" /> },
  { name: "Contact", href: "/contact", icon: <MessageSquare className="w-4 h-4" /> },
];

// ─── Small Reusable Pieces ────────────────────────────────────────────────────

const UserAvatar = ({ profilePicture, size = "sm" }) => {
  const dims  = { sm: "w-8 h-8",   md: "w-10 h-10", lg: "w-11 h-11" };
  const icons = { sm: "w-4 h-4",   md: "w-5 h-5",   lg: "w-6 h-6"  };

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

const NavLinkBase = ({ to, isActive, onClick, children, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`transition-all duration-200 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"} ${className}`}
  >
    {children}
  </Link>
);

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

const ThemeToggle = ({ compact = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative flex items-center justify-center rounded-full border transition-all duration-300
        ${compact ? "w-8 h-8" : "w-9 h-9"}
        border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        hover:bg-gray-100 dark:hover:bg-gray-700
        shadow-sm hover:shadow-md`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDarkMode ? (
          <motion.span key="sun"
            initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </motion.span>
        ) : (
          <motion.span key="moon"
            initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 text-indigo-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

// ─── Cursor Toggle ────────────────────────────────────────────────────────────

const CursorToggle = ({ cursorEnabled, toggleCursor, compact = false }) => (
  <button
    onClick={toggleCursor}
    title={cursorEnabled ? "Disable custom cursor" : "Enable custom cursor"}
    className={`flex items-center gap-1.5 rounded-full border transition-all duration-200 font-medium shadow-sm hover:shadow-md
      ${compact
        ? "px-2.5 py-1.5 text-xs"
        : "px-3 py-1.5 text-xs"
      }
      ${cursorEnabled
        ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
  >
    <MousePointer className="w-3.5 h-3.5" />
    {compact ? (cursorEnabled ? "ON" : "OFF") : (cursorEnabled ? "Cursor ON" : "Cursor OFF")}
  </button>
);

// ─── Desktop: Dropdown Item ───────────────────────────────────────────────────

const DesktopDropdownItem = ({ item, openDropdown, setOpenDropdown, isActive }) => {
  const location = useLocation();
  const isOpen   = openDropdown === item.name;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenDropdown(isOpen ? null : item.name);
        }}
        className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 px-1 py-0.5 rounded
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
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 z-50
              bg-white dark:bg-gray-900
              border border-gray-100 dark:border-gray-800
              rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40
              overflow-hidden"
          >
            {/* Decorative top bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />

            <div className="p-1.5">
              {item.subItems.map((sub) => {
                const subActive = location.pathname === sub.href;
                return (
                  <Link
                    key={sub.name}
                    to={sub.href}
                    onClick={() => setOpenDropdown(null)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150
                      ${subActive
                        ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    <span className={subActive ? "text-violet-500" : "text-gray-400 dark:text-gray-500"}>
                      {sub.icon}
                    </span>
                    {sub.name}
                    {subActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Desktop: Nav Links ───────────────────────────────────────────────────────

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
    </div>
  );
};

// ─── Desktop: Guest Buttons ───────────────────────────────────────────────────

const DesktopGuestButtons = () => (
  <div className="flex items-center gap-2">
    <Link
      to="/login"
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
        text-gray-700 dark:text-gray-300
        hover:text-gray-900 dark:hover:text-white
        hover:bg-gray-100 dark:hover:bg-gray-800
        border border-transparent hover:border-gray-200 dark:hover:border-gray-700
        transition-all duration-200"
    >
      <LogIn className="w-4 h-4" /> Sign In
    </Link>
    <Link
      to="/signup"
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

// ─── Desktop: Profile Dropdown ────────────────────────────────────────────────

const DesktopProfileDropdown = ({ user, primaryLine, secondaryLine, onLogoutClick, onClose }) => {
  const location = useLocation();

  const menuLinks = [
    { to: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    { to: "/profile",   icon: <UserCog         className="w-4 h-4" />, label: "Edit Profile" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: 10, scale: 0.96  }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2.5 w-64 z-50
        bg-white dark:bg-gray-900
        border border-gray-100 dark:border-gray-800
        rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
        overflow-hidden"
    >
      {/* Gradient header */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

      {/* User info */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <UserAvatar profilePicture={user?.profilePicture} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{primaryLine}</p>
            {secondaryLine && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{secondaryLine}</p>
            )}
            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
              ● Online
            </span>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="p-2">
        {menuLinks.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <span className={active ? "text-violet-500" : "text-gray-400 dark:text-gray-500"}>{icon}</span>
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onLogoutClick}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20
            transition-all duration-150"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </motion.div>
  );
};

// ─── Desktop: Auth Section ────────────────────────────────────────────────────

const DesktopAuthSection = ({
  user, isAuthenticated, primaryLine, secondaryLine,
  onLogoutClick, showProfileDropdown, setShowProfileDropdown,
}) => {
  if (!isAuthenticated()) return <DesktopGuestButtons />;

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border
          border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800
          hover:border-violet-300 dark:hover:border-violet-600
          shadow-sm hover:shadow-md
          transition-all duration-200 group"
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

// ─── Mobile: Single Nav Item ──────────────────────────────────────────────────

const MobileNavItem = ({ item, openDropdown, setOpenDropdown, closeAllMenus }) => {
  const location = useLocation();
  const isActive = item.href
    ? location.pathname === item.href
    : item.subItems?.some((sub) => location.pathname === sub.href);
  const isOpen = openDropdown === item.name;

  const baseClass = "flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150";
  const activeClass = "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400";
  const inactiveClass = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";

  if (item.subItems) {
    return (
      <div>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : item.name)}
          className={`${baseClass} ${isActive ? activeClass : inactiveClass} justify-between`}
        >
          <span className="flex items-center gap-3">
            <span className={isActive ? "text-violet-500" : "text-gray-400 dark:text-gray-500"}>
              {item.icon}
            </span>
            {item.name}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 pl-3 border-l-2 border-violet-100 dark:border-violet-900/50 space-y-0.5 pb-1">
                {item.subItems.map((sub) => {
                  const subActive = location.pathname === sub.href;
                  return (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      onClick={closeAllMenus}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                        ${subActive
                          ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                      <span className={subActive ? "text-violet-500" : "text-gray-400"}>{sub.icon}</span>
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      onClick={closeAllMenus}
      className={`${baseClass} ${isActive ? activeClass : inactiveClass} gap-3`}
    >
      <span className={isActive ? "text-violet-500" : "text-gray-400 dark:text-gray-500"}>
        {item.icon}
      </span>
      {item.name}
      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
    </Link>
  );
};

// ─── Mobile: Guest Buttons ────────────────────────────────────────────────────

const MobileGuestButtons = ({ closeAllMenus }) => (
  <div className="space-y-2.5 pt-1">
    <Link
      to="/login"
      onClick={closeAllMenus}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold
        text-gray-700 dark:text-gray-200
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        transition-all duration-200"
    >
      <LogIn className="w-4 h-4" /> Sign In
    </Link>
    <Link
      to="/signup"
      onClick={closeAllMenus}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold
        text-white
        bg-gradient-to-r from-violet-600 to-indigo-600
        hover:from-violet-700 hover:to-indigo-700
        shadow-md shadow-violet-500/30
        transition-all duration-200"
    >
      <Sparkles className="w-4 h-4" /> Get Started
    </Link>
  </div>
);

// ─── Mobile: Authenticated Section ───────────────────────────────────────────

const MobileAuthenticatedSection = ({ user, primaryLine, secondaryLine, closeAllMenus, handleLogoutClick }) => {
  const location = useLocation();

  const links = [
    { to: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    { to: "/profile",   icon: <UserCog         className="w-4 h-4" />, label: "Edit Profile" },
  ];

  return (
    <div className="space-y-1">
      {/* User card */}
      <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-900/40">
        <UserAvatar profilePicture={user?.profilePicture} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{primaryLine}</p>
          {secondaryLine && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{secondaryLine}</p>
          )}
        </div>
      </div>

      {links.map(({ to, icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={closeAllMenus}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${active
                ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            <span className={active ? "text-violet-500" : "text-gray-400 dark:text-gray-500"}>{icon}</span>
            {label}
          </Link>
        );
      })}

      <button
        onClick={handleLogoutClick}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
          text-red-600 dark:text-red-400
          hover:bg-red-50 dark:hover:bg-red-900/20
          transition-all duration-150"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
};

// ─── Mobile: Drawer ───────────────────────────────────────────────────────────

const MobileDrawer = ({
  isOpen, drawerRef, openDropdown, setOpenDropdown, closeAllMenus,
  handleTouchStart, handleTouchMove, handleTouchEnd, closeBtnRef,
  toggleCursor, cursorEnabled, handleLogoutClick, primaryLine, secondaryLine,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      {/* Drawer panel */}
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
        {/* Top gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 flex-shrink-0" />

        {/* Header */}
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

        {/* Scrollable nav list */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5">
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

        {/* Footer */}
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
        </div>
      </div>
    </>
  );
};

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const prevTop = window.scrollY || 0;
      Object.assign(document.body.style, {
        position: "fixed", top: `-${prevTop}px`,
        left: "0", right: "0", width: "100%",
      });
    } else {
      const stored = document.body.style.top;
      Object.assign(document.body.style, {
        position: "", top: "", left: "", right: "", width: "",
      });
      if (stored) window.scrollTo(0, parseInt(stored || "0", 10) * -1 || 0);
    }
    return () => {
      const stored = document.body.style.top;
      Object.assign(document.body.style, {
        position: "", top: "", left: "", right: "", width: "",
      });
      if (stored) window.scrollTo(0, parseInt(stored || "0", 10) * -1 || 0);
    };
  }, [isLocked]);
};

const useDrawerKeyboardTrap = (isOpen, drawerRef, closeAllMenus) => {
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeAllMenus(); return; }
      if (e.key === "Tab") {
        const focusable = drawer.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if      (e.shiftKey  && document.activeElement === first) { e.preventDefault(); last.focus();  }
        else if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, drawerRef, closeAllMenus]);
};

const useNavHeight = (navRef) => {
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    const update = () => { if (navRef.current) setNavHeight(navRef.current.offsetHeight); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [navRef]);
  return navHeight;
};

const useSwipeToClose = (onClose) => {
  const startX   = useRef(null);
  const currentX = useRef(null);
  return {
    handleTouchStart: (e) => { startX.current = currentX.current = e.touches[0].clientX; },
    handleTouchMove:  (e) => { currentX.current = e.touches[0].clientX; },
    handleTouchEnd:   ()  => {
      if ((currentX.current ?? 0) - (startX.current ?? 0) > 50) onClose();
      startX.current = currentX.current = null;
    },
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
  return {
    primaryLine,
    secondaryLine: secondary && secondary !== primaryLine ? secondary : null,
  };
};

// ─── Scroll-aware hook ────────────────────────────────────────────────────────

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

  const drawerRef   = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef= useRef(null);
  const navRef      = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const scrolled  = useScrolled();

  const { primaryLine, secondaryLine }            = useUserDisplayName(user);
  const navHeight                                  = useNavHeight(navRef);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeToClose(closeAllMenus);

  useScrollLock(isMobileMenuOpen);
  useDrawerKeyboardTrap(isMobileMenuOpen, drawerRef, closeAllMenus);

  function closeAllMenus() {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    try { toggleBtnRef.current?.focus(); } catch (_) {}
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: isMobileMenuOpen }));
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) setTimeout(() => closeBtnRef.current?.focus(), 50);
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
            <span
              className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Eventra
            </span>
          </Link>

          {/* Desktop nav links — centered */}
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
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span key="menu"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile drawer */}
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

      {/* Logout modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />

      {/* Spacer so page content clears the fixed nav */}
      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;