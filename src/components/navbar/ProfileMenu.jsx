import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";

const ProfileMenu = ({ user, logout }) => {
  return (
    <div className="relative">
      <button>
        {user?.profilePicture ? (
          <img loading="lazy"
            src={user.profilePicture}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <User />
        )}
      </button>

      <div className="absolute right-0 mt-3 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-56 p-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2"
        >
          <LayoutDashboard />
          Dashboard
        </Link>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 w-full"
        >
          <LogOut />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;