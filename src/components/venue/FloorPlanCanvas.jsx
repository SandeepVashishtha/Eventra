import React from "react";
import { scaleSvgCoordinates } from "../../utils/layout/svgScaler";

export default function FloorPlanCanvas({ seats = [{ id: "A1", x: 100, y: 150 }] }) {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4 select-none">
      <h3 className="font-bold">Normalizing Responsive Venue Seats</h3>
      
      {/* Set explicit standard viewBox values to prevent aspect layout drift distortions (#16542) */}
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto bg-slate-950 border border-slate-800 rounded-3xl"
      >
        {seats.map((seat) => {
          const scaled = scaleSvgCoordinates(seat.x, seat.y, 800, 800, viewBoxWidth, viewBoxHeight);
          return (
            <circle
              key={seat.id}
              cx={scaled.x}
              cy={scaled.y}
              r={15}
              className="fill-indigo-500 stroke-white stroke-2 cursor-pointer hover:fill-indigo-400"
            />
          );
        })}
      </svg>
    </div>
  );
}
