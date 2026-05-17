import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ isMobile = false, closeMenu }) => {
  const location = useLocation();

  return (
    <div
      className={`${
        isMobile ? "flex flex-col items-start gap-4" : "flex items-center gap-5"
      }`}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href || "#"}
            onClick={closeMenu}
            className={`text-sm font-medium transition-colors whitespace-nowrap ${
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