import { useRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "./constants/navItems";
import { prefetchRoute } from "../../utils/routePrefetch";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navRef = useRef(null);

  const [openGroup, setOpenGroup] = useState(null);

  const secondaryItemKeys = ["nav.saved", "nav.about", "nav.faq", "nav.contact"];

  const handleNavbarLinkClick = (href, e) => {
    if (href === "/events") {
      try {
        window.sessionStorage.removeItem("eventra:event-filters:v1");
      } catch {
        // Ignored
      }
    } else if (href === "/hackathons") {
      try {
        window.sessionStorage.removeItem("eventra:hackathon-filters:v1");
      } catch {
        // Ignored
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handlePrefetch = (href) => {
    if (href === "/events") prefetchRoute("events");
    if (href === "/dashboard") prefetchRoute("dashboard");
    if (href === "/hackathons") prefetchRoute("hackathons");
    if (href === "/projects") prefetchRoute("projects");
    if (href === "/profile" || href === "/dashboard/profile") prefetchRoute("profile");
    if (href === "/") prefetchRoute("home");
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

  const getNavLinkClasses = (active, isSecondary = false, isDropdown = false) => {
    return vertical
      ? `mobile-drawer-link flex min-h-[44px] gap-2 items-center text-sm font-medium transition-all duration-200 w-full py-2 px-3 border-l-2 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 ${
          active
            ? "text-text border-primary font-semibold bg-bg-secondary"
            : "text-slate-600 dark:text-slate-300 hover:text-text border-transparent hover:bg-bg"
        }`
      : `flex gap-1.5 items-center text-[12px] lg:text-[13px] font-normal uppercase tracking-[0.03em] transition-all duration-200 px-3 py-2 border-b-2 rounded-t-md whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:rounded-lg ${
          active
            ? "text-slate-900 dark:text-white border-primary"
            : isDropdown
              ? "text-slate-500 dark:text-slate-400 hover:text-text border-transparent hover:border-border"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border-transparent hover:border-border"
        }`;
  };

  return (
    <nav
      ref={navRef}
      className={`flex ${
        vertical
          ? "w-full flex-col items-start gap-2"
          : "min-w-max flex-nowrap items-center justify-start gap-2 overflow-visible"
      }`}
      aria-label={vertical ? t("nav.mobilePrimaryLinks") : t("nav.primaryLinks")}
    >
      {NAV_ITEMS.map((item) => {
        const itemLabel = t(item.nameKey);
        const isSubItemActive = item.subItems?.some((sub) => location.pathname === sub.href);
        const isOpen = openGroup === item.nameKey;
        const menuId = `navbar-links-menu-${item.nameKey.replace(/\./g, "-")}`;

        if (item.subItems) {
          return (
            <div
              key={item.nameKey}
              className={`group/nav relative flex items-center ${
                vertical ? "w-full flex-col items-start" : "flex-none"
              } ${!vertical && secondaryItemKeys.includes(item.nameKey) ? "hidden lg:flex" : ""}`}
            >
              <div
                className={`flex w-full items-center gap-0.5 ${vertical ? "" : "justify-center"}`}
              >
                <NavLink
                  to={item.href}
                  onClick={(e) => handleNavbarLinkClick(item.href, e)}
                  aria-haspopup={!vertical ? "menu" : undefined}
                  aria-expanded={!vertical ? isOpen : undefined}
                  aria-controls={!vertical ? menuId : undefined}
                  className={({ isActive }) =>
                    getNavLinkClasses(
                      isActive || isSubItemActive,
                      secondaryItemKeys.includes(item.nameKey),
                      true
                    )
                  }
                >
                  {vertical ? item.icon : null}
                  <span>{itemLabel}</span>
                </NavLink>

                {!vertical && (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) => (current === item.nameKey ? null : item.nameKey))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setOpenGroup((current) => (current === item.nameKey ? null : item.nameKey));
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={menuId}
                    aria-label={
                      isOpen
                        ? t("nav.collapseSubmenu", { name: itemLabel })
                        : t("nav.expandSubmenu", { name: itemLabel })
                    }
                    className={`hover:bg-bg-secondary focus-visible:ring-primary ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                      isSubItemActive
                        ? "text-text"
                        : "hover:text-text text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : "group-hover/nav:rotate-180"
                      }`}
                    />
                  </button>
                )}
              </div>

              <div
                id={menuId}
                className={
                  vertical
                    ? "bg-bg mt-1 block w-full space-y-1 rounded-lg p-2"
                    : `${
                        isOpen ? "block" : "hidden group-hover/nav:block"
                      } bg-navbar shadow-premium-md border-border animate-in fade-in slide-in-from-top-1 absolute top-full left-0 z-50 mt-1 min-w-55 rounded-md border p-2 duration-200`
                }
                role={!vertical ? "menu" : undefined}
                aria-label={`${itemLabel} submenu`}
              >
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.nameKey}
                    to={sub.href}
                    onClick={(e) => handleNavbarLinkClick(sub.href, e)}
                    role={!vertical ? "menuitem" : undefined}
                    className={({ isActive }) =>
                      `mobile-drawer-link focus-visible:ring-primary focus-visible:ring-offset-bg flex min-h-11 items-center gap-2 rounded-lg p-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                        isActive
                          ? "bg-bg-secondary text-text font-semibold"
                          : "hover:text-text hover:bg-bg text-slate-600 dark:text-slate-300"
                      }`
                    }
                  >
                    <span className="flex-none text-current [&>svg]:h-4 [&>svg]:w-4">
                      {sub.icon}
                    </span>
                    <span>{t(sub.nameKey)}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        return (
          <NavLink
            key={item.nameKey}
            to={item.href}
            onClick={(e) => handleNavbarLinkClick(item.href, e)}
            onMouseEnter={() => handlePrefetch(item.href)}
            className={({ isActive }) =>
              `${!vertical ? "min-w-max flex-none" : ""} ${getNavLinkClasses(isActive, secondaryItemKeys.includes(item.nameKey))}`
            }
          >
            <span className="flex-none text-current [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
            <span>{itemLabel}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default NavbarLinks;
