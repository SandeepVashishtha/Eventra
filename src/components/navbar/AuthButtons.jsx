import React from "react";
import { Link } from "react-router-dom";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-gray-300 dark:hover:text-white dark:focus-visible:ring-offset-gray-900 whitespace-nowrap"
      >
        Sign In
      </Link>

      <Link
        to="/signup"
        className="rounded-lg px-4 py-2 bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-gray-900 whitespace-nowrap"
      >
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;