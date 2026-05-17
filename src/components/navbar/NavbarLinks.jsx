import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = () => {
  const location = useLocation();

  return (
    <div className="flex items-center gap-5">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href || "#"}
            className={
              active
                ? "text-black dark:text-white"
                : "text-gray-500"
            }
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;