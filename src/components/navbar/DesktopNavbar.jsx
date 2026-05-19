import React from "react";
import { Moon, Sun } from "lucide-react";
import NavbarLinks from "./NavbarLinks";
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
    <div className="hidden lg:flex items-center justify-between flex-1 gap-2">
      <NavbarLinks />

      <div className="flex items-center gap-4 mr-5">
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
