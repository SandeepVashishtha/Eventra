import { Link } from "react-router-dom";

const MobileNavLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.href}
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-base font-medium transition-colors ${
      isActive
        ? "border-indigo-200/80 bg-indigo-100/60 font-semibold text-indigo-600 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/20 dark:text-indigo-400"
        : "border-transparent text-gray-700 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
    }`}
  >
    {item.icon}
    {item.name}
  </Link>
);

export default MobileNavLink;
