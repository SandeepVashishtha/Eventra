import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = () => {
  const location = useLocation();

  return (
    <div className="flex flex-wrap justify-center gap-4 w-full">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.href;

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
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;