import { Link } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";

const AuthButtons = ({ isMobile, closeAllMenus }) => (
  <div className={isMobile ? "mt-4 space-y-3" : "flex items-center space-x-6"}>
    <Link
      to="/login"
      onClick={isMobile ? closeAllMenus : undefined}
      className={
        isMobile
          ? "flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 font-semibold text-white transition-all duration-300 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          : "text-sm font-semibold whitespace-nowrap text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
      }
    >
      {isMobile && <LogIn className="h-5 w-5" />}Sign In
    </Link>
    <Link
      to="/signup"
      onClick={isMobile ? closeAllMenus : undefined}
      className={
        isMobile
          ? "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-transparent py-3 font-semibold text-zinc-900 transition-all duration-300 hover:border-zinc-300 dark:border-zinc-700 dark:text-white dark:hover:border-zinc-600"
          : "flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg focus:ring-4 focus:ring-indigo-500/30 focus:outline-none"
      }
    >
      {isMobile && <Sparkles className="h-5 w-5" />}Get Started
    </Link>
  </div>
);

export default AuthButtons;
