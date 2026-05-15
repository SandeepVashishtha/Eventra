import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NavbarActions from './NavbarActions';

const DesktopNavbar = ({
  navItems,
  openDropdown,
  setOpenDropdown,
  isAuthenticated,
  user,
  primaryLine,
  secondaryLine,
  showProfileDropdown,
  setShowProfileDropdown,
  handleLogoutClick,
  cursorEnabled,
  toggleCursor
}) => {
  const location = useLocation();

  return (
    <>
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
                    className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl rounded-lg z-50 border border-black/10 dark:border-white/20 p-2"
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
                          className: "w-5 h-5 text-gray-500 dark:text-gray-400",
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
        <NavbarActions cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} className="mr-3" />
        
        <div className="flex items-center space-x-2 ml-2">
          {isAuthenticated() ? (
            <ProfileDropdown
              user={user}
              primaryLine={primaryLine}
              secondaryLine={secondaryLine}
              showProfileDropdown={showProfileDropdown}
              setShowProfileDropdown={setShowProfileDropdown}
              handleLogoutClick={handleLogoutClick}
            />
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
                className="px-5 py-2 text-sm font-semibold text-white transition-all duration-300 bg-black hover:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DesktopNavbar;
