import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavbarLink = ({ navItems }) => {
  const location = useLocation();

  if (!navItems || !Array.isArray(navItems)) {
    return null;
  }

  return (
    <div className="hidden md:flex space-x-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`relative px-4 py-2.5 text-lg font-medium transition-all duration-300 rounded-lg group
              ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"} 
              hover:text-indigo-600 dark:hover:text-indigo-400`}
          >
            <span className="relative z-10">{item.name}</span>

            <span
              className={`absolute left-0 bottom-0 h-1 rounded-full transition-all duration-300 
                ${
                  isActive
                    ? "w-full bg-indigo-600 dark:bg-indigo-400"
                    : "w-0 bg-indigo-500 group-hover:w-full"
                }`}
            ></span>

            <span className="absolute inset-0 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 opacity-0 transition-opacity duration-300 group-hover:opacity-20 dark:group-hover:opacity-40"></span>
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLink;
