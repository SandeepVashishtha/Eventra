import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();

  return (
    <div className={`flex ${vertical ? "flex-col items-start w-full gap-4" : "items-center gap-5"}`}>
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.href;

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
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;