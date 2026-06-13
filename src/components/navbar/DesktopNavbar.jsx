import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="hidden lg:flex items-center flex-1 min-w-0 overflow-x-auto navbar-links-scroll">
      <div className="mx-auto px-4">
        <NavbarLinks />
      </div>
    </div>
  );
};

export default DesktopNavbar;
