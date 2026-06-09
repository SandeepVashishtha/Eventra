import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 overflow-x-auto navbar-links-scroll px-3 xl:px-6">
      <NavbarLinks />
    </div>
  );
};

export default DesktopNavbar;
