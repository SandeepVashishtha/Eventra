import React from "react";
import MobileDrawer from "./MobileDrawer";

const MobileNavbar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
      >
        ☰
      </button>

      <MobileDrawer
        isOpen={isOpen}
        closeMenu={() => setIsOpen(false)}
      />
    </>
  );
};

export default MobileNavbar;