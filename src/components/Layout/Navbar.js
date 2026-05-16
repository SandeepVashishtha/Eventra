import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { toast } from "react-toastify";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import ConfirmationModal from "../common/ConfirmationModal";


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
  Moon,
  UserCog,
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


    <button
      onClick={toggleTheme}
      className={
        isMobile
          ? "flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
          : "p-2 rounded-full text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-110 transition-all duration-300"
      }
    >
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
          {primaryLine?.charAt(0).toUpperCase()}
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
      ) : (
        <Moon className={isMobile ? "w-5 h-5" : "w-5 h-5"} />
      )}

      {isMobile && (isDarkMode ? "Dark OFF" : "Dark ON")}
    </button>
  );
};

const CursorToggleButton = ({
  cursorEnabled,
  toggleCursor,
  isMobile = false,
}) => {
  return (
    <button
      onClick={toggleCursor}
      className={
        isMobile
          ? "flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
          : "hidden"
      }
    >
      <MousePointer className="w-5 h-5" />

      {cursorEnabled ? "Cursor OFF" : "Cursor ON"}
    </button>
  );
};

const AuthButtons = ({ isMobile = false, closeAllMenus }) => {
  return (
    <div
      className={
        isMobile ? "space-y-3" : "flex items-center space-x-2"
      }
    >
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
};

const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  /* =========================================================
     EFFECTS
  ========================================================= */

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

  /* =========================================================
     HANDLERS
  ========================================================= */

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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* OVERLAY */}

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

      {/* NAVBAR */}

      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full z-40 shadow-sm bg-white dark:bg-gray-900 border-b border-black/10 dark:border-white/10"
      >
        <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
          {/* LOGO */}

          <Link to="/" className="flex-shrink-0 z-20">
            <h2
              className="text-3xl font-semibold tracking-tight text-black dark:text-white"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Eventra
            </h2>
          </Link>

          {/* DESKTOP NAV */}

          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 z-10">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href
                ? location.pathname === item.href
                : item.subItems?.some(
                    (sub) => location.pathname === sub.href
                  );

              if (item.subItems) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                  >
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.name
                            ? null
                            : item.name
                        )
                      }
                      className={`flex items-center gap-1 text-base font-medium transition-colors ${
                        isActive || openDropdown === item.name
                          ? "text-black dark:text-white"
                          : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                      }`}
                    >
                      {item.name}

                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.name
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {openDropdown === item.name && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: 10,
                          }}
                          className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white dark:bg-gray-900 shadow-xl rounded-lg border border-gray-200 dark:border-gray-800 p-2"
                        >
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              onClick={() =>
                                setOpenDropdown(null)
                              }
                              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                location.pathname === sub.href
                                  ? "bg-black/10 dark:bg-white/10 text-black dark:text-white"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                            >
                              {sub.icon}

                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
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

          {/* RIGHT SIDE */}

          <div className="hidden lg:flex items-center ml-auto gap-3 z-20">
            <ThemeToggleButton
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />

            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowProfileDropdown(
                      !showProfileDropdown
                    )
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

          {/* MOBILE MENU BUTTON */}

          <div className="lg:hidden ml-auto">
            <button
              ref={toggleBtnRef}
              onClick={() =>
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <svg
                className="h-6 w-6"
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

      {/* MOBILE DRAWER */}

      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 h-screen overflow-y-auto w-[88vw] max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <h2
            className="text-2xl font-bold text-black dark:text-white"
            style={{ fontFamily: '"Anton", sans-serif' }}
          >
            Eventra
          </h2>

          <button
            ref={closeBtnRef}
            onClick={closeAllMenus}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* LINKS */}

        <div className="flex-grow p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href
              ? location.pathname === item.href
              : item.subItems?.some(
                  (sub) => location.pathname === sub.href
                );

            if (item.subItems) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.name
                          ? null
                          : item.name
                      )
                    }
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg ${
                      isActive
                        ? "bg-black/10 dark:bg-white/10"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === item.name
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {openDropdown === item.name && (
                    <div className="ml-5 mt-2 space-y-1 border-l border-gray-300 dark:border-white/10 pl-3">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={closeAllMenus}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300"
                        >
                          {sub.icon}

                          {sub.name}
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${
                  isActive
                    ? "bg-black/10 dark:bg-white/10"
                    : ""
                }`}
              >
                {item.icon}

                {item.name}
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}

        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          {isAuthenticated() ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-3">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <p className="font-semibold dark:text-white">
                    {primary}
                  </p>

                  {secondary && (
                    <p className="text-sm text-gray-500">
                      {secondary}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={closeAllMenus}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />

                Dashboard
              </Link>

              <Link
                to="/profile"
                onClick={closeAllMenus}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
              >
                <UserCog className="w-5 h-5" />

                Edit Profile
              </Link>

              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg"
              >
                <LogOut className="w-5 h-5" />

                Logout
              </button>
            </div>
          ) : (
            <AuthButtons
              isMobile={true}
              closeAllMenus={closeAllMenus}
            />
          )}

          <div className="flex gap-2 mt-4">
            <ThemeToggleButton
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              isMobile={true}
            />

            <CursorToggleButton
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
              isMobile={true}
            />
          </div>
        </div>
      </div>

      {/* MODAL */}

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />

      {/* SPACER */}

      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;