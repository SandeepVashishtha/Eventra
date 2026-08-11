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
    <div className="flex items-center gap-3 px-3 py-2 mb-2">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover" loading="lazy"/>
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

export default MobileUserSection;
