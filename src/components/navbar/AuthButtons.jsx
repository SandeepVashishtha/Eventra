import { memo } from "react";
import { Link } from "react-router-dom";

const AuthButtons = memo(function AuthButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      <Link
        to="/login"
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-300 text-black hover:bg-blue-400 dark:text-white dark:bg-blue-800 dark:hover:text-white transition-colors whitespace-nowrap"
      >
        Sign In
      </Link>

      <Link
        to="/signup"
        className="px-4 py-2 bg-yellow-200 text-black rounded-lg text-sm font-semibold hover:bg-yellow-300 dark:bg-amber-800 dark:text-white dark:hover:bg-amber-900 transition-colors whitespace-nowrap"
      >
        Get Started
      </Link>
    </div>
  );
});

export default AuthButtons;
