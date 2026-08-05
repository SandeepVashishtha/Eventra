import NavbarLinks from "./NavbarLinks";

const DesktopNavbar = () => {
  return (
    <div className="flex min-w-max flex-1 items-center justify-center gap-x-4 px-2 lg:gap-x-6 lg:px-3 xl:gap-x-8 xl:px-4">
      <NavbarLinks />
    </div>
  );
};

export default DesktopNavbar;
