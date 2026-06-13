import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useState, useEffect } from "react";

const ROUTE_LABELS = {
  explore: "Explore Events",
  events: "Events",
  register: "Registration",
  "saved-events": "Saved Events",
  "event-recommendation": "Recommended Events",
  dashboard: "Dashboard",
  admin: "Administration",
  profile: "Profile",
  settings: "Settings",
  feedback: "Feedback",
  faq: "FAQ",
  about: "About",
  contact: "Contact",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  notifications: "Notifications",
  leaderboard: "Leaderboard",
  calendar: "Calendar",
  hackathons: "Hackathons",
  projects: "Projects",
  sponsors: "Sponsors",
  networking: "Networking Hub",
  login: "Login",
  signup: "Sign Up",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const [eventNames, setEventNames] = useState({});
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (location.pathname === "/" || location.pathname === "/home") return null;

  useEffect(() => {
    const idSegments = pathnames.filter(
      (segment) => !ROUTE_LABELS[segment] && /^[a-f0-9]{24}$/i.test(segment)
    );
    if (idSegments.length === 0) return;
    const fetchNames = async () => {
      const names = {};
      for (const id of idSegments) {
        try {
          const res = await fetch(`/api/events/${id}`);
          if (res.ok) {
            const data = await res.json();
            names[id] = data.title || id;
          } else {
            names[id] = "Event";
          }
        } catch {
          names[id] = "Event";
        }
      }
      setEventNames((prev) => ({ ...prev, ...names }));
    };
    fetchNames();
  }, [location.pathname, pathnames]);

  const getLabel = (segment) => {
    if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
    if (eventNames[segment]) return eventNames[segment];
    if (/^[a-f0-9]{24}$/i.test(segment)) return "Loading...";
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  return (
    <nav className="flex px-4 py-4 max-w-7xl mx-auto w-full overflow-x-auto" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
        <li className="flex items-center">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center transition-colors">
            <Home size={16} className="mr-1" />
            Home
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const label = getLabel(value);

          return (
            <li key={to} className="flex items-center">
              <ChevronRight size={14} className="mx-2 text-gray-400" />
              {last ? (
                <span className="text-gray-900 dark:text-white font-bold" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={to} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {label}
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
