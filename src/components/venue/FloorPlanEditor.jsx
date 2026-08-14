import React, { useState } from "react";
import { Plus, Trash2, Maximize, Grid } from "lucide-react";
import DragSeatItem from "./DragSeatItem";
import "./floor-plan.css";

export default function FloorPlanEditor({ onSave }) {
  const [seats, setSeats] = useState([
    { id: "A1", label: "A1", x: 100, y: 80 },
    { id: "A2", label: "A2", x: 180, y: 80 },
    { id: "B1", label: "B1", x: 100, y: 150 },
    { id: "B2", label: "B2", x: 180, y: 150 }
  ]);

  const addSeat = () => {
    const nextId = "S" + (seats.length + 1);
    setSeats((prev) => [...prev, { id: nextId, label: nextId, x: 250, y: 100 }]);
  };

  const removeSeat = (id) => {
    setSeats((prev) => prev.filter((s) => s.id !== id));
  };

  const updatePosition = (id, newX, newY) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s))
    );
  };

  return (
    <div className="floor-plan-editor p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Grid className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            Floor Plan Venue Designer
          </h2>
          <p className="text-xs text-slate-500 mt-1">Design your physical seat locations visually</p>
        </div>

        <button
          onClick={addSeat}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-650/15"
        >
          <Plus className="w-4 h-4" /> Add Seat
        </button>
      </div>

      <div className="canvas-grid-box relative bg-white dark:bg-slate-950 h-[400px] border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        <div className="absolute top-4 bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-400 px-3 py-1.5 rounded-full uppercase">
          Stage Direction / Front
        </div>

        <div className="seats-canvas w-full h-full relative">
          {seats.map((seat) => (
            <DragSeatItem
              key={seat.id}
              seat={seat}
              onDrag={updatePosition}
              onDelete={() => removeSeat(seat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
