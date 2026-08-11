/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousDroneDirector = () => {
  const [missionActive, setMissionActive] = useState(false);
  const [drones, setDrones] = useState([
    { id: 'Alpha-1', role: 'Wide Orbit', alt: 400, battery: 98, status: 'Docked', x: 10, y: 10 },
    { id: 'Bravo-2', role: 'Stage Tracking', alt: 150, battery: 100, status: 'Docked', x: 20, y: 10 },
    { id: 'Charlie-3', role: 'Crowd Pan', alt: 250, battery: 95, status: 'Docked', x: 30, y: 10 }
  ]);
  
  const [telemetryLog, setTelemetryLog] = useState([
    { time: '14:00:00', type: 'SYS', msg: 'Swarm Director online. Awaiting mission parameters.' }
  ]);

  // Map simulation
  const [crowdHeatmap, setCrowdHeatmap] = useState([]);

  useEffect(() => {
    // Generate initial crowd hotspots
    const h = [];
    for(let i=0; i<5; i++) {
      h.push({ x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, radius: Math.random() * 15 + 10 });
    }
    setCrowdHeatmap(h);
  }, []);

  useEffect(() => {
    let flightLoop;
    if (missionActive) {
      flightLoop = setInterval(() => {
        setDrones(prev => prev.map(drone => {
          // Simulate flight path math
          let newX = drone.x;
          let newY = drone.y;
          
          if (drone.role === 'Wide Orbit') {
            const angle = Date.now() / 2000;
            newX = 50 + Math.cos(angle) * 40;
            newY = 50 + Math.sin(angle) * 30;
          } else if (drone.role === 'Stage Tracking') {
            newX = 50 + Math.sin(Date.now() / 1000) * 10;
            newY = 20; // Hover near stage
          } else {
            // Pan left to right
            newX = ((Date.now() / 50) % 100);
            newY = 60;
          }

          // Safety check against crowd
          let isSafe = true;
          crowdHeatmap.forEach(hotspot => {
            const dist = Math.sqrt(Math.pow(newX - hotspot.x, 2) + Math.pow(newY - hotspot.y, 2));
            if (dist < hotspot.radius && drone.alt < 300) {
              isSafe = false;
            }
          });

          if (!isSafe) {
            // Evasive maneuver / geofence bounce
            newY += 5; 
          }

          return { 
            ...drone, 
            status: isSafe ? 'Recording (Cinematic)' : 'Evasive Routing',
            x: newX, 
            y: newY,
            battery: Math.max(0, drone.battery - 0.1)
          };
        }));
        
        // Randomly log cinematic captures
        if (Math.random() > 0.95) {
          addLog('CAM', `Algorithm captured perfect symmetrical wide-shot.`);
        }
        
      }, 200);
    }
    return () => clearInterval(flightLoop);
  }, [missionActive, crowdHeatmap]);

  const toggleMission = () => {
    if (!missionActive) {
      addLog('SYS', 'Generating non-crowd airspace corridors based on live ticket scans...');
      setTimeout(() => {
        addLog('FLIGHT', 'Corridors locked. Executing auto-takeoff sequence.');
        setDrones(prev => prev.map(d => ({ ...d, status: 'Ascending' })));
        setMissionActive(true);
      }, 1500);
    } else {
      addLog('FLIGHT', 'Mission aborted. Initiating Return-to-Home (RTH).');
      setMissionActive(false);
      setDrones(prev => prev.map(d => ({ ...d, status: 'Docked', x: 10, y: 10 })));
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTelemetryLog(prev => [{ time: timeString, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚁</span> Autonomous Robotics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Swarm Drone <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Photography Director</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Hiring helicopter crews or manual drone pilots to capture wide-scale festival photography is prohibitively expensive and dangerous over crowds. Eventra integrates with autonomous drone swarm APIs. The backend flight-path director calculates safe, non-crowd airspace corridors based on live ticket scans and dispatches the swarm to capture algorithmic, pre-programmed cinematic shots without human pilots.
          </p>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">📡</span> Swarm Uplink
               </h3>
               
               <button 
                 onClick={toggleMission}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   missionActive ? 'bg-red-900/50 text-red-400 border border-red-500/50 hover:bg-red-900' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                 }`}
               >
                 {missionActive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>}
                 {missionActive ? 'Abort & RTH' : 'Launch Swarm Mission'}
               </button>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               {drones.map(drone => (
                 <div key={drone.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
                   {drone.status === 'Evasive Routing' && (
                     <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg z-10 animate-pulse">
                       EVASIVE
                     </div>
                   )}
                   <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">{drone.id}</span>
                   <span className="text-[9px] text-slate-500 mb-2 truncate">{drone.role}</span>
                   
                   <div className="flex justify-between items-end mt-auto pt-2 border-t border-slate-800">
                     <div>
                       <span className="block text-[8px] text-slate-500 uppercase">Alt</span>
                       <span className="font-mono text-sm text-white">{drone.alt}ft</span>
                     </div>
                     <div className="text-right">
                       <span className="block text-[8px] text-slate-500 uppercase">Bat</span>
                       <span className={`font-mono text-sm ${drone.battery < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                         {drone.battery.toFixed(0)}%
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Director Telemetry Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2 flex flex-col">
                 {telemetryLog.map((log, i) => (
                   <div key={i} className={`flex items-start animate-fade-in-up ${
                     log.type === 'FLIGHT' ? 'text-emerald-400 font-bold' : 
                     log.type === 'CAM' ? 'text-blue-400' : 'text-slate-500'
                   }`}>
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Airspace Map (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-slate-900 rounded-3xl border-8 border-slate-800 shadow-2xl relative flex flex-col h-[550px] overflow-hidden">
            
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Topographical Airspace View
              </span>
              <span className="text-[10px] text-slate-400 font-mono bg-black/50 px-2 py-1 rounded">
                GEOFENCE ACTIVE
              </span>
            </div>

            {/* Radar / Map Area */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden">
              
              {/* Grid */}
              <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                  backgroundSize: '10% 10%'
              }}></div>
              
              {/* Stage Graphic */}
              <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 w-[40%] h-[10%] bg-fuchsia-900/40 border border-fuchsia-500/50 rounded flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                <span className="text-[8px] font-bold text-fuchsia-400 uppercase tracking-widest">Main Stage</span>
              </div>

              {/* Crowd Density Heatmap (Geofenced No-Fly Zones) */}
              {crowdHeatmap.map((hotspot, i) => (
                <div key={`h-${i}`} className="absolute rounded-full bg-red-500/20 mix-blend-screen pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                     style={{
                       left: `${hotspot.x}%`,
                       top: `${hotspot.y}%`,
                       width: `${hotspot.radius * 2}%`,
                       height: `${hotspot.radius * 2}%`,
                       boxShadow: '0 0 20px 10px rgba(239,68,68,0.2)'
                     }}>
                  <div className="absolute inset-0 border border-red-500/50 rounded-full animate-ping opacity-20"></div>
                </div>
              ))}

              {/* Drones */}
              {drones.map(drone => (
                <div key={`d-${drone.id}`} className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                     style={{ left: `${drone.x}%`, top: `${drone.y}%`, zIndex: 40 }}>
                  
                  {/* Drone Icon */}
                  <div className={`w-4 h-4 flex items-center justify-center relative ${drone.status === 'Evasive Routing' ? 'animate-bounce' : ''}`}>
                    <svg viewBox="0 0 24 24" className={`w-full h-full ${drone.status === 'Evasive Routing' ? 'text-yellow-500' : 'text-blue-400'} drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]`} fill="currentColor">
                      <path d="M12 2L8 6h3v5H6v-3L2 12l4 4v-3h5v5H8l4 4 4-4h-3v-5h5v3l4-4-4-4v3h-5V6h3z" />
                    </svg>
                  </div>
                  
                  {/* Label */}
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                    <span className="text-[7px] text-white font-mono">{drone.id}</span>
                  </div>
                  
                  {/* Camera FOV Cone */}
                  {drone.status.includes('Recording') && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-blue-400/20 origin-top rotate-180 pointer-events-none"></div>
                  )}
                </div>
              ))}
              
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500">Live Ticket Scans:</span> <span className="text-white font-bold">14,204</span>
            </div>
            <div>
              <span className="text-slate-500">No-Fly Zones Calculated:</span> <span className="text-red-400 font-bold">{crowdHeatmap.length}</span>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default AutonomousDroneDirector;
