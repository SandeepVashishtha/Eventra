import React from 'react';
import { MousePointer } from 'lucide-react';
import ThemeToggleButton from '../common/ThemeToggleButton';

const NavbarActions = ({ cursorEnabled, toggleCursor }) => {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggleButton className="mr-1" />
      <button
        onClick={toggleCursor}
        className="flex items-center gap-1 px-2 py-1
          text-s font-normal
          bg-black text-white
          rounded-md
          hover:bg-zinc-800
          transition-all"
      >
        <MousePointer className="w-4 h-4" />
        {cursorEnabled ? 'OFF' : 'ON'}
      </button>
    </div>
  );
};

export default NavbarActions;
