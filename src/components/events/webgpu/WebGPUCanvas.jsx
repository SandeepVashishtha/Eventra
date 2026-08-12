import React, { useState } from "react";
import { Sparkles, Maximize2, Camera, Download, Layers } from "lucide-react";
import SpatialStageScene from "./SpatialStageScene";

const SPONSOR_BOOTHS = [
  { id: "b-1", name: "Vercel Innovation Hub", logo: "⚡", tier: "Platinum", description: "Deploy full-stack React & Next.js applications instantly to the edge network." },
  { id: "b-2", name: "Supabase Developer Zone", logo: "⚡", tier: "Platinum", description: "Open source Firebase alternative with real-time Postgres subscriptions." },
  { id: "b-3", name: "GitHub Open Source Lounge", logo: "🐙", tier: "Gold", description: "Collaborate, build, and ship code with 100M+ global developers." },
];

export default function WebGPUCanvas() {
  const [selectedBooth, setSelectedBooth] = useState(SPONSOR_BOOTHS[0]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 3D WebGPU Canvas Scene */}
      <SpatialStageScene onSelectBooth={(booth) => setSelectedBooth(booth)} />

      {/* Sponsor Booth Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SPONSOR_BOOTHS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSelectedBooth(b)}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              selectedBooth?.id === b.id
                ? "bg-indigo-600/10 border-indigo-500 shadow-md"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="text-base">{b.logo}</span> {b.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {b.tier}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {b.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
