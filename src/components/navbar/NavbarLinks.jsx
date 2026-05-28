import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();

  const getNavLinkClasses = (active) => {
    return vertical
      ? `mobile-drawer-link flex min-h-[44px] gap-2 items-center text-sm font-medium transition-all duration-200 w-full py-2 px-3 border-l-2 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          active
            ? "text-black dark:text-white border-black dark:border-white font-semibold bg-gray-100 dark:bg-gray-800"
            : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`
      : `flex gap-1 items-center text-sm font-medium transition-all duration-200 px-1 lg:px-2 py-2 border-b-2 rounded-t-md whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:rounded-lg ${
          active
            ? "text-black dark:text-white border-black dark:border-white font-semibold"
            : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        }`;
  };

  return (
    <nav
      className={`flex ${
        vertical
          ? "flex-col items-start w-full gap-2"
          : "items-center gap-2 lg:gap-3 xl:gap-4 mx-2 lg:mx-4 min-w-0 flex-wrap"
      }`}
      aria-label={vertical ? "Mobile primary links" : "Primary links"}
    >
      {NAV_ITEMS.map((item) => {
        const isSubItemActive = item.subItems?.some(
          (sub) => location.pathname === sub.href
        );

        if (item.subItems) {
          return (
            <div
              key={item.name}
              className={`relative group/nav flex items-center shrink-0 ${
                vertical ? "w-full flex-col items-start" : "flex-none"
              }`}
            >
              <div className="flex w-full items-center">
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

                {!vertical && (
                  <button
                    type="button"
                    className={`ml-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                      isSubItemActive
                        ? "text-black dark:text-white"
                        : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    }`}
                    aria-label={`Toggle ${item.name} menu`}
                  >
                    <ChevronDown className="w-4 h-4 opacity-70 group-hover/nav:rotate-180 transition-transform duration-200" />
                  </button>
                )}
              </div>

              <div
                className={
                  vertical
                    ? "mt-1 block w-full space-y-1 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/60"
                    : "absolute top-full left-0 hidden group-hover/nav:block bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 min-w-[220px] z-50 border border-gray-100 dark:border-gray-700 mt-1 animate-in fade-in slide-in-from-top-1 duration-200"
                }
              >
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.name}
                    to={sub.href}
                    onClick={onClick}
                    className={({ isActive }) =>
                      `mobile-drawer-link flex min-h-[44px] items-center gap-2 rounded-md p-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:rounded-lg ${
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
