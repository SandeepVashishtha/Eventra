import React from "react";
import NavbarLinks from "./NavbarLinks";
import ThemeToggle from "./ThemeToggle";
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
    <div className="hidden lg:flex flex-1 items-center">
      <div className="flex flex-1 justify-center min-w-0 px-8">
        <NavbarLinks />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <ThemeToggle
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <CursorToggle
          cursorEnabled={cursorEnabled}
          toggleCursor={toggleCursor}
        />

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