import React, { useState } from "react";
import { Move, Volume2 } from "lucide-react";
import { calculateDistanceGain } from "../../../utils/audio/spatialAudioEngine";
import AvatarAudioNode from "./AvatarAudioNode";

export default function SpatialLoungeCanvas() {
  const [userPos, setUserPos] = useState({ x: 100, y: 100 });
  const [speakerPos] = useState({ x: 200, y: 150 });

  const gain = calculateDistanceGain(userPos.x, userPos.y, speakerPos.x, speakerPos.y);

  const moveUser = () => {
    setUserPos({ x: Math.round(100 + Math.random() * 150), y: Math.round(100 + Math.random() * 100) });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Spatial Lounge Audio Channels
        </span>
        <button
          onClick={moveUser}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm animate-fade-in"
        >
          <Move className="w-3.5 h-3.5" /> Move Avatar Coordinates
        </button>
      </div>

      <div className="relative h-48 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Render interactive coordinate nodes */}
        <AvatarAudioNode label="Speaker" x={speakerPos.x} y={speakerPos.y} />
        <AvatarAudioNode label="Me" x={userPos.x} y={userPos.y} highlight />

        <div className="absolute bottom-3 left-3 font-mono text-[9px] text-gray-400">
          Computed Attenuation gain level: {(gain * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
