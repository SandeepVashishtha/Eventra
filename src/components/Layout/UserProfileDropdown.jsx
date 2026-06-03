import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Trophy,
  UserCog,
  UserIcon,
} from "lucide-react";

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
      className="flex items-center gap-2 text-sm font-medium text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white transition-colors"
    >
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
          loading="lazy"
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
          id="user-profile-menu"
          role="menu"
          aria-label="User menu"
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
              role="menuitem"
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
              role="menuitem"
              to="/dashboard/achievements"
              onClick={() => setShowProfileDropdown(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === "/dashboard/achievements"
                  ? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </Link>
            <Link
              role="menuitem"
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
              type="button"
              role="menuitem"
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

export default UserProfileDropdown;
