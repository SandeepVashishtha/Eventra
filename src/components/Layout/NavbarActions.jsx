import React from 'react';
import ThemeToggleButton from "../common/ThemeToggleButton";
import { MousePointer } from "lucide-react";

const NavbarActions = ({ cursorEnabled, toggleCursor, className = "" }) => {
  return (
    <>
      <ThemeToggleButton className={className} />
      <button
        onClick={toggleCursor}
        className={`flex items-center gap-1 px-2 py-1 ${className}
        text-s font-normal
        bg-black text-white
        rounded-md
        hover:bg-zinc-800
        transition-all`}
      >
        <MousePointer className="w-4 h-4" />
        {cursorEnabled ? "OFF" : "ON"}
      </button>
    </>
  );
};

export default NavbarActions;
