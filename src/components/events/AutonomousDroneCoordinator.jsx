import React, { useState, useEffect } from 'react';

const AutonomousDroneCoordinator = () => {
  const [missionActive, setMissionActive] = useState(false);
  const [dronePos, setDronePos] = useState({ x: 10, y: 10 });
  const [droneStatus, setDroneStatus] = useState('Idle at Charging Pad');
  const [battery, setBattery] = useState(100);

  // Define a flight path (waypoints)
  const waypoints = [
    { x: 10, y: 10 },   // Base
    { x: 50, y: 20 },   // Main Stage Front
    { x: 80, y: 40 },   // VIP Tent
    { x: 60, y: 80 },   // Food Court
    { x: 20, y: 60 },   // Expo Entrance
    { x: 10, y: 10 }    // Return to Base
  ];

  const handleLaunch = () => {
    setMissionActive(true);
    setDroneStatus('Ascending & Calibrating...');
    setBattery(100);
    
    setTimeout(() => {
      executeFlightPath(0);
    }, 1500);
  };

  const executeFlightPath = (index) => {
    if (index >= waypoints.length) {
      setMissionActive(false);
      setDroneStatus('Mission Complete. Recharging.');
      return;
    }

    setDroneStatus(`Capturing Area: Waypoint ${index + 1}`);
    setDronePos(waypoints[index]);
    setBattery(prev => Math.max(0, prev - 15));

    setTimeout(() => {
      executeFlightPath(index + 1);
    }, 2000); // 2 seconds per waypoint simulation
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Hardware Automation
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Autonomous <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Drone Fleet API</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Push your event into the future. Stop hiring expensive manual drone pilots. Define geofenced "safe flight zones" and automated patrol schedules directly within Eventra to launch autonomous drone fleets for aerial photography.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
             <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
               <span className="text-3xl">🛸</span>
               <div>
                 <h3 className="font-bold text-slate-900 text-sm">DJI Matrice 300 RTK</h3>
                 <p className="text-[10px] text-slate-500 font-mono">Unit: Alpha-01 | API Connected</p>
               </div>
             </div>

             <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Battery Level</span>
                 <div className="flex items-center space-x-2">
                   <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div 
                       className={`h-full transition-all duration-1000 ${battery > 40 ? 'bg-emerald-500' : battery > 15 ? 'bg-orange-500' : 'bg-red-500'}`} 
                       style={{ width: `${battery}%` }}
                     ></div>
                   </div>
                   <span className="text-xs font-mono font-bold text-slate-700">{battery}%</span>
                 </div>
               </div>
               
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Telemetry</span>
                 <span className="text-xs font-mono font-bold text-blue-600">
                   {missionActive ? 'Uplink Active (42ms)' : 'Standby'}
                 </span>
               </div>
             </div>
             
             <button 
               onClick={handleLaunch}
               disabled={missionActive}
               className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center shadow-sm ${missionActive ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'}`}
             >
               {missionActive ? 'Mission in Progress...' : 'Launch Patrol Protocol'}
             </button>
          </div>
        </div>

        {/* Right Side: Map & Camera Feed (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] space-y-6">
          
          {/* Map Area */}
          <div className="bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex-1">
             
             <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700">
               <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Live GPS Tracker</span>
             </div>

             <div className="absolute top-4 right-4 z-20">
               <span className="bg-emerald-900/80 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-emerald-500/50 flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-2"></span> No Fly Zones Respected
               </span>
             </div>

             {/* Simulated Map Background */}
             <div className="absolute inset-0 bg-slate-800/50 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>

             {/* Flight Path Overlay (SVG) */}
             <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
               <path 
                 d={`M ${waypoints[0].x}% ${waypoints[0].y}% L ${waypoints[1].x}% ${waypoints[1].y}% L ${waypoints[2].x}% ${waypoints[2].y}% L ${waypoints[3].x}% ${waypoints[3].y}% L ${waypoints[4].x}% ${waypoints[4].y}% Z`} 
                 fill="rgba(249, 115, 22, 0.1)" 
                 stroke="rgba(249, 115, 22, 0.4)" 
                 strokeWidth="2"
                 strokeDasharray="5,5"
               />
               {/* No Fly Zone Example */}
               <circle cx="85%" cy="15%" r="10%" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1" />
               <text x="85%" y="15%" fill="red" fontSize="10" textAnchor="middle" dominantBaseline="middle" opacity="0.6" fontWeight="bold">NO FLY (HVAC)</text>
             </svg>

             {/* The Drone Blip */}
             <div 
               className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-[2000ms] ease-in-out"
               style={{ top: `${dronePos.y}%`, left: `${dronePos.x}%` }}
             >
               <div className="w-full h-full bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.8)] border-2 border-white relative">
                 <div className="absolute inset-0 border border-orange-400 rounded-full animate-ping"></div>
                 <span className="text-[10px]">🚁</span>
               </div>
             </div>

          </div>

          {/* Camera Feed HUD */}
          <div className="bg-black rounded-3xl border border-slate-800 shadow-xl p-4 h-48 relative overflow-hidden flex items-center justify-center">
            
            {/* Feed Visuals */}
            {missionActive ? (
              <>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174000255-150bf37b3145?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-50 animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-white/10 m-4 rounded pointer-events-none"></div>
                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-16 h-16 border-t-2 border-l-2 border-white absolute top-1/3 left-1/3"></div>
                  <div className="w-16 h-16 border-b-2 border-r-2 border-white absolute bottom-1/3 right-1/3"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </>
            ) : (
              <div className="text-center opacity-30">
                <span className="text-3xl block mb-2">📷</span>
                <p className="text-xs font-mono uppercase tracking-widest text-white">Camera Offline</p>
              </div>
            )}

            {/* Status Overlay */}
            <div className="absolute bottom-4 left-6 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Payload Status</span>
              <span className="text-sm font-black text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                {droneStatus}
              </span>
            </div>
            
            <div className="absolute top-4 right-6">
              {missionActive && <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg animate-pulse">REC</span>}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AutonomousDroneCoordinator;
