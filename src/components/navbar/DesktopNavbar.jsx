import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="flex items-center justify-center gap-x-8 lg:gap-x-10 shrink-0 whitespace-nowrap">
      <NavbarLinks />
    </div>
  );
};

export default DesktopNavbar;
