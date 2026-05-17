import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

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
  UserCog,
  LogOut,
  LogIn,
  MessageSquare,
  Book,
  HelpCircle,
  ChevronDown,
  MousePointer,
  Sun,
  Moon,
} from "lucide-react";

/* =========================================================
   NAV ITEMS
========================================================= */

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },

  {
    name: "Events",
    href: "/events",
    icon: <Calendar className="w-5 h-5" />,
  },

  {
    name: "Hackathons",
    href: "/hackathons",
    icon: <Sparkles className="w-5 h-5" />,
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

  {
    name: "About",
    href: "/about",
    icon: <Info className="w-5 h-5" />,
  },

  {
    name: "FAQ",
    href: "/faq",
    icon: <HelpCircle className="w-5 h-5" />,
  },

  {
    name: "Contact",
    href: "/contact",
    icon: <MessageSquare className="w-5 h-5" />,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getUserDisplayNames = (user) => {
  if (!user) {
    return {
      primary: "User",
      secondary: null,
    };
  }

  const primary =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username?.trim() ||
    user.email?.trim() ||
    "User";

  const secondaryCandidate =
    user.email?.trim() || user.username?.trim() || "";

  const secondary =
    secondaryCandidate && secondaryCandidate !== primary
      ? secondaryCandidate
      : null;

  return {
    primary,
    secondary,
  };
};

const clearBodyScrollStyles = () => {
  try {
    const storedTop = document.body.style.top;

    Object.assign(document.body.style, {
      position: "",
      top: "",
      left: "",
      right: "",
      width: "",
    });

    if (storedTop) {
      window.scrollTo(0, parseInt(storedTop, 10) * -1 || 0);
    }
  } catch (err) {}
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

/* =========================================================
   COMPONENTS
========================================================= */

const ThemeToggleButton = ({
  isDarkMode,
  toggleTheme,
  isMobile = false,
}) => (
  <button
    onClick={toggleTheme}
    aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    className={
      isMobile
        ? "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
        : "flex items-center gap-1.5 px-2.5 py-1 mr-2 text-xs font-medium border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
    }
  >
    {isDarkMode ? (
      <Sun
        className={
          isMobile
            ? "w-5 h-5 text-amber-500"
            : "w-4 h-4 text-amber-500"
        }
      />
    ) : (
      <Moon
        className={
          isMobile
            ? "w-5 h-5 text-indigo-500"
            : "w-4 h-4 text-indigo-500"
        }
      />
    )}

    {isMobile
      ? isDarkMode
        ? "Light Mode"
        : "Dark Mode"
      : isDarkMode
      ? "LIGHT"
      : "DARK"}
  </button>
);

const CursorToggleButton = ({
  cursorEnabled,
  toggleCursor,
  isMobile = false,
}) => (
  <button
    onClick={toggleCursor}
    className={
      isMobile
        ? "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
        : "hidden"
    }
  >
    <MousePointer
      className={`w-5 h-5 ${
        cursorEnabled ? "text-emerald-500" : "text-gray-400"
      }`}
    />

    {cursorEnabled ? "Cursor ON" : "Cursor OFF"}
  </button>
);

const AuthButtons = ({
  isMobile = false,
  closeAllMenus,
}) => (
  <div className={isMobile ? "space-y-3" : "flex items-center space-x-2"}>
    <Link
      to="/login"
      onClick={closeAllMenus}
      className={
        isMobile
          ? "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all"
          : "px-4 py-2 text-base font-medium text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white transition-colors"
      }
    >
      {isMobile && <LogIn className="w-5 h-5" />}
      Sign In
    </Link>

    <Link
      to="/signup"
      onClick={closeAllMenus}
      className={
        isMobile
          ? "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-black dark:text-white bg-white dark:bg-black/50 border-2 border-black/15 dark:border-white/20 transition-all"
          : "px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-zinc-800 rounded-lg dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all"
      }
    >
      {isMobile && <Sparkles className="w-5 h-5" />}
      Get Started
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

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [showProfileDropdown, setShowProfileDropdown] =
    useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [navHeight, setNavHeight] = useState(0);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const navRef = useRef(null);

  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const { primary, secondary } =
    getUserDisplayNames(user);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setBodyScrollStyles(window.scrollY || 0);

      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    } else {
      clearBodyScrollStyles();
    }

    return clearBodyScrollStyles;
  }, [isMobileMenuOpen]);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
    setOpenDropdown(null);

    clearBodyScrollStyles();

    try {
      toggleBtnRef.current?.focus();
    } catch (err) {}
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);

    logout();

    toast.success("You have been logged out successfully.", {
      autoClose: 3000,
    });

    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

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

    if (typeof start !== "number") return;
    if (typeof end !== "number") return;

    const deltaX = end - start;

    if (deltaX > 50) {
      closeAllMenus();
    }

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isMobileMenuOpen ||
          showProfileDropdown ||
          openDropdown ||
          showLogoutModal
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
      />

      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full z-40 shadow-sm bg-white dark:bg-gray-900 border-b border-black/10 dark:border-white/10"
      >
        <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
          <Link to="/" className="flex-shrink-0 z-20">
            <h2
              className="text-3xl font-semibold tracking-tight text-black dark:text-white"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Eventra
            </h2>
          </Link>

          {/* Centered nav links */}
          <div className="hidden lg:flex absolute left-[48%] transform -translate-x-1/2 space-x-5 z-10">
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

          {/* Right Group: Auth Controls and Mobile Toggle */}
          <div className="hidden lg:flex items-center ml-auto z-20">
          
          {/* Theme Toggle Button */}
          <button
           onClick={toggleTheme}
           className="text-xl text-gray-700 dark:text-white hover:opacity-70 transition-opacity mr-2"
            >
           {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
</button>


            <div className="flex items-center space-x-2 ml-2">
              {isAuthenticated() ? (
                <div className="relative profile-container">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 text-sm font-medium text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full dark:bg-white/20 bg-gray-300 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-600  dark:text-white" />
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
                        className="absolute right-0 top-full mt-2 w-64 
                 bg-white dark:bg-gray-900 
                 rounded-lg shadow-2xl overflow-hidden 
                 border border-gray-200 dark:border-gray-800"
                      >
                        {/* Profile header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex items-center gap-3">
                            {user?.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
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

                        {/* Menu items */}
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

                        {/* Logout - CHANGE ONLY THIS BUTTON */}
                        <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                          <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
                     text-gray-700 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                <div className="flex items-center space-x-1">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-base font-medium text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 text-sm font-semibold text-white transition-all duration-300 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:via-slate-800 hover:to-indigo-900 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
              <AuthButtons isMobile={false} />
              )}
            </div>
          </div>

            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowProfileDropdown(!showProfileDropdown)
                  }
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="profile"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-white/10 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                        scale: 0.95,
                      }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {primary}
                        </p>

                        {secondary && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {secondary}
                          </p>
                        )}
                      </div>

                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          onClick={() =>
                            setShowProfileDropdown(false)
                          }
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() =>
                            setShowProfileDropdown(false)
                          }
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <UserCog className="w-4 h-4" />
                          Edit Profile
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
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
              <AuthButtons />
            )}
          </div>
        </div>
      </nav>

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