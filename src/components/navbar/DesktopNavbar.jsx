import NavbarLinks from "./NavbarLinks";
import AuthButtons from "./AuthButtons";
import ProfileMenu from "./ProfileMenu";

const DesktopNavbar = ({
  isAuthenticated,
  user,
  logout,
}) => {
  return (
    <div className="hidden xl:flex items-center justify-between flex-1 min-w-0 gap-2">
      <NavbarLinks />

      <div className="flex items-center gap-3 xl:gap-4 mr-2 xl:mr-5 shrink-0">
        {isAuthenticated ? (
          <ProfileMenu user={user} logout={logout} />
        ) : (
          <AuthButtons />
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;