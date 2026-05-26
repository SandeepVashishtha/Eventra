import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();

  const getNavLinkClasses = (active) => {
    return vertical
      ? `flex gap-2 items-center text-sm font-medium transition-all duration-200 w-full py-2 pl-3 border-l-2 ${
          active
            ? "text-black dark:text-white border-black dark:border-white font-semibold bg-gray-100 dark:bg-gray-800"
            : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`
      : `flex gap-2 items-center text-sm font-medium transition-all duration-200 px-1 py-2 border-b-2 rounded-t-md ${
          active
            ? "text-black dark:text-white border-black dark:border-white font-semibold"
            : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        }`;
  };

  return (
    <nav
      className={`flex ${vertical ? "flex-col items-start w-full gap-4" : "items-center gap-3 mx-7"}`}
      aria-label={vertical ? "Mobile primary links" : "Primary links"}
    <div
      className={`flex ${
        vertical
          ? "flex-col items-start w-full gap-2"
          : "items-center gap-3 mx-7"
      }`}
    >
      {NAV_ITEMS.map((item) => {
        const isSubItemActive = item.subItems?.some(
          (sub) => location.pathname === sub.href
        );

        if (item.subItems) {
          return (
            <div
              key={item.name}
              className={`relative group/nav flex items-center ${
                vertical ? "w-full flex-col items-start" : "flex-none"
              }`}
            >
              <Link
                to={item.href}
                onClick={onClick}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  vertical ? "py-2" : "px-1 py-2 rounded-md"
                } ${activeClasses}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
              <button
                type="button"
                className={`flex items-center justify-center rounded-md p-1 transition-colors ${activeClasses}`}
                aria-label={`Show ${item.name} submenu`}
                aria-haspopup="true"
              >
                <ChevronDown className="w-4 h-4 opacity-50 group-hover/nav:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-full left-0 hidden group-hover/nav:block group-focus-within/nav:block bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 min-w-[200px] z-50 border border-gray-100 dark:border-gray-700 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {item.subItems.map((sub) => {
                  const subActive = location.pathname === sub.href;
                  return (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      onClick={onClick}
                      aria-current={subActive ? "page" : undefined}
                      className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${
                        subActive
                          ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
              <div className="flex items-center">
                <NavLink
                  to={item.href}
                  onClick={onClick}
                  className={({ isActive }) =>
                    getNavLinkClasses(isActive || isSubItemActive)
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>

                <button
                  type="button"
                  className={`p-1 rounded-md transition-colors ${
                    isSubItemActive
                      ? "text-black dark:text-white"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                  }`}
                  aria-label={`Toggle ${item.name} menu`}
                >
                  <ChevronDown className="w-4 h-4 opacity-70 group-hover/nav:rotate-180 transition-transform duration-200" />
                </button>
              </div>

              <div className="absolute top-full left-0 hidden group-hover/nav:block bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 min-w-[220px] z-50 border border-gray-100 dark:border-gray-700 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.name}
                    to={sub.href}
                    onClick={onClick}
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-semibold"
                          : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`
                    }
                  >
                    {sub.icon}
                    <span>{sub.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={`flex gap-1 items-center text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              vertical
                ? `pl-3 border-l-2 w-full text-left py-2 ${
                    active
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
                  }`
                : `px-1 py-2 rounded-md border-b-2 ${
                    active
                      ? "text-black dark:text-white border-black dark:border-white font-semibold"
                      : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent"
                  }`
            }`}
            className={({ isActive }) => getNavLinkClasses(isActive)}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default NavbarLinks;