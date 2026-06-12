import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="navbar-links-scroll hidden min-w-0 flex-1 items-center justify-center overflow-x-auto px-3 lg:flex xl:px-6">
      <NavbarLinks />
    </div>
  );
};

export default DesktopNavbar;
