import { useRef, useState, useEffect} from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "./constants/navItems";
import { prefetchRoute } from "../../utils/prefetchUtils";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();
  const navRef = useRef(null);

  const [openGroup, setOpenGroup] = useState(null);

  const handlePrefetch = (href) => {
    if (href === "/events") prefetchRoute(() => import("../../Pages/Events/EventsPage"), "explore");
    if (href === "/saved-events") prefetchRoute(() => import("../../Pages/SavedEventsPage"), "saved");
  };


  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (vertical) return undefined;

    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenGroup(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [vertical]);

  const secondaryItemNames = ["Saved", "About", "FAQ", "Contact"];

  const getNavLinkClasses = (active, isSecondary = false) => {
    return vertical
      ? `mobile-drawer-link flex min-h-[44px] gap-2 items-center text-sm font-medium transition-all duration-200 w-full py-2 px-3 border-l-2 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 ${
          active
            ? "text-text border-primary font-semibold bg-bg-secondary"
            : "text-text-light hover:text-text border-transparent hover:bg-bg"
        }`
      : `flex gap-1.5 items-center text-[12px] xl:text-[13px] font-medium uppercase tracking-[0.03em] transition-all duration-200 px-1.5 py-2 border-b-2 rounded-t-md whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:rounded-lg ${
          active
            ? "text-text border-primary"
            : "text-text-light hover:text-text border-transparent hover:border-border"
        }`;
  };

  return (
    <nav
      ref={navRef}
      className={`flex ${
        vertical
          ? "flex-col items-start w-full gap-2"
          : "items-center gap-0.5 xl:gap-1 mx-0.5 xl:mx-1 min-w-0 flex-nowrap overflow-x-auto navbar-links-scroll"
      }`}
      aria-label={vertical ? "Mobile primary links" : "Primary links"}
    >
      {NAV_ITEMS.map((item) => {
        const isSubItemActive = item.subItems?.some(
          (sub) => location.pathname === sub.href
        );

        const isOpen = openGroup === item.name;

        if (item.subItems) {
          return (
            <div
              key={item.name}
              className={`relative group/nav flex items-center shrink-0 ${
                vertical ? "w-full flex-col items-start" : "flex-none"
              } ${!vertical && secondaryItemNames.includes(item.name) ? "hidden xl:flex" : ""}`}
            >
              <div className="flex w-full items-center gap-0.5">
                <NavLink
                  to={item.href}
                  onClick={onClick}
                  aria-haspopup={!vertical ? "menu" : undefined}
                  aria-expanded={!vertical ? isOpen : undefined}
                  aria-controls={
                    !vertical
                      ? `navbar-links-menu-${item.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      : undefined
                  }
                  className={({ isActive }) =>
                    getNavLinkClasses(
                      isActive || isSubItemActive,
                      secondaryItemNames.includes(item.name)
                    )
                  }
                >
                  {vertical ? item.icon : null}
                  <span>{item.name}</span>
                </NavLink>

                {!vertical && (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === item.name ? null : item.name
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();

                        setOpenGroup((current) =>
                          current === item.name ? null : item.name
                        );
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`navbar-links-menu-${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    aria-label={`${
                      isOpen ? "Collapse" : "Expand"
                    } ${item.name} submenu`}
                    className={`ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 ${
                      isSubItemActive
                        ? "text-text"
                        : "text-text-light hover:text-text"
                    }`}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180"
                          : "group-hover/nav:rotate-180"
                      }`}
                    />
                  </button>
                )}
              </div>

              <div
                id={`navbar-links-menu-${item.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className={
                  vertical
                    ? "mt-1 block w-full space-y-1 rounded-lg bg-bg p-2"
                    : `${
                        isOpen
                          ? "block"
                          : "hidden group-hover/nav:block"
                      } absolute top-full left-0 bg-navbar shadow-premium-md rounded-md p-2 min-w-55 z-50 border border-border mt-1 animate-in fade-in slide-in-from-top-1 duration-200`
                }
                role={!vertical ? "menu" : undefined}
                aria-label={`${item.name} submenu`}
              >
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.name}
                    to={sub.href}
                    onClick={onClick}
                    role={!vertical ? "menuitem" : undefined}
                    className={({ isActive }) =>
                      `mobile-drawer-link flex min-h-11 items-center gap-2 rounded-lg p-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        isActive
                          ? "bg-gray-50 dark:bg-gray-700/80 text-black dark:text-white font-semibold"
                          : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
                      }`
                    }
                  >
                    <span className="flex-none [&>svg]:w-4 [&>svg]:h-4 text-current">{sub.icon}</span>
                    <span>{sub.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClick}
            onMouseEnter={() => handlePrefetch(item.href)}
            className={({ isActive }) =>
              getNavLinkClasses(isActive, secondaryItemNames.includes(item.name))
            }
          >
            <span className="flex-none [&>svg]:w-4 [&>svg]:h-4 text-current">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </NavLink>
        );
      })}


    </nav>
  );
};

export default NavbarLinks;
