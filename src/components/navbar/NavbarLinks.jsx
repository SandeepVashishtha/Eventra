import { lazy, Suspense, useRef, useState, useEffect } from "react";

import { NavLink, useLocation } from "react-router-dom";

import { Moon, Sun, Search, ChevronDown, Plus, HelpCircle, X } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { NAV_ITEMS } from "./constants/navItems";

const KeyboardShortcutsModal = lazy(() =>
  import("../common/KeyboardShortcutsModal")
);

const NavbarLinks = ({ vertical = false, onClick }) => {
  const location = useLocation();
  const navRef = useRef(null);

  const [openGroup, setOpenGroup] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { isDarkMode } = useTheme();

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

  const getNavLinkClasses = (active) => {
    return vertical
      ? `mobile-drawer-link flex min-h-[44px] gap-2 items-center text-sm font-medium transition-all duration-200 w-full py-2 px-3 border-l-2 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
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
        vertical
          ? "flex-col items-start w-full gap-2"
          : "items-center gap-1.5 xl:gap-3 mx-1 xl:mx-3 min-w-0 flex-nowrap"
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
              }`}
            >
              <div className="flex w-full items-center">
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
                    getNavLinkClasses(isActive || isSubItemActive)
                  }
                >
                  {item.icon}
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
                    className={`ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                      isSubItemActive
                        ? "text-black dark:text-white"
                        : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 opacity-70 transition-transform duration-200 ${
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
                    ? "mt-1 block w-full space-y-1 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/60"
                    : `${
                        isOpen
                          ? "block"
                          : "hidden group-hover/nav:block"
                      } absolute top-full left-0 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 min-w-55 z-50 border border-gray-100 dark:border-gray-700 mt-1 animate-in fade-in slide-in-from-top-1 duration-200`
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
                      `mobile-drawer-link flex min-h-11 items-center gap-2 rounded-md p-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:rounded-lg ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-semibold"
                          : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
            onClick={onClick}
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
