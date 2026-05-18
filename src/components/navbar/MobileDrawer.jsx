import React from "react";
import NavbarLinks from "./NavbarLinks";

const MobileDrawer = ({ isOpen, closeMenu }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[85%] bg-white dark:bg-gray-900 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-2xl font-bold">Eventra</h2>

        <button onClick={closeMenu}>X</button>
      </div>

      <div className="p-4">
        <NavbarLinks vertical={true} onClick={closeMenu} />
      </div>
    </div>
  );
};

export default MobileDrawer;