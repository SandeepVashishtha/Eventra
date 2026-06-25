import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import { NAV_ITEMS } from "./constants/navItems";
import { prefetchRoute } from "../../utils/routePrefetch";

const NavbarLinks = ({ vertical = false, onClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (vertical) return;

    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [vertical]);

  const handlePrefetch = (href) => {
    const routes = {
      "/": "home",
      "/events": "events",
      "/hackathons": "hackathons",
      "/projects": "projects",
      "/profile": "profile",
      "/dashboard": "dashboard",
    };

    if (routes[href]) {
      prefetchRoute(routes[href]);
    }
  };

  const handleClick = (href, e) => {
    try {
      if (href === "/events") {
        sessionStorage.removeItem("eventra:event-filters:v1");
      }
      if (href === "/hackathons") {
        sessionStorage.removeItem("eventra:hackathon-filters:v1");
      }
    } catch {
      // ignore
    }
    onClick?.(e);
  };

  const navLinkClasses = (isActive) =>
    vertical
      ? `
        flex items-center gap-2
        w-full px-3 py-2.5
        rounded-lg
        text-sm font-medium
        transition-all duration-200
        ${
          isActive
            ? "bg-bg-secondary text-primary font-semibold border-l-4 border-primary font-semibold"
            : "text-text-secondary hover:bg-bg hover:text-primary"
        }
      `
      : `
        flex items-center gap-1.5
        whitespace-nowrap
        px-1 py-1
        text-[13px]
        font-medium
        uppercase
        tracking-[0.04em]
        border-b-2
        transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]
        ${
          isActive
            ? "border-primary text-text dark:text-white font-semibold font-semibold"
            : "text-text-secondary hover:text-text dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700"
        }
      `;

  return (
    <nav
      ref={navRef}
      aria-label={vertical ? t("nav.mobilePrimaryLinks") : t("nav.primaryLinks")}
      className={`flex ${vertical ? "flex-col w-full gap-1" : "items-center gap-8"}`}
    >
      {NAV_ITEMS.map((item) => {
        const isOpen = openMenu === item.nameKey;
        const hasChildren = item.subItems && item.subItems.length > 0;
        const menuId = `menu-${item.nameKey}`;

        if (hasChildren) {
          return (
            <div
              key={item.nameKey}
              className={`relative ${vertical ? "w-full" : "flex items-center"}`}
            >
              <div className="flex items-center">
                <NavLink
                  to={item.href}
                  onClick={(e) => handleClick(item.href, e)}
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  {vertical && item.icon}
                  <span>{t(item.nameKey)}</span>
                </NavLink>

                {!vertical && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    onClick={() => setOpenMenu(isOpen ? null : item.nameKey)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setOpenMenu(
                          isOpen
                            ? null
                            : item.nameKey
                        );
                      }
                    }}
                    className="ml-0.5 rounded p-1.5 hover:bg-bg-secondary transition-colors"
                    aria-label={`Toggle ${t(item.nameKey)} menu`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Dropdown / Submenu */}
              {(vertical || isOpen) && (
                <div
                  id={menuId}
                  className={
                    vertical
                      ? "mt-1 ml-6 space-y-1"
                      : "absolute left-0 top-full mt-3 w-56 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-2 shadow-lg z-50 animate-in fade-in zoom-in-95"
                  }
                >
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={sub.nameKey}
                      to={sub.href}
                      onClick={(e) => handleClick(sub.href, e)}
                      className={({ isActive }) =>
                        `
                          flex items-center gap-2
                          rounded-md
                          px-3 py-2
                          text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-bg-secondary text-indigo-600 dark:text-indigo-400 font-semibold"
                              : "text-text-secondary hover:bg-bg hover:text-indigo-600 dark:hover:text-indigo-400"
                          }
                        `
                      }
                    >
                      {sub.icon}
                      <span>{t(sub.nameKey)}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Simple top-level link
        return (
          <NavLink
            key={item.nameKey}
            to={item.href}
            onMouseEnter={() => handlePrefetch(item.href)}
            onClick={(e) => handleClick(item.href, e)}
            className={({ isActive }) => navLinkClasses(isActive)}
          >
            {item.icon}
            <span>{t(item.nameKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default NavbarLinks;
