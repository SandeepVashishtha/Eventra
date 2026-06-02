import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "./BrandMark";
import MobileNavLink from "./MobileNavLink";
import MobileNavGroup from "./MobileNavGroup";
import MobileUserSection from "./MobileUserSection";
import AuthButtons from "./AuthButtons";
import ThemeToggleButton from "./ThemeToggleButton";
import CursorToggleButton from "./CursorToggleButton";

const NavList = ({ navItems, location, openDropdown, onToggleGroup, onLinkClick, isMobile }) => (
  <>
    {navItems.map((item) => {
      const isActive = item.href
        ? (item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href))
        : item.subItems?.some(s => location.pathname.startsWith(s.href));

      if (item.subItems) {
        return isMobile ? (
          <MobileNavGroup key={item.name} item={item} isActive={isActive} isOpen={openDropdown === item.name} onToggle={() => onToggleGroup(item.name)} closeAllMenus={onLinkClick} location={location} />
        ) : (
          null
        );
      }
      return isMobile ? (
        <MobileNavLink key={item.name} item={item} isActive={isActive} onClick={onLinkClick} />
      ) : (
        null
      );
    })}
  </>
);

const MobileDrawerHeader = ({ closeBtnRef, closeAllMenus }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800/50">
    <BrandMark compact />
    <button
      ref={closeBtnRef}
      onClick={closeAllMenus}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
    >
      <ChevronDown className="w-6 h-6 rotate-90" />
    </button>
  </div>
);

const MobileDrawerFooter = ({
  isAuthenticated,
  user,
  primaryLine,
  secondaryLine,
  closeAllMenus,
  location,
  handleLogoutClick,
  isDarkMode,
  toggleTheme,
  cursorEnabled,
  toggleCursor,
}) => (
  <div className="border-t border-gray-200 dark:border-zinc-800/50 bg-gray-50 dark:bg-zinc-900/50">
    <div className="p-4">
      {isAuthenticated() ? (
        <MobileUserSection
          user={user}
          primaryLine={primaryLine}
          secondaryLine={secondaryLine}
          closeAllMenus={closeAllMenus}
          location={location}
          handleLogoutClick={handleLogoutClick}
        />
      ) : (
        <AuthButtons isMobile={true} closeAllMenus={closeAllMenus} />
      )}
      <div className="flex gap-3 mt-4">
        <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} isMobile={true} />
        <CursorToggleButton
          cursorEnabled={cursorEnabled}
          toggleCursor={toggleCursor}
          isMobile={true}
        />
      </div>
    </div>
  </div>
);

const MobileDrawer = ({ isOpen, drawerRef, openDropdown, setOpenDropdown, closeAllMenus, handleTouchStart, handleTouchMove, handleTouchEnd, closeBtnRef, handleLogoutClick, primaryLine, secondaryLine, cursorEnabled, toggleCursor, navItems }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-drawer"
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-y-0 right-0 h-dvh overflow-y-auto w-[88vw] max-w-[20rem] sm:max-w-sm shadow-2xl z-[110] flex flex-col bg-white/95 backdrop-blur-xl dark:bg-slate-900/95"
          role="dialog"
          aria-modal="true"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <MobileDrawerHeader closeBtnRef={closeBtnRef} closeAllMenus={closeAllMenus} />

          <div className="flex-grow p-3.5 sm:p-4 space-y-2 overflow-y-auto">
            <NavList
              navItems={navItems}
              location={location}
              openDropdown={openDropdown}
              onToggleGroup={(name) => setOpenDropdown(openDropdown === name ? null : name)}
              onLinkClick={closeAllMenus}
              isMobile={true}
            />
          </div>

          <MobileDrawerFooter
            isAuthenticated={isAuthenticated}
            user={user}
            primaryLine={primaryLine}
            secondaryLine={secondaryLine}
            closeAllMenus={closeAllMenus}
            location={location}
            handleLogoutClick={handleLogoutClick}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            cursorEnabled={cursorEnabled}
            toggleCursor={toggleCursor}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
