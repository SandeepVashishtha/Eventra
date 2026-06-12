import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const MobileNavGroup = ({ item, isActive, isOpen, onToggle, closeAllMenus, location }) => (
  <div key={item.name}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`mobile-nav-group-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
      className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-base font-medium transition-colors ${
        isActive
          ? "border-indigo-200/80 bg-indigo-100/60 font-semibold text-indigo-600 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/20 dark:text-indigo-400"
          : "border-transparent text-gray-700 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
      }`}
    >
      <span className="flex items-center gap-3">
        {item.icon} {item.name}
      </span>
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div
        id={`mobile-nav-group-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
        className="mt-2 ml-3 space-y-1 border-l-2 border-gray-200 pl-3 dark:border-white/20"
      >
        {item.subItems.map((sub) => {
          const isSubActive = location.pathname.startsWith(sub.href);
          return (
            <Link
              key={sub.name}
              to={sub.href}
              onClick={closeAllMenus}
              className={`flex items-center gap-3 rounded-md border px-4 py-2 text-base font-medium ${
                isSubActive
                  ? "border-indigo-200/50 bg-indigo-100/40 font-semibold text-indigo-600 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {sub.icon}
              {sub.name}
            </Link>
          );
        })}
      </div>
    )}
  </div>
);

export default MobileNavGroup;
