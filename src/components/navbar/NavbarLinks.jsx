import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./constants/navItems";

const isNavItemActive = (item, pathname) => {
  if (item.href && pathname === item.href) {
    return true;
  }

  if (item.subItems?.some((subItem) => subItem.href === pathname)) {
    return true;
  }

  if (item.href && item.href !== "/" && pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return false;
};

const getLinkClassName = (active, layout) => {
  const base =
    layout === "vertical"
      ? "block w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
      : "relative text-sm font-medium transition-colors whitespace-nowrap px-1 py-1";

  if (active) {
    return `${base} text-black dark:text-white ${
      layout === "vertical"
        ? "bg-gray-100 dark:bg-gray-800 font-semibold"
        : "font-semibold after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-black dark:after:bg-white"
    }`;
  }

  return `${base} text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white`;
};

const NavbarLinks = ({ layout = "horizontal" }) => {
  const location = useLocation();
  const containerClass =
    layout === "vertical"
      ? "flex flex-col items-stretch gap-2 w-full"
      : "flex items-center gap-5";

  return (
    <div className={containerClass}>
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(item, location.pathname);

        return (
          <Link
            key={item.name}
            to={item.href || item.subItems?.[0]?.href || "#"}
            aria-current={active ? "page" : undefined}
            className={getLinkClassName(active, layout)}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;
