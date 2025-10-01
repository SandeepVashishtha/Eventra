import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import ThemeToggleButton from "../common/ThemeToggleButton";
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
  ArrowRight,
  ShieldUser,
  MessageSquare,
  Book,
  HelpCircle,
} from "lucide-react";
import { RocketLaunchIcon } from "@heroicons/react/20/solid";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Smart display lines for user identity
  const primaryLine =
    (user?.fullName && user.fullName.trim()) ||
    ([user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()) ||
    (user?.username && user.username.trim()) ||
    (user?.email && user.email.trim()) ||
    "User";

  const secondaryCandidate =
    (user?.email && user.email.trim()) ||
    (user?.username && user.username.trim()) ||
    "";

  // Only show secondary if it's different from primary
  const secondaryLine =
    secondaryCandidate && secondaryCandidate !== primaryLine
      ? secondaryCandidate
      : null;

  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    // restore any body lock that might be set
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
      // ignore in environments without document
    }

    // restore focus to the mobile toggle when the drawer is closed
    try {
      toggleBtnRef.current?.focus();
    } catch (e) {
      // ignore
    }
  };

  // When mobile menu opens, lock body scroll using position:fixed and focus the close button.
  useEffect(() => {
    let prevTop = null;
    if (isMobileMenuOpen) {
      prevTop = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${prevTop}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      // focus close button shortly after open
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      // restore
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
      // cleanup on unmount
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
        // ignore
      }
    };
  }, [isMobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    closeAllMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Focus trap + Escape handling while drawer is open
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

  // Touch handlers for swipe-to-close on mobile
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
    // if swiped left more than 50px, close
    if (deltaX < -50) {
      closeAllMenus();
    }
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="w-5 h-5 text-indigo-500" />,
    },
    {
      name: "Events",
      href: "/events",
      icon: <Calendar className="w-5 h-5 text-green-500" />,
    },
    {
      name: "Hackathons",
      href: "/hackathons",
      icon: <Rocket className="w-5 h-5 text-pink-500" />,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: <FolderKanban className="w-5 h-5 text-orange-500" />,
    },
    {
      name: "Community",
      icon: <Users className="w-5 h-5 text-purple-500" />,
      subItems: [
        {
          name: "Leaderboard",
          href: "/leaderBoard",
          icon: <Trophy className="w-5 h-5 text-yellow-500" />,
        },
        {
          name: "Contributors",
          href: "/contributors",
          icon: <Users className="w-5 h-5 text-blue-500" />,
        },
        {
          name: "Contributors Guide",
          href: "/contributorguide",
          icon: <Book className="w-5 h-5 text-rose-500" />,
        },
        {
          name: "Community Events",
          href: "/communityEvent",
          icon: <RocketLaunchIcon className="w-5 h-5 text-blue-500" />,
        },
      ],
    },
    {
      name: "About",
      href: "/about",
      icon: <Info className="w-5 h-5 text-cyan-500" />,
    },
    {
      name: "FAQ",
      href: "/faq",
      icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: <MessageSquare className="w-5 h-5 text-teal-500" />,
    },
  ];

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate("/");
  };

  const navRef = useRef(null);
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

  const renderAuthSection = () => {
    if (isAuthenticated()) {
      return (
        <div className="hidden md:flex items-center space-x-4 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileDropdown(!showProfileDropdown);
            }}
            className="flex items-center space-x-2 p-1 transition-shadow duration-300"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-indigo-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
          </button>

          {showProfileDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-3 z-50 animate-fadeIn border border-transparent dark:border-gray-700">

              {/* UPDATED: Added dark mode border */}
               <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                 <div className="flex items-center space-x-3">
                   {user?.profilePicture ? (
                     <img
                       src={user.profilePicture}
                       alt="Profile"
                       className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600"
                       onError={(e) => (e.target.style.display = "none")}
                     />
                   ) : (
                     <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-indigo-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                       <UserIcon className="w-6 h-6" />
                     </div>
                   )}
                   <div>
                     <div className="font-semibold text-gray-900 dark:text-gray-100">
                       {primaryLine}
                     </div>
                     {secondaryLine && (
                       <div className="text-sm text-gray-500 dark:text-gray-400">
                         {secondaryLine}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
              {/* UPDATED: Added dark mode text and hover colors */}



              <Link
                to="/dashboard"
                onClick={() => setShowProfileDropdown(false)}
                className={`flex items-center px-4   py-3 rounded-xl transition-colors
    ${
      location.pathname === "/dashboard"
        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
        : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
    }
  `}
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                onClick={() => setShowProfileDropdown(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors
    ${
      location.pathname === "/profile"
        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
        : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
    }
  `}
              >
                Edit Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="hidden md:flex items-center space-x-2 flex-wrap max-w-full">
          {/* --- CHANGE 3: Padding reduced --- */}
          <Link
            to="/login"
            className="flex items-center px-2 py-2 text-gray-800 dark:text-gray-200 font-medium rounded-full hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 group whitespace-nowrap text-sm"
          >
            <LogIn className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform duration-300 transform group-hover:translate-x-1" />
            Sign In
          </Link>

          {/* --- CHANGE 3: Padding reduced --- */}
          <Link
            to="/signup"
            className="relative flex items-center px-3 py-2 font-medium rounded-full text-white overflow-hidden group whitespace-nowrap ml-2"
            style={{ minWidth: "auto" }}
          >
            <span
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-600 to-indigo-400 animate-gradient-x transition-all duration-300"
              style={{ zIndex: 0 }}
            ></span>

            <span className="relative z-10 flex items-center text-sm">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1.5 animate-bounce-slow" />
            </span>

            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300"></span>

            <style>
              {`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1s infinite;
        }
      `}
            </style>
          </Link>
        </div>
      );
    }
  };

  const [openDropdown, setOpenDropdown] = useState(null);
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-300 ${
          isMobileMenuOpen || showProfileDropdown
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
      />

      <nav ref={navRef} className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md dark:bg-black border-b border-gray-300 dark:border-gray-800 py-5 transition-colors duration-300">
        {/* --- CHANGE 1: Reduced padding and gap --- */}
        <div className="max-w-screen-2xl mx-auto px-4 flex justify-between items-center gap-2">
          <Link to="/" className="flex-shrink-0">
            <h2
              className="text-2xl font-bold text-transparent bg-clip-text relative overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #4f46e5, #8b8dffff, #4f46e5)",
                backgroundSize: "200% 200%",
                animation: "shimmer 2.5s linear infinite",
                fontFamily: "Dancing Script",
                fontSize: "40px",
                marginLeft: "25px"

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

          <div className="hidden lg:flex items-center space-x-0.5 justify-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              if (item.subItems) {
                return (
                  <div key={item.name} className="relative">
                    {/* --- CHANGE 2: Padding reduced --- */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === item.name ? null : item.name
                        );
                      }}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {item.icon} {item.name}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 mt-2 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl rounded-2xl z-50 border border-gray-100 dark:border-gray-700 divide-y divide-gray-300 dark:divide-gray-600"
                      >
                        {item.subItems.map((sub, idx) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-200
                                  ${
                                    location.pathname === sub.href
                                      ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
                                      : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                                  }
                                  ${idx === 0 ? "rounded-t-2xl" : ""} 
                                  ${
                                    idx === item.subItems.length - 1
                                      ? "rounded-b-2xl"
                                      : ""
                                  }
                                `}
                          >
                            <motion.span
                              whileHover={{ scale: 1.2, rotate: 8 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 12,
                              }}
                            >
                              {sub.icon}
                            </motion.span>
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              }
              return (
                // --- CHANGE 2: Padding reduced ---
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 py-2 px-2 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center flex-shrink-0 space-x-2">
            <ThemeToggleButton />
            {renderAuthSection()}
          </div>

          <div className="lg:hidden">
            <button
              ref={toggleBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              aria-controls="mobile-drawer"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

        <div
          id="mobile-drawer"
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`fixed top-0 right-0 h-screen overflow-y-auto w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out 
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal={isMobileMenuOpen}
        >
          <div className="flex items-center justify-end px-5 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              ref={closeBtnRef}
              onClick={closeAllMenus}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                className="h-4 w-4"
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
          <div className="flex flex-col px-5 py-4 space-y-2 lg:hidden">
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
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors
          ${
            isActive
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700"
              : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          }
        `}
                    >
                      <span className="flex items-center gap-2 relative">
                        {item.icon} {item.name}
                        {isActive && (
                          <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></span>
                        )}
                      </span>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {openDropdown === item.name && (
                      <div className="mt-1 ml-4 flex flex-col space-y-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = location.pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
    ${
      isSubActive
        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700"
        : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
    }
  `}
                            >
                              {sub.icon}

                              <span className="relative">
                                {sub.name}
                                {isSubActive && (
                                  <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></span>
                                )}
                              </span>
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
    ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700"
        : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
    }
  `}
                >
                  {item.icon}

                  <span className="relative">
                    {item.name}
                    {isActive && (
                      <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></span>
                    )}
                  </span>
                </Link>
              );
            })}

            <div className="mt-2 px-1 flex items-center">
              <ThemeToggleButton />{" "}
              <p className=" dark:text-gray-300 text-black">Theme</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated() ? (
              <div className="px-4 py-4 space-y-1">
                <div className="flex items-center space-x-3 mb-3">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border border-indigo-500"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center rounded-full border border-indigo-500 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">

                      {primaryLine}

                    </p>
                    {secondaryLine && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {secondaryLine}
                      </p>
                    )}

                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={closeAllMenus}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg relative transition-colors 
                        ${
                          location.pathname === "/dashboard"
                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700"
                            : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                        }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="relative inline-block">
                    Dashboard
                    {location.pathname === "/dashboard" && (
                      <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></span>
                    )}
                  </span>
                </Link>

                <Link
                  to="/profile"
                  onClick={closeAllMenus}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg relative transition-colors 
                        ${
                          location.pathname === "/profile"
                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700"
                            : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                        }`}
                >
                  <ShieldUser className="w-5 h-5" />
                  <span className="relative inline-block">
                    Edit Profile
                    {location.pathname === "/profile" && (
                      <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></span>
                    )}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeAllMenus();
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-3">
                <Link
                  to="/login"
                  onClick={closeAllMenus}
                  className="group flex w-full items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <LogIn className="w-5 h-5 mr-2 text-gray-600" />
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  onClick={closeAllMenus}
                  className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;