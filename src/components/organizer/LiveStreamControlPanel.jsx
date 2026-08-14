import React, { useState } from "react";
import { Tv, Radio, Users, Settings } from "lucide-react";
import StreamParticipantRow from "./StreamParticipantRow";
import "./stream-control.css";

export default function LiveStreamControlPanel() {
  const [participants, setParticipants] = useState([
    { id: 1, name: "Dr. Mehta", role: "Presenter", isMuted: false, isVideoOff: false },
    { id: 2, name: "Priya Shah", role: "Co-Host", isMuted: true, isVideoOff: false }
  ]);

  const [streamActive, setStreamActive] = useState(false);

  const toggleMuteParticipant = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const kickParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="stream-control-panel p-6 bg-slate-900 text-white rounded-3xl shadow-xl max-w-xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Tv className="text-indigo-400 w-5 h-5" />
          Live Session Controller
        </h3>
        <button
          onClick={() => setStreamActive(!streamActive)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
            streamActive ? "bg-red-600 hover:bg-red-750 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          {streamActive ? "Go Offline" : "Go Live"}
        </button>
      </div>

      <div className="participants-stream-box mb-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Participants ({participants.length})</h4>
        <div className="flex flex-col gap-3">
          {participants.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs">No active presenters in the stream.</div>
          ) : (
            participants.map((p) => (
              <StreamParticipantRow
                key={p.id}
                participant={p}
                onMute={() => toggleMuteParticipant(p.id)}
                onKick={() => kickParticipant(p.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
