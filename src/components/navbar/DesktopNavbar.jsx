import React from "react";
import NavbarLinks from "./NavbarLinks";
import AuthButtons from "./AuthButtons";
import ProfileMenu from "./ProfileMenu";

const DesktopNavbar = ({
  isAuthenticated,
  user,
  logout,
  cursorEnabled,
  toggleCursor,
}) => {
  return (
    <div className="hidden lg:flex items-center justify-between flex-1 gap-12">
      <NavbarLinks />

      <div className="flex items-center gap-3">
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