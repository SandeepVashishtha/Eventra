import NavbarLinks from "./NavbarLinks";
import LanguageToggle from '../../i18n/LanguageToggle';
const DesktopNavbar = () => {
  return (
  <div className="hidden lg:flex items-center justify-center flex-1 min-w-0">
    <NavbarLinks />
    <LanguageToggle />
  </div>
);
};

export default DesktopNavbar;