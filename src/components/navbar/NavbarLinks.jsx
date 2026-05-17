import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { NAV_ITEMS } from "./constants/navItems";
import { isNavGroupActive, isNavLinkActive } from "./utils/navLinkActive";

const linkClass = (active) =>
  `text-sm font-medium transition-colors whitespace-nowrap px-3 py-1.5 rounded-full border ${
    active
      ? "text-white bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 shadow-sm"
      : "text-gray-600 border-transparent hover:text-black dark:text-gray-300 dark:hover:text-white"
  }`;

const NavbarLinks = ({ onNavigate }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleNavigate = () => {
    setOpenDropdown(null);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
      {NAV_ITEMS.map((item) => {
        if (item.subItems) {
          const groupActive = isNavGroupActive(location.pathname, item.subItems);
          const isOpen = openDropdown === item.name;

          return (
            <div key={item.name} className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                className={`flex items-center gap-1 ${linkClass(groupActive || isOpen)}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                {item.name}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="mt-2 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900 lg:absolute lg:left-0 lg:top-full lg:z-50 lg:mt-2 lg:min-w-[12rem]">
                  {item.subItems.map((sub) => {
                    const subActive = isNavLinkActive(location.pathname, sub.href);

                    return (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        onClick={handleNavigate}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                          subActive
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                        aria-current={subActive ? "page" : undefined}
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
        }

        const active = isNavLinkActive(location.pathname, item.href);

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={handleNavigate}
            className={linkClass(active)}
            aria-current={active ? "page" : undefined}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;
