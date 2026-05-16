import React from "react";
import { Link } from "react-router-dom";
import { MousePointer } from "lucide-react";
import { DesktopNavLinks } from "./NavLinks";
import ProfileDropdown from "./ProfileDropdown";

const DesktopNav = ({
  navItems,
  location,
  openDropdown,
  setOpenDropdown,
  cursorEnabled,
  toggleCursor,
  user,
  isAuthenticated,
  showProfileDropdown,
  setShowProfileDropdown,
  primaryLine,
  secondaryLine,
  handleLogoutClick,
}) => {
  return (
    <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
      {/* Logo on the left */}
      <Link to="/" className="flex-shrink-0 z-20">
        <h2
          className="text-3xl font-semibold tracking-tight text-black dark:text-white"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Eventra
        </h2>
      </Link>

      {/* Centered nav links */}
      <div className="hidden lg:flex absolute left-[48%] transform -translate-x-1/2 space-x-5 z-10">
        <DesktopNavLinks
          navItems={navItems}
          location={location}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />
      </div>

      {/* Right Group: Auth Controls and Mobile Toggle */}
      <div className="hidden lg:flex items-center ml-auto z-20">
        {/* Cursor Toggle Button */}
        <button
          onClick={toggleCursor}
          className="flex items-center gap-1 px-2 py-1 mr-3
          text-s font-normal
          bg-black text-white
          rounded-md
          hover:bg-zinc-800
          transition-all"
        >
          <MousePointer className="w-4 h-4" />
          {cursorEnabled ? "OFF" : "ON"}
        </button>

        <div className="flex items-center space-x-2 ml-2">
          <ProfileDropdown
            user={user}
            isAuthenticated={isAuthenticated}
            showProfileDropdown={showProfileDropdown}
            setShowProfileDropdown={setShowProfileDropdown}
            location={location}
            primaryLine={primaryLine}
            secondaryLine={secondaryLine}
            handleLogoutClick={handleLogoutClick}
          />
        </div>
      </div>

      {/* Mobile hamburger — rendered here but handled by MobileNav */}
      <div className="lg:hidden ml-auto" id="mobile-toggle-slot" />
    </div>
  );
};

export default DesktopNav;