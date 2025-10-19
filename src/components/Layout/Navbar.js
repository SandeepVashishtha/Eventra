import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../common/ConfirmationModal"; // ADD THIS IMPORT

import ThemeToggleButton from "../common/ThemeToggleButton";

import { UserCog } from "lucide-react";
import {
  Home,
  Calendar,
  Rocket,
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
} from "lucide-react";
import { RocketLaunchIcon } from "@heroicons/react/20/solid";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ADD THIS LINE

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryLine =
    (user?.fullName && user.fullName.trim()) ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    (user?.username && user.username.trim()) ||
    (user?.email && user.email.trim()) ||
    "User";
  const secondaryCandidate =
    (user?.email && user.email.trim()) ||
    (user?.username && user.username.trim()) ||
    "";
  const secondaryLine =
    secondaryCandidate && secondaryCandidate !== primaryLine
      ? secondaryCandidate
      : null;

  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    try {
      const stored = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      if (stored) {
        const scrollY = parseInt(stored || "0", 10) * -1 || 0;
        window.scrollTo(0, scrollY);
      }
    } catch (e) {
      /* ignore */
    }
    try {
      toggleBtnRef.current?.focus();
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    const event = new CustomEvent("mobileMenuToggle", { detail: isMobileMenuOpen });
    window.dispatchEvent(event);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const prevTop = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${prevTop}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      const stored = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      if (stored) {
        const scrollY = parseInt(stored || "0", 10) * -1 || 0;
        window.scrollTo(0, scrollY);
      }
    }
    return () => {
      try {
        const stored = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        if (stored) {
          const scrollY = parseInt(stored || "0", 10) * -1 || 0;
          window.scrollTo(0, scrollY);
        }
      } catch (e) {
        /* ignore */
      }
    };
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
      // Swiped right to close
      closeAllMenus();
    }
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
    {
      name: "Hackathons",
      href: "/hackathons",
      icon: <Rocket className="w-5 h-5" />,
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
          icon: <RocketLaunchIcon className="w-5 h-5" />,
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

  // REPLACE THE EXISTING handleLogout FUNCTION WITH THESE 3 FUNCTIONS:
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isMobileMenuOpen || showProfileDropdown || openDropdown || showLogoutModal
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
      />

      <nav
        ref={navRef}
        // AOS Implementation
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
        // End AOS Implementation
        className="fixed top-0 left-0 w-full z-40 shadow-lg 
             bg-gradient-to-r from-purple-100/80 via-white to-indigo-100 backdrop-blur-lg border-b border-indigo-100
             dark:bg-gradient-to-r dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 dark:border-indigo-950"
      >
        <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
          {/* Logo on the left */}
          <Link to="/" className="flex-shrink-0 z-20">
            <h2
              className="text-2xl font-bold text-transparent bg-clip-text relative overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #4f46e5, #8b8dffff, #4f46e5)",
                backgroundSize: "200% 200%",
                animation: "shimmer 2.5s linear infinite",
                fontFamily: "Dancing Script",
                fontSize: "40px",
              }}
            >
              Eventra
            </h2>
            <style>
              {`
        @keyframes shimmer {
          0% { background-position: -200% -200%; }
          100% { background-position: 200% 200%; }
        }
      `}
            </style>
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
                          ? "text-indigo-600 dark:text-white"
                          : "text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white"
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
                        className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl rounded-lg z-50 border border-gray-200 dark:border-gray-700 p-2"
                      >
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group flex items-center gap-3 w-full px-3 py-2 text-base font-medium rounded-md transition-colors ${
                              location.pathname === sub.href
                                ? "bg-black/5 dark:bg-white/10 text-indigo-600 dark:text-white"
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
                      ? "text-indigo-600 dark:text-white"
                      : "text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Group: Auth Controls and Mobile Toggle */}
          <div className="hidden lg:flex items-center ml-auto z-20">
            <ThemeToggleButton />
            <div className="flex items-center space-x-2 ml-2">
              {isAuthenticated() ? (
                <div className="relative profile-container">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
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
                                ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
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
                                ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
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
                     text-red-600 dark:text-red-400 
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                    className="px-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 text-sm font-semibold text-white transition-all bg-indigo-600 hover:bg-indigo-700 dark:bg-white/10 dark:border dark:border-white/20 rounded-lg dark:hover:bg-white/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="lg:hidden ml-auto">
            <button
              ref={toggleBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Open navigation"
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
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

      <div
        id="mobile-drawer"
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 h-screen overflow-y-auto w-80 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out 
        bg-white backdrop-blur-lg dark:bg-gray-900/95
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal={isMobileMenuOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/20">
          <h2
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
            style={{ fontFamily: "Dancing Script" }}
          >
            Eventra
          </h2>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <button
              ref={closeBtnRef}
              onClick={closeAllMenus}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-grow p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href
              ? location.pathname === item.href
              : item.subItems?.some((sub) => location.pathname === sub.href);
            if (item.subItems) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.name ? null : item.name
                      )
                    }
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-left text-lg font-medium ${
                      isActive
                        ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-indigo-600 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon} {item.name}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openDropdown === item.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === item.name && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 dark:border-white/20 space-y-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={closeAllMenus}
                            className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium ${
                              isSubActive
                                ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-indigo-600 dark:text-white"
                                : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white"
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
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeAllMenus}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${
                  isActive
                    ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-indigo-600 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/20">
          {isAuthenticated() ? (
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
                  <p className="font-semibold text-gray-800 dark:text-white truncate">
                    {primaryLine}
                  </p>
                  {secondaryLine && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {secondaryLine}
                    </p>
                  )}
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={closeAllMenus}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${
                  location.pathname === "/dashboard"
                    ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-indigo-600 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={closeAllMenus}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${
                  location.pathname === "/profile"
                    ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-indigo-600 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <UserCog className="w-5 h-5" />
                Edit Profile
              </Link>
              {/* CHANGE ONLY THIS BUTTON */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={closeAllMenus}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-black/10 dark:hover:border-white/20 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={closeAllMenus}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white transition-all bg-indigo-600 hover:bg-indigo-700 dark:bg-white/10 dark:border dark:border-white/20 rounded-lg dark:hover:bg-white/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ADD THIS MODAL AT THE VERY BOTTOM */}
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
