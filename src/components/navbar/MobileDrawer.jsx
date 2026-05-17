import NavbarLinks from './NavbarLinks';

const MobileDrawer = ({ isOpen, closeMenu }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed top-0 right-0 z-50 h-screen w-[85%] translate-x-0 bg-white shadow-xl transition-transform duration-300 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Eventra</h2>

        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        >
          Close
        </button>
      </div>

      <nav className="p-4" aria-label="Mobile">
        <NavbarLinks />
      </nav>
    </div>
  );
};

export default MobileDrawer;
