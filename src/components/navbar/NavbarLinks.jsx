import { useRef, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "./constants/navItems";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();
  const navRef = useRef(null);
  const [openGroup, setOpenGroup] = useState(null);

  // Auto-close menu overlays when navigation completes
  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  // Click outside to close drawer panels
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
      : `flex gap-2 items-center text-[13px] xl:text-sm font-medium uppercase tracking-[0.02em] transition-all duration-200 px-3 xl:px-4 py-2.5 border-b-2 rounded-t-md whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:rounded-lg ${
          active
            ? "text-text border-primary font-semibold"
            : "text-text-light hover:text-text border-transparent hover:border-border"
        }`;
  };

  return (
    <nav
      ref={navRef}
      className={`flex ${
        vertical
          ? "flex-col items-start w-full gap-2"
          : "items-center gap-3 xl:gap-5 mx-4 xl:mx-6 flex-nowrap"
      }`}
      aria-label={vertical ? "Mobile primary links" : "Primary links"}
    >
      {NAV_ITEMS.map((item) => {
        const hasDropdown = item.subItems && Array.isArray(item.subItems) && item.subItems.length > 0;
        const isOpen = openGroup === item.name;

        if (hasDropdown) {
          const isMoreDropdown = item.name.toLowerCase() === "more";

          // Submenu highlight validation check
          const isSubItemActive = item.subItems.some((sub) => location.pathname === sub.href);
          const isParentActive = location.pathname === item.href;
          const isGroupActive = isParentActive || isSubItemActive;

          return (
            <div
              key={item.name}
              className={`relative flex items-center shrink-0 ${
                vertical ? "w-full flex-col items-start" : "flex-none"
              }`}
              style={{ zIndex: isOpen ? "auto" : "auto" }}
            >
              <div className="flex items-center w-full">
                {isMoreDropdown ? (
                  /* BUCKET 1: Pure Dropdown ("More") -> Strict Button component wrapper */
                  <button
                    type="button"
                    onClick={() => setOpenGroup((curr) => (curr === item.name ? null : item.name))}
                    className={getNavLinkClasses(isGroupActive)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {!vertical && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-80 transition-transform duration-200 ml-1 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  /* BUCKET 2: Hybrid Link + Dropdown ("Community") */
                  <div className="flex items-center">
                    {/* Plain Link text element that handles routing instantly */}
                    <Link
                      to={item.href}
                      onClick={() => {
                        if (onClick) onClick();
                      }}
                      className={getNavLinkClasses(isGroupActive)}
                    >
                      <div className="flex items-center gap-1.5">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    </Link>

                    {/* Isolated inline button handler that exclusively triggers dropdown toggle */}
                    {!vertical && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenGroup((curr) => (curr === item.name ? null : item.name));
                        }}
                        className="ml-0.5 p-1 rounded-md text-text-light hover:text-text hover:bg-slate-100/60 transition-colors"
                        aria-label={`Open ${item.name} menu options`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 opacity-75 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Shared overlay container drop-down */}
              <div
                id={`navbar-links-menu-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={
                  vertical
                    ? `${
                        isOpen ? "block" : "hidden"
                      } mt-2 w-full space-y-1.5 rounded-lg bg-bg p-2`
                    : `${
                        isOpen ? "block" : "hidden"
                      } absolute top-full left-0 bg-white shadow-lg rounded-lg p-3 min-w-[240px] z-50 border border-slate-100 mt-2`
                }
              >
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.name}
                    to={sub.href}
                    onClick={() => {
                      setOpenGroup(null);
                      if (onClick) onClick();
                    }}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-text-light hover:text-text hover:bg-slate-100/80"
                      }`
                    }
                  >
                    {sub.icon}
                    <span>{sub.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        /* BUCKET 3: Standard single routes (Home, Events, Hackathons, Projects, Saved) */
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClick}
            className={({ isActive }) => getNavLinkClasses(isActive)}
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
