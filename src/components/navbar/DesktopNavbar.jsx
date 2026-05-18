import React from "react";
import { Moon, Sun } from "lucide-react";
import NavbarLinks from "./NavbarLinks";
import CursorToggle from "./CursorToggle";
import AuthButtons from "./AuthButtons";
import ProfileMenu from "./ProfileMenu";

const DesktopNavbar = ({
  isAuthenticated,
  user,
  logout,
  isDarkMode,
  toggleTheme,
  cursorEnabled,
  toggleCursor,
}) => {
  return (
    <div className="hidden lg:grid flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 min-w-0">
      <NavbarLinks />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card-bg text-text transition-all duration-300 hover:scale-105"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <CursorToggle
            cursorEnabled={cursorEnabled}
            toggleCursor={toggleCursor}
          />
        </div>

        {isAuthenticated ? (
          <ProfileMenu user={user} logout={logout} />
        ) : (
          <AuthButtons />
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;
