import React from "react";
import { Link } from "react-router-dom";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors whitespace-nowrap"
      >
        Sign In
      </Link>

      <Link
        to="/signup"
        className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors whitespace-nowrap flex items-center justify-center text-center shadow-lg"
      >
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;