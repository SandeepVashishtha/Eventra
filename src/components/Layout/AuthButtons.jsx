import { Link } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";

const AuthButtons = ({ isMobile, closeAllMenus }) => (
  <div className={isMobile ? "space-y-3 mt-4" : "flex items-center space-x-6"}>
    <Link
      to="/login"
      onClick={isMobile ? closeAllMenus : undefined}
      className={
        isMobile
          ? "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all duration-300"
          : "text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
      }
    >
      {isMobile && <LogIn className="w-5 h-5" />}Sign In
    </Link>
    <Link
      to="/signup"
      onClick={isMobile ? closeAllMenus : undefined}
      className={
        isMobile
          ? "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-zinc-900 dark:text-white bg-transparent border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300"
          : "flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 whitespace-nowrap"
      }
    >
      {isMobile && <Sparkles className="w-5 h-5" />}Get Started
    </Link>
  </div>
);

export default AuthButtons;
