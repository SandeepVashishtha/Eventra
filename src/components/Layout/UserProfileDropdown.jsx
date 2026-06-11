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
  <div className="profile-container relative">
    <button
      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
      type="button"
      aria-label="Open user menu"
      aria-expanded={showProfileDropdown}
      aria-haspopup="menu"
      aria-controls="user-profile-menu"
      className="flex items-center gap-2 text-sm font-medium text-black/90 transition-colors hover:text-black dark:text-white/90 dark:hover:text-white"
    >
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-white/20">
          <UserIcon className="h-4 w-4 text-gray-600 dark:text-white" />
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
          className="absolute top-full right-0 mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-800 to-indigo-950">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {primaryLine}
                </p>
                {secondaryLine && (
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {secondaryLine}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-2 dark:bg-gray-900">
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
              <LayoutDashboard className="h-4 w-4" />
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
              <Trophy className="h-4 w-4" />
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
              <UserCog className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
          <div className="border-t border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/50">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default UserProfileDropdown;
