import React, { useState } from "react";
import { Move, Compass } from "lucide-react";
import useLayoutTransition from "../../hooks/useLayoutTransition";

export default function VirtualVenueNavigator() {
  const [coordinates, setCoordinates] = useState({ x: 100, y: 150 });
  
  // Transition logic maps inputs stably avoiding dynamic reflow loops
  const transitionActive = useLayoutTransition(coordinates);

  const handleDrag = () => {
    setCoordinates({ x: Math.round(150 + Math.random() * 20), y: Math.round(200 + Math.random() * 20) });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Virtual Venue Map
        </span>
        <button
          onClick={handleDrag}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Move className="w-3.5 h-3.5" /> Navigate Gate
        </button>
      </div>

      {/* Render snapping elements avoiding fractional viewport offsets (#16506) */}
      <div className="relative h-48 bg-slate-900 rounded-3xl overflow-hidden border border-gray-150 dark:border-gray-800">
        <div
          className="absolute w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-[10px] text-white shadow-md transition-all duration-150"
          style={{
            transform: `translate3d(${Math.round(coordinates.x)}px, ${Math.round(coordinates.y)}px, 0)`
          }}
        >
          Pin
        </div>
      </div>
    </div>
  );
}
