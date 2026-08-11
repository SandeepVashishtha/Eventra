import React, { useState } from "react";

export default function InteractiveSVGCanvas({
  layout = null,
  warnings = [],
  onTableMove = () => {},
}) {
  const [draggedTable, setDraggedTable] = useState(null);

  if (!layout) return null;

  const { canvasDimensions, tables = [], exits = [] } = layout;

  return (
    <div className="w-full h-full overflow-auto bg-slate-950 rounded-xl border border-gray-800 p-4 flex items-center justify-center">
      <svg
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="bg-slate-900 border border-slate-800 rounded-lg shadow-inner select-none"
      >
        {/* Grid Lines */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Emergency Exit Indicators */}
        {exits.map((exit) => (
          <g key={exit.id} transform={`translate(${exit.x}, ${exit.y})`}>
            <circle r="16" fill="#ef4444" opacity="0.2" />
            <circle r="8" fill="#ef4444" />
            <text y="-22" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">
              {exit.name}
            </text>
          </g>
        ))}

        {/* Render Tables & Seats */}
        {tables.map((table) => {
          const isWarned = warnings.some((w) => w.tableId === table.id);

          return (
            <g
              key={table.id}
              transform={`translate(${table.x}, ${table.y})`}
              className="cursor-move"
            >
              {table.shape === "round" ? (
                <circle
                  cx={table.width / 2}
                  cy={table.height / 2}
                  r={table.width / 2}
                  fill={isWarned ? "#991b1b" : "#312e81"}
                  stroke={isWarned ? "#f87171" : "#6366f1"}
                  strokeWidth="2"
                />
              ) : (
                <rect
                  width={table.width}
                  height={table.height}
                  rx="6"
                  fill={isWarned ? "#991b1b" : "#312e81"}
                  stroke={isWarned ? "#f87171" : "#6366f1"}
                  strokeWidth="2"
                />
              )}
              <text
                x={table.width / 2}
                y={table.height / 2 + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
              >
                T{table.id} ({table.seats}s)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
