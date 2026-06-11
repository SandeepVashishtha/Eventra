import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Trophy,
  UserCog,
  UserIcon,
} from "lucide-react";

const MobileUserSection = ({
  user,
  primaryLine,
  secondaryLine,
  closeAllMenus,
  location,
  handleLogoutClick,
}) => (
  <div className="space-y-1">
    <div className="mb-2 flex items-center gap-3 px-3 py-2">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover" loading="lazy"/>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white">
          <UserIcon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="truncate font-semibold text-gray-800 dark:text-white">{primaryLine}</p>
        {secondaryLine && (
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{secondaryLine}</p>
        )}
      </div>
    </div>
    <Link
      to="/dashboard"
      onClick={closeAllMenus}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${location.pathname === "/dashboard" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      <LayoutDashboard className="h-5 w-5" />
      Dashboard
    </Link>
    <Link
      to="/dashboard/achievements"
      onClick={closeAllMenus}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${location.pathname === "/dashboard/achievements" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      <Trophy className="h-5 w-5" />
      Achievements
    </Link>
    <Link
      to="/dashboard/profile"
      onClick={closeAllMenus}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-lg font-medium ${location.pathname === "/dashboard/profile" ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      <UserCog className="h-5 w-5" />
      View Profile
    </Link>
    <button
      onClick={handleLogoutClick}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
    >
      <LogOut className="h-5 w-5" />
      Logout
    </button>
  </div>
);

export default MobileUserSection;
