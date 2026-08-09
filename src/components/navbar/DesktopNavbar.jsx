import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-1 lg:px-2">
      <NavbarLinks />
    </div>
  );
};

export default DesktopNavbar;
