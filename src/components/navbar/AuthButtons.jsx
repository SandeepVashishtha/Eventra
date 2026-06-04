import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

const AuthButtons = ({ isMobile = false, onActionClick }) => {
  const baseClass =
    "h-10 px-5 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 ease-in-out whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 active:scale-[0.98]";

  const secondaryClass = `${baseClass} ${
    isMobile ? "w-full" : ""
  } text-zinc-700 hover:text-zinc-900 border border-zinc-200 bg-white hover:bg-zinc-50 active:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:active:bg-zinc-800/50`;

  const primaryClass = `${baseClass} ${
    isMobile ? "w-full" : ""
  } bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/15`;

  return (
    <div
      className={
        isMobile
          ? "flex flex-col gap-3 w-full mt-4"
          : "flex items-center justify-center gap-3"
      }
    >
      <Link to="/login" onClick={onActionClick} className={secondaryClass}>
        {isMobile && <LogIn className="w-4 h-4 mr-2 animate-pulse" />}
        Sign In
      </Link>

      <Link to="/signup" onClick={onActionClick} className={primaryClass}>
        {isMobile && <UserPlus className="w-4 h-4 mr-2 animate-pulse" />}
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;

