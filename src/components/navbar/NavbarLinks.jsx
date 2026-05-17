import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ variant = "desktop", onNavigate }) => {
  const location = useLocation();
  const isMobile = variant === "mobile";

  return (
    <div
      className={
        isMobile
          ? "flex w-full flex-col items-stretch gap-1"
          : "flex items-center gap-5"
      }
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href || "#"}
            onClick={onNavigate}
            className={`text-sm font-medium transition-colors ${
              isMobile ? "block w-full rounded-lg px-3 py-3" : "whitespace-nowrap"
            } ${
              active
                ? "text-black dark:text-white"
                : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
            } ${isMobile && active ? "bg-gray-100 dark:bg-gray-800" : ""}`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;