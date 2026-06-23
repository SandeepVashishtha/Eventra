import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const MobileNavGroup = ({ item, isActive, isOpen, onToggle, closeAllMenus, location }) => (
  <div key={item.name}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`mobile-nav-group-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium border ${
        isActive
          ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
          : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 border-transparent"
      }`}
    >
      <span className="flex items-center gap-3">
        {item.icon} {item.name}
      </span>
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium border ${
                isSubActive
                  ? "bg-indigo-100/40 dark:bg-indigo-500/15 border-indigo-200/50 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border-transparent"
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
