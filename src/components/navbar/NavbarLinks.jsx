import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ layout = "horizontal" }) => {
  const location = useLocation();
  const containerClass =
    layout === "vertical"
      ? "flex flex-col items-stretch gap-2 w-full"
      : "flex items-center gap-5";

  return (
    <div className={containerClass}>
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href || "#"}
            className={`text-sm font-medium transition-colors ${
              layout === "vertical" ? "block w-full px-4 py-3 rounded-lg" : "whitespace-nowrap"
            } ${
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