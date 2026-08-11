import { Link, useLocation } from "react-router-dom";

const NavbarLink = ({ navItems = [] }) => {
  const location = useLocation();

  return (
    <div className="hidden md:flex items-center gap-4">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            to={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex items-center px-2 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            {item.icon && (
              <span className="mr-1.5 flex items-center">
                {item.icon}
              </span>
            )}

            <span>{item.name}</span>

            {/* Underline */}
            <span
              className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-full bg-indigo-600 dark:bg-indigo-400"
                  : "w-0 bg-indigo-500 group-hover:w-full"
              }`}
            />

            {/* Hover Background */}
            <span className="absolute inset-0 -z-10 rounded-lg bg-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-20 dark:bg-indigo-900/50 dark:group-hover:opacity-40" />
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLink;