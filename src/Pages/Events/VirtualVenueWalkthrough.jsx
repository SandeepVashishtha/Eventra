import React, { useState } from "react";
import { Compass, MapPin, Grid } from "lucide-react";
import "./venue-walkthrough.css";

export default function VirtualVenueWalkthrough() {
  const [activeFloor, setActiveFloor] = useState("ground");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = {
    ground: [
      { name: "Registration Lobby", desc: "Pick up your event badges here.", x: "20%", y: "45%" },
      { name: "Main Stage Auditorium", desc: "Keynotes and opening sessions.", x: "65%", y: "30%" }
    ],
    first: [
      { name: "Breakout Room A", desc: "React and Frontend talks.", x: "30%", y: "25%" },
      { name: "Breakout Room B", desc: "ZKP and WebRTC circles.", x: "70%", y: "55%" }
    ]
  };

  return (
    <div className="venue-walkthrough-container p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="text-indigo-650 dark:text-indigo-400 w-5 h-5 animate-spin-slow" />
            Interactive Venue Walkthrough Map
          </h2>
          <p className="text-xs text-slate-500 mt-1">Explore physical session rooms and locate key amenities</p>
        </div>

        <div className="flex gap-2">
          {["ground", "first"].map((floor) => (
            <button
              key={floor}
              onClick={() => {
                setActiveFloor(floor);
                setSelectedRoom(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                activeFloor === floor ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-850"
              }`}
            >
              {floor === "ground" ? "Ground Floor" : "First Floor"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interactive Map Layout Grid */}
        <div className="md:col-span-2 map-canvas-box h-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 opacity-10">
            <Grid className="w-full h-full stroke-1" />
          </div>

          <div className="w-full h-full relative">
            {rooms[activeFloor].map((room, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRoom(room)}
                style={{ left: room.x, top: room.y }}
                className="absolute p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md active:scale-95 transition-all -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold pr-1">{room.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Room Info Sidebar */}
        <div className="info-sidebar-card bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-center min-h-[200px]">
          {selectedRoom ? (
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{selectedRoom.name}</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{selectedRoom.desc}</p>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <MapPin className="w-10 h-10 text-slate-350 dark:text-slate-800 mx-auto mb-2" />
              <span className="text-xs uppercase font-semibold">Select a room node on the map</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
