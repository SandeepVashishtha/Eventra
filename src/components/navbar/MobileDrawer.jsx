import React from "react";
import NavbarLinks from "./NavbarLinks";

const MobileDrawer = ({ isOpen, closeMenu }) => {
  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={closeMenu}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 z-[101] lg:hidden transition-transform duration-300 shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b dark:border-gray-800">
          <h2 className="text-2xl font-bold text-black dark:text-white">Eventra</h2>

          <button 
            onClick={closeMenu}
            className="p-2 -mr-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <NavbarLinks isMobile={true} closeMenu={closeMenu} />
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;