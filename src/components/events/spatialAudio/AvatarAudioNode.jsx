import React from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

export default function AvatarAudioNode({
  user = { id: "user-1", name: "Alex Rivera", x: 100, y: 120, isMuted: false },
  acousticCoefs = { gain: 1.0, pan: 0.0 },
  isListener = false,
}) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none group"
      style={{ left: `${user.x}px`, top: `${user.y}px` }}
    >
      {/* Avatar Face Card */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform hover:scale-115 ${
          isListener ? "bg-indigo-600 ring-4 ring-indigo-400/50" : "bg-emerald-600 ring-2 ring-emerald-400/30"
        }`}
      >
        {user.name[0]}
      </div>

      {/* Label and Audio Attenuation Overlay */}
      <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[10px] text-white flex flex-col items-center gap-0.5 opacity-90">
        <span className="font-semibold">{user.name} {isListener && "(You)"}</span>
        {!isListener && (
          <span className="text-[9px] text-indigo-300 font-mono">
            Vol: {Math.round(acousticCoefs.gain * 100)}% • Pan: {acousticCoefs.pan}
          </span>
        )}
      </div>

      {/* Mic Status Icon */}
      <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-800 border border-slate-700 text-white">
        {user.isMuted ? <MicOff className="w-2.5 h-2.5 text-rose-500" /> : <Mic className="w-2.5 h-2.5 text-emerald-500" />}
      </div>
    </div>
  );
}
