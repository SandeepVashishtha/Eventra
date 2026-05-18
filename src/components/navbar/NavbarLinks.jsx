import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";
import { ChevronDown } from "lucide-react"; 

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();

  return (
    <div className={`flex ${vertical ? "flex-col items-start w-full gap-4" : "items-center gap-5"}`}>
      {NAV_ITEMS.map((item) => {

        const isCurrentPath = location.pathname === item.href;
        const isSubItemActive = item.subItems?.some(sub => location.pathname === sub.href);
        const active = isCurrentPath || isSubItemActive;

        const activeClasses = active
          ? "text-black dark:text-white"
          : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white";

        if (item.subItems) {
          return (
            <div key={item.name} className="relative group/nav flex items-center gap-1.5 cursor-pointer py-2">
              <Link
                to={item.href}
                onClick={onClick}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${activeClasses}`}
              >
                {item.icon} 
                <span>{item.name}</span>
              </Link>
              <button
                type="button"
                className={`flex items-center justify-center rounded-md p-1 transition-colors ${activeClasses}`}
                aria-label={`Toggle ${item.name} menu`}
              >
                <ChevronDown className="w-4 h-4 opacity-50 group-hover/nav:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-full left-0 hidden group-hover/nav:block bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 min-w-[200px] z-50 border border-gray-100 dark:border-gray-700 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {item.subItems.map((sub) => {
                  const subActive = location.pathname === sub.href;
                  return (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${
                        subActive
                          ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                          : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      {sub.icon} 
                      <span>{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.href || "#"}
            onClick={onClick}
            className={`text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              vertical
                ? `pl-3 border-l-2 w-full text-left py-1 ${
                    active
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
                  }`
                : `pb-1 border-b-2 ${
                    active
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
                  }`
            }`}
          >
            {item.icon} 
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;
