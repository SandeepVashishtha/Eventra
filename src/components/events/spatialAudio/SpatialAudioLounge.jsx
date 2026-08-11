import React, { useState, useEffect } from "react";
import { Headphones, ShieldCheck, MapPin, VolumeX, Volume2 } from "lucide-react";
import AvatarAudioNode from "./AvatarAudioNode";
import { SpatialAudioEngine } from "../../../utils/audio/spatialAudioEngine";

const INITIAL_USERS = [
  { id: "u-listener", name: "Alex Rivera", x: 150, y: 150, isMuted: false },
  { id: "u-speaker-1", name: "Sarah Chen", x: 80, y: 140, isMuted: false },
  { id: "u-speaker-2", name: "David Kim", x: 260, y: 180, isMuted: true },
];

export default function SpatialAudioLounge() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [engine] = useState(() => new SpatialAudioEngine("u-listener"));
  const [activeMute, setActiveMute] = useState(false);

  // Initialize engine positions
  useEffect(() => {
    users.forEach((u) => engine.updatePosition(u.id, u.x, u.y));
  }, [users, engine]);

  const handleLoungeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Update listener position
    setUsers((prev) =>
      prev.map((u) => (u.id === "u-listener" ? { ...u, x, y } : u))
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner Control Panel */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Real-Time WebRTC Spatial Audio Networking Lounge
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMute(!activeMute)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeMute
                ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600"
            }`}
          >
            {activeMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {activeMute ? "Mute All" : "Acoustic Audio Active"}
          </button>
        </div>
      </div>

      {/* Interactive 2D Venue Lounge Floor Plan */}
      <div className="relative w-full h-[320px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-white">
        {/* Walkable Grid Floor Layout */}
        <div
          onClick={handleLoungeClick}
          className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] cursor-pointer"
        >
          {users.map((u) => {
            const isListener = u.id === "u-listener";
            const coefs = isListener ? { gain: 1.0, pan: 0.0 } : engine.getAcousticCoefficients(u.id);
            return (
              <AvatarAudioNode
                key={u.id}
                user={u}
                isListener={isListener}
                acousticCoefs={coefs}
              />
            );
          })}
        </div>

        {/* Dynamic Acoustic Circle Range for Active Listener */}
        <div
          className="absolute border border-indigo-500/20 bg-indigo-500/5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${users.find((u) => u.id === "u-listener")?.x}px`,
            top: `${users.find((u) => u.id === "u-listener")?.y}px`,
            width: "360px",
            height: "360px",
          }}
        />

        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click anywhere on the grid floor plan to walk your avatar</span>
        </div>
      </div>
    </div>
  );
}
