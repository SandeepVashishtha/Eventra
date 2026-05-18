import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";
import { ChevronDown } from "lucide-react"; 

const NavbarLinks = () => {
  const location = useLocation();

  return (
    <div className="flex flex-wrap justify-center gap-4 w-full">
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
              <div className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${activeClasses}`}>
                {item.icon} 
                <span>{item.name}</span>
                <ChevronDown className="w-4 h-4 opacity-50 group-hover/nav:rotate-180 transition-transform" />
              </div>

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
            className={`text-sm font-medium transition-colors whitespace-nowrap py-3 px-2 min-h-[44px] flex items-center justify-center ${
              active
                ? "text-black dark:text-white"
                : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
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