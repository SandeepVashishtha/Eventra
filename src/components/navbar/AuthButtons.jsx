import { Link } from "react-router-dom";

const AuthButtons = () => {
  return (
    <div className="flex items-center justify-center gap-3">
      <Link
        to="/login"
        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
      >
        Sign In
      </Link>

      <Link
        to="/signup"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors whitespace-nowrap shadow-xs"
      >
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;
