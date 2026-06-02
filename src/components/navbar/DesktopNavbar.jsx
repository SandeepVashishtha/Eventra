import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="hidden xl:flex items-center justify-start min-w-0 overflow-visible">
      <NavbarLinks />
    </div>
  );
};

export default DesktopNavbar;