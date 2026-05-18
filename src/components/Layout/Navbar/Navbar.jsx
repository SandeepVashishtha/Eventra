import React from "react";
import { Link } from "react-router-dom";
import { MousePointer, Sun, Moon } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import ConfirmationModal from "../../common/ConfirmationModal";
import useNavbarState from "./hooks/useNavbarState";
import { navItems } from "./constants";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";
import ProfileDropdown from "./ProfileDropdown";
import { DesktopNavLinks } from "./NavLinks";
const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showProfileDropdown,
    setShowProfileDropdown,
    openDropdown,
    setOpenDropdown,
    showLogoutModal,
    navHeight,
    drawerRef,
    closeBtnRef,
    toggleBtnRef,
    navRef,
    user,
    isAuthenticated,
    primaryLine,
    secondaryLine,
    location,
    closeAllMenus,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
  } = useNavbarState();

  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <>
      {/* Backdrop overlay */}
        <div
  role="button"
  tabIndex={0}
  aria-label="Close navigation menu"
  className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
    isMobileMenuOpen ||
    showProfileDropdown ||
    openDropdown ||
    showLogoutModal
      ? "opacity-100"
      : "opacity-0 pointer-events-none"
  }`}
  onClick={closeAllMenus}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      closeAllMenus();
    }
  }}
/>
      {/* Main navbar */}
      <nav
      aria-label="Main Navigation"
        ref={navRef}
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
        className="fixed top-0 left-0 w-full z-40 shadow-sm
        bg-white dark:bg-gray-900 border-b border-black/10 dark:border-white/10"
      >
        <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
          {/* Logo */}
          <Link
  to="/"
  className="flex-shrink-0 z-20"
  aria-label="Go to homepage"
>
            <h2
              className="text-3xl font-semibold tracking-tight text-black dark:text-white"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Eventra
            </h2>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex absolute left-[48%] transform -translate-x-1/2 space-x-5 z-10">
            <DesktopNavLinks
              navItems={navItems}
              location={location}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          </div>

          {/* Desktop right controls */}
          <div className="hidden lg:flex items-center ml-auto z-20">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cursor toggle */}
              <button
  onClick={toggleCursor}
  aria-pressed={cursorEnabled}
  aria-label={
    cursorEnabled
      ? "Disable custom cursor"
      : "Enable custom cursor"
  }
              className="flex items-center gap-1 px-2 py-1 mr-3
              text-s font-normal
              bg-black text-white
              rounded-md
              hover:bg-zinc-800
              transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

          {/* Mobile top navbar */}
          <MobileNav
            toggleBtnRef={toggleBtnRef}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
      </nav>

      {/* Mobile drawer */}
      <MobileDrawer
        drawerRef={drawerRef}
        isMobileMenuOpen={isMobileMenuOpen}
        closeBtnRef={closeBtnRef}
        navItems={navItems}
        location={location}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        closeAllMenus={closeAllMenus}
        user={user}
        isAuthenticated={isAuthenticated}
        primaryLine={primaryLine}
        secondaryLine={secondaryLine}
        handleLogoutClick={handleLogoutClick}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        cursorEnabled={cursorEnabled}
        toggleCursor={toggleCursor}
      />

      {/* Logout confirmation modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />

      {/* Spacer */}
      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;