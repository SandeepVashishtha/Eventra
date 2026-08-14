import React from "react";
import { Mic, MicOff, UserMinus } from "lucide-react";

export default function StreamParticipantRow({ participant, onMute, onKick }) {
  return (
    <div className="participant-row flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-xl">
      <div>
        <h4 className="text-xs font-bold leading-tight">{participant.name}</h4>
        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{participant.role}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onMute}
          className={`p-1.5 rounded transition-colors ${
            participant.isMuted ? "bg-red-500/20 text-red-400" : "hover:bg-slate-800 text-slate-400"
          }`}
        >
          {participant.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onKick}
          className="p-1.5 hover:bg-red-950/40 text-slate-400 hover:text-red-500 rounded transition-colors"
        >
          <UserMinus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
