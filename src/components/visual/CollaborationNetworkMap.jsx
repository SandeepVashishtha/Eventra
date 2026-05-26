import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Users, Code, Activity, MapPin } from "lucide-react";
import "./CollaborationNetworkMap.css";

const HUBS = [
  { id: "sf", name: "San Francisco Hub", lat: "37.7749° N", lng: "122.4194° W", x: 180, y: 190, devs: 1420, projects: 12, activity: "High" },
  { id: "ny", name: "New York Hub", lat: "40.7128° N", lng: "74.0060° W", x: 320, y: 175, devs: 980, projects: 8, activity: "Medium" },
  { id: "london", name: "London Hub", lat: "51.5074° N", lng: "0.1278° W", x: 480, y: 140, devs: 1150, projects: 14, activity: "High" },
  { id: "frankfurt", name: "Frankfurt Hub", lat: "50.1109° N", lng: "8.6821° E", x: 520, y: 155, devs: 740, projects: 6, activity: "Medium" },
  { id: "bengaluru", name: "Bengaluru Hub", lat: "12.9716° N", lng: "77.5946° E", x: 720, y: 310, devs: 2450, projects: 28, activity: "Critical" },
  { id: "singapore", name: "Singapore Hub", lat: "1.3521° N", lng: "103.8198° E", x: 790, y: 360, devs: 1100, projects: 11, activity: "High" },
  { id: "tokyo", name: "Tokyo Hub", lat: "35.6762° N", lng: "139.6503° E", x: 880, y: 200, devs: 850, projects: 9, activity: "High" },
  { id: "sydney", name: "Sydney Hub", lat: "33.8688° S", lng: "151.2093° E", x: 900, y: 460, devs: 620, projects: 5, activity: "Medium" }
];

const CONNECTIONS = [
  { from: "sf", to: "ny" },
  { from: "sf", to: "london" },
  { from: "ny", to: "london" },
  { from: "london", to: "frankfurt" },
  { from: "frankfurt", to: "bengaluru" },
  { from: "bengaluru", to: "singapore" },
  { from: "singapore", to: "tokyo" },
  { from: "tokyo", to: "sydney" },
  { from: "singapore", to: "sydney" },
  { from: "sf", to: "tokyo" }
];

export default function CollaborationNetworkMap() {
  const [activeHub, setActiveHub] = useState(null);

  const getCoordinates = (id) => {
    const hub = HUBS.find(h => h.id === id);
    return hub ? { x: hub.x, y: hub.y } : { x: 0, y: 0 };
  };

  return (
    <section className="cnm-section">
      <div className="cnm-container">
        {/* Section Heading Info */}
        <div className="cnm-header text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Globe className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Global Connectivity</span>
          </div>
          <h2 className="cnm-title">Real-Time Global Collaboration Network</h2>
          <p className="cnm-subtitle max-w-2xl mx-auto">
            Connecting developers, designers, and mentors across continents in a single unified open-source ecosystem.
          </p>
        </div>

        {/* The Interactive Network Map Frame */}
        <div className="cnm-map-frame relative">
          <svg 
            className="cnm-svg"
            viewBox="0 0 1000 550"
            width="100%"
            height="100%"
          >
            <defs>
              {/* Blur filter for node glow effects */}
              <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Grid backdrop pattern */}
              <pattern id="cnm-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1" fill="rgba(99, 102, 241, 0.07)" />
              </pattern>
            </defs>

            {/* Grid overlay */}
            <rect width="100%" height="100%" fill="url(#cnm-grid)" />

            {/* Connecting paths (relays) */}
            {CONNECTIONS.map((conn, idx) => {
              const start = getCoordinates(conn.from);
              const end = getCoordinates(conn.to);
              
              // Draw a clean arc path connecting hubs
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // Curve radius
              const pathD = `M ${start.x} ${start.y} A ${dr} ${dr} 0 0,1 ${end.x} ${end.y}`;

              return (
                <g key={`connection-${idx}`}>
                  {/* Background path line */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="rgba(99, 102, 241, 0.12)" 
                    strokeWidth="1.5" 
                  />
                  {/* Glowing relay particle traveling along the path */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="rgba(168, 85, 247, 0.65)" 
                    strokeWidth="2" 
                    strokeDasharray="8, 120"
                    strokeDashoffset="0"
                  >
                    <animate 
                      attributeName="strokeDashoffset" 
                      values="128;0" 
                      dur={`${3 + (idx % 3) * 1.5}s`} 
                      repeatCount="indefinite" 
                    />
                  </path>
                </g>
              );
            })}

            {/* Hub node points */}
            {HUBS.map((hub) => {
              const isActive = activeHub?.id === hub.id;
              
              return (
                <g 
                  key={hub.id}
                  className="cnm-node-group"
                  onMouseEnter={() => setActiveHub(hub)}
                  onMouseLeave={() => setActiveHub(null)}
                >
                  {/* Concentric active pings (ripples) */}
                  <circle 
                    cx={hub.x} 
                    cy={hub.y} 
                    r={isActive ? 22 : 12} 
                    fill="none" 
                    stroke={hub.activity === "Critical" ? "#ec4899" : "#6366f1"} 
                    strokeWidth="1"
                    opacity={0.8}
                  >
                    <animate 
                      attributeName="r" 
                      values={isActive ? "10;30" : "6;24"} 
                      dur="2.5s" 
                      repeatCount="indefinite" 
                    />
                    <animate 
                      attributeName="opacity" 
                      values="0.8;0" 
                      dur="2.5s" 
                      repeatCount="indefinite" 
                    />
                  </circle>

                  {/* Node Glow Backdrop */}
                  <circle 
                    cx={hub.x} 
                    cy={hub.y} 
                    r={isActive ? 8 : 5.5} 
                    fill={hub.activity === "Critical" ? "#ec4899" : "#6366f1"} 
                    filter="url(#hub-glow)"
                    opacity={isActive ? 0.95 : 0.6}
                  />

                  {/* Core Node Dot */}
                  <circle 
                    cx={hub.x} 
                    cy={hub.y} 
                    r={isActive ? 5.5 : 3.5} 
                    fill="#ffffff"
                    stroke={hub.activity === "Critical" ? "#db2777" : "#4f46e5"}
                    strokeWidth="2"
                    className="cnm-core-dot"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Popup Overlay */}
          <AnimatePresence>
            {activeHub && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.15 }}
                className="cnm-popup-card absolute bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/50 rounded-2xl p-4 shadow-xl backdrop-blur-xl text-white pointer-events-none"
                style={{
                  left: `${(activeHub.x / 1000) * 100}%`,
                  top: `${(activeHub.y / 550) * 100}%`,
                  transform: "translate(-50%, -125%)"
                }}
              >
                {/* Popup header */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white">{activeHub.name}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {activeHub.lat} • {activeHub.lng}
                    </span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Developers</div>
                      <div className="text-xs font-black">{activeHub.devs.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Projects</div>
                      <div className="text-xs font-black">{activeHub.projects}</div>
                    </div>
                  </div>
                </div>

                {/* Activity Status Bar */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5 justify-between">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Status:</span>
                  <div className="flex items-center gap-1">
                    <Activity className={`w-3 h-3 ${activeHub.activity === "Critical" ? "text-pink-500 animate-pulse" : "text-indigo-400"}`} />
                    <span className={`text-[10px] font-bold ${activeHub.activity === "Critical" ? "text-pink-400" : "text-indigo-300"}`}>
                      {activeHub.activity} Activity
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
