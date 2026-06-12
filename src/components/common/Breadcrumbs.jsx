import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumbs Component
 *
 * Dynamically generates a navigation path based on the current URL.
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show on landing page
  if (location.pathname === "/" || location.pathname === "/home") return null;

  const breadcrumbNameMap = {
    explore: "Explore Events",
    events: "Events",
    register: "Registration",
    profile: "User Profile",
    settings: "Settings",
    dashboard: "Dashboard",
    admin: "Administration",
    networking: "Networking Hub",
    "saved-events": "Saved Events",
  };

  return (
    <nav
      className="mx-auto flex w-full max-w-7xl overflow-x-auto px-4 py-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Home size={16} className="mr-1" />
            Home
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const name =
            breadcrumbNameMap[value] ||
            value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

          // Skip IDs or long hashes
          if (value.length > 20 || /^[0-9a-fA-F-]+$/.test(value)) return null;

          return (
            <li key={to} className="flex items-center">
              <ChevronRight size={14} className="mx-2 text-gray-400" />
              {last ? (
                <span className="font-bold text-gray-900 dark:text-white" aria-current="page">
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
