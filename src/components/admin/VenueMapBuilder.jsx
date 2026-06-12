import React, { useState } from "react";

const VenueMapBuilder = () => {
  const [elements, setElements] = useState([]);

  const addTable = () => {
    setElements([
      ...elements,
      {
        id: Date.now(),
        type: "round-table",
        label: "New Table",
        x: 100,
        y: 100,
        width: 120,
        height: 120,
        seatsCount: 6,
      },
    ]);
  };

  const saveLayout = () => {
    localStorage.setItem("eventra_floorplan_default", JSON.stringify(elements));
    alert("Layout saved successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 text-white">
      <h2 className="mb-4 text-2xl font-bold">Interactive Venue Map Builder (Preview)</h2>
      <div className="mb-4 flex gap-4">
        <button onClick={addTable} className="rounded bg-blue-600 px-4 py-2">
          Add Round Table
        </button>
        <button onClick={saveLayout} className="rounded bg-green-600 px-4 py-2">
          Save Layout
        </button>
      </div>
      <div className="relative h-[600px] w-full overflow-hidden border border-slate-700 bg-slate-800">
        {elements.map((el) => (
          <div
            key={el.id}
            className="absolute flex cursor-move items-center justify-center rounded-full bg-blue-500"
            style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
          >
            {el.label}
          </div>
        ))}
      </div>
      <p className="mt-4 text-slate-400">
        Drag and drop functionality will be implemented in the next iteration.
      </p>
    </div>
  );
};

export default VenueMapBuilder;
