import { Link } from "react-router-dom";

const MobileNavLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.href}
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium border ${
      isActive
        ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
        : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 border-transparent"
    }`}
  >
    {item.icon}
    {item.name}
  </Link>
);

export default MobileNavLink;
