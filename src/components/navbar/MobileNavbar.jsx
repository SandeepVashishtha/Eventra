import React from "react";
import StaggeredMenu from "./StaggeredMenu";
import { NAV_ITEMS } from "./constants/navItems";
import AuthButtons from "./AuthButtons";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const MobileNavbar = ({ isOpen, setIsOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = NAV_ITEMS.map(item => ({
    label: item.name,
    link: item.href,
    ariaLabel: `Navigate to ${item.name}`
  }));

  const socialItems = [
    { label: "Github", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
    { label: "Discord", link: "https://discord.com" }
  ];

  return (
    <div className="lg:hidden flex items-center">
      <StaggeredMenu 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        items={menuItems}
        socialItems={socialItems}
        colors={['#3b82f6', '#1d4ed8', isDarkMode ? '#111827' : '#ffffff']}
        accentColor="#3b82f6"
        menuButtonColor="currentColor"
        openMenuButtonColor={isDarkMode ? "#ffffff" : "#111827"}
        displayItemNumbering={false}
      >
        <div className="flex flex-col gap-8 mt-4">
          <div className="sm-auth-container flex items-center justify-between gap-6 px-2">
            <AuthButtons 
              isAuthenticated={isAuthenticated()} 
              user={user} 
              logout={() => {
                logout();
                setIsOpen(false);
              }} 
            />
            <div className="flex-shrink-0 ml-auto">
              <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      </StaggeredMenu>
    </div>
  );
};

export default MobileNavbar;