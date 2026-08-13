import React, { useState } from "react";
import { Move, Grid, CheckSquare } from "lucide-react";
import { validateBoothOverlap } from "../../../utils/layout/hallEditor";
import BoothPropertiesModal from "./BoothPropertiesModal";

export default function ExhibitionHallDesigner() {
  const [booths, setBooths] = useState([
    { id: "1", x: 50, y: 50, w: 100, h: 100, sponsor: "Google Cloud" }
  ]);
  const [selectedBooth, setSelectedBooth] = useState(null);

  const addNewBooth = () => {
    const candidate = { id: Date.now().toString(), x: 200, y: 100, w: 100, h: 100, sponsor: "New Sponsor" };
    const hasOverlap = validateBoothOverlap(candidate, booths);
    if (!hasOverlap) {
      setBooths([...booths, candidate]);
    } else {
      alert("Exhibition space overlap detected! Cannot place booth here.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">3D Venue Map Exhibition Editor</span>
        </div>
        <button
          onClick={addNewBooth}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Move className="w-3.5 h-3.5" /> Place Sponsor Booth
        </button>
      </div>

      <div className="relative h-64 rounded-3xl bg-slate-950 border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
        {/* Render 3D transformed perspective grid simulation */}
        <div
          className="w-[80%] h-[80%] border border-dashed border-white/10 rounded-2xl relative"
          style={{ transform: "perspective(500px) rotateX(20deg)" }}
        >
          {booths.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBooth(b)}
              className="absolute bg-indigo-600/80 hover:bg-indigo-700 border border-indigo-400 text-white p-2 rounded-xl flex items-center justify-center font-bold font-sans cursor-pointer text-center"
              style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
            >
              {b.sponsor}
            </div>
          ))}
        </div>
      </div>

      {selectedBooth && (
        <BoothPropertiesModal booth={selectedBooth} onClose={() => setSelectedBooth(null)} />
      )}
    </div>
  );
}
