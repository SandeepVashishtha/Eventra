import { lazy, Suspense, useRef, useState, useEffect } from "react";

import { NavLink, useLocation } from "react-router-dom";

import { Moon, Sun, Search, ChevronDown, Plus, HelpCircle, X } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { NAV_ITEMS } from "./constants/navItems";

const KeyboardShortcutsModal = lazy(() =>
  import("../common/KeyboardShortcutsModal")
);

const NavbarLinks = ({ vertical = false, mobile = false, onClick, onLinkClick }) => {
  const location = useLocation();
  const navRef = useRef(null);

  const [openGroup, setOpenGroup] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleLinkClick = onClick ?? onLinkClick;

  const { isDarkMode } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (vertical || mobile) return undefined;

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
  }, [vertical, mobile]);

  const getNavLinkClasses = (active) => {
    return vertical
      ? `mobile-drawer-link flex min-h-[44px] justify-start gap-2 items-center text-sm font-medium transition-all duration-200 w-full py-2 px-3 border-l-2 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          active
            ? "text-black dark:text-white border-black dark:border-white font-semibold bg-gray-100 dark:bg-gray-800"
            : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`
      : `flex gap-1 items-center text-xs xl:text-sm font-medium transition-all duration-200 px-1.5 xl:px-2 py-2 border-b-2 rounded-t-md whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:rounded-lg ${
          active
            ? "text-black dark:text-white border-black dark:border-white font-semibold"
            : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        }`;
  };

  return (
    <nav
      ref={navRef}
      className={`flex ${
        vertical || mobile
          ? "flex-col items-stretch w-full gap-3"
          : "items-center gap-1.5 xl:gap-3 mx-1 xl:mx-3 min-w-0 flex-nowrap"
      }`}
      aria-label={vertical || mobile ? "Mobile primary links" : "Primary links"}
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
              className={`relative flex w-full flex-col shrink-0 ${
                vertical ? "items-stretch" : "items-center"
              }`}
            >
              <div className={`flex w-full items-center ${vertical ? "justify-between" : ""}`}>
                {vertical ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === item.name ? null : item.name
                      )
                    }
                    className={`${getNavLinkClasses(isSubItemActive)} w-full text-left justify-between`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={`navbar-links-menu-${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 opacity-80 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <NavLink
                    to={item.href}
                    onClick={handleLinkClick}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={`navbar-links-menu-${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className={({ isActive }) =>
                      getNavLinkClasses(isActive || isSubItemActive)
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                )}

                {!vertical && (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === item.name ? null : item.name
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
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
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                      isSubItemActive
                        ? "text-black dark:text-white"
                        : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 opacity-80 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
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
                    ? `${isOpen ? "block" : "hidden"} mt-3 w-full space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950`
                    : `${
                        isOpen
                          ? "block"
                          : "hidden group-hover/nav:block"
                      } absolute top-full left-0 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-3 min-w-55 z-50 border border-gray-100 dark:border-gray-700 mt-2 animate-in fade-in slide-in-from-top-1 duration-200`
                }
                role="menu"
                aria-label={`${item.name} submenu`}
              >
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.name}
                    to={sub.href}
                    onClick={handleLinkClick}
                    role="menuitem"
                    className={({ isActive }) =>
                      `mobile-drawer-link flex min-h-11 justify-start items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800 text-black dark:text-white font-semibold"
                          : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/70"
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

        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              getNavLinkClasses(isActive)
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        );
      })}

      <Suspense fallback={null}>
        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
          shortcuts={[
            {
              keys: ["Ctrl", "K"],
              action: "Open search",
              icon: Search,
            },
            {
              keys: ["Ctrl", "N"],
              action: "Create new event",
              icon: Plus,
            },
            {
              keys: ["T"],
              action: "Toggle theme",
              icon: isDarkMode ? Sun : Moon,
            },
            {
              keys: ["?"],
              action: "Show shortcuts",
              icon: HelpCircle,
            },
            {
              keys: ["Esc"],
              action: "Close modals",
              icon: X,
            },
          ]}
        />
      </Suspense>
    </nav>
  );
};

export default NavbarLinks;
