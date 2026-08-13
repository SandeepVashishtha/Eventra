import React from "react";

export default function FaceMeshOverlay() {
  return (
    <div className="absolute inset-0 border-2 border-dashed border-indigo-500/60 rounded-3xl pointer-events-none flex items-center justify-center animate-pulse">
      {/* Target focus frame grids */}
      <div className="w-48 h-48 rounded-full border border-indigo-400/40 relative flex items-center justify-center">
        <div className="absolute w-4 h-0.5 bg-indigo-500 top-0 left-1/2 -translate-x-1/2" />
        <div className="absolute w-4 h-0.5 bg-indigo-500 bottom-0 left-1/2 -translate-x-1/2" />
        <div className="absolute h-4 w-0.5 bg-indigo-500 left-0 top-1/2 -translate-y-1/2" />
        <div className="absolute h-4 w-0.5 bg-indigo-500 right-0 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
