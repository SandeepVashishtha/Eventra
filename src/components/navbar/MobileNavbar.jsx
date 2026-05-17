import MobileDrawer from './MobileDrawer';

const MobileNavbar = ({ isOpen, setIsOpen }) => (
  <>
    <button
      type="button"
      className="rounded-lg p-2 text-2xl leading-none text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 lg:hidden"
      onClick={() => setIsOpen(true)}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-drawer"
    >
      <span aria-hidden="true">☰</span>
    </button>

    <MobileDrawer
      isOpen={isOpen}
      closeMenu={() => setIsOpen(false)}
    />
  </>
);

export default MobileNavbar;
