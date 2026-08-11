/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ADARoutingElevationProfiler = () => {
  const [navActive, setNavActive] = useState(false);
  const [routeStatus, setRouteStatus] = useState('IDLE'); // IDLE, CALCULATING, NOMINAL, REROUTING, ADA_SAFE
  const [rainEvent, setRainEvent] = useState(false);
  const [progress, setProgress] = useState(0); // Progress along the path
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Topographic Elevation API integrated.' },
    { id: 2, time: '13:00:01', type: 'SYS', msg: 'Awaiting User GPS coordinates and destination input.' }
  ]);

  useEffect(() => {
    let loop;
    if (navActive && (routeStatus === 'NOMINAL' || routeStatus === 'ADA_SAFE')) {
      loop = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(loop);
            return 100;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => { if (loop) clearInterval(loop); };
  }, [navActive, routeStatus]);

  const simulateRain = () => {
    if (navActive && progress > 10 && progress < 80 && !rainEvent) {
      setRainEvent(true);
      addLog('WARN', 'Microclimate API reports heavy rainfall in Zone 4 (Grassy Incline).');
      setRouteStatus('REROUTING');
      
      setTimeout(() => {
        addLog('ACTION', 'Calculating new ADA-compliant path avoiding mud hazards...');
        
        setTimeout(() => {
          setRouteStatus('ADA_SAFE');
          addLog('SUCCESS', 'Rerouted via paved service road. Slope maintained < 1:12.');
        }, 1500);
      }, 1000);
    }
  };

  const startNavigation = () => {
    if (!navActive) {
      setNavActive(true);
      setRouteStatus('CALCULATING');
      setProgress(0);
      addLog('ACTION', 'User requested route: Main Entrance -> Sahara Tent.');
      
      setTimeout(() => {
        addLog('SYS', 'Analyzing 3D topography. Filtering out paths with slope > 1:12 (8.3%).');
        
        setTimeout(() => {
          setRouteStatus('NOMINAL');
          addLog('SUCCESS', 'ADA route generated. Surface type: Compacted Dirt & Pavement.');
        }, 1200);
      }, 800);
    }
  };

  const resetNav = () => {
    setNavActive(false);
    setRouteStatus('IDLE');
    setRainEvent(false);
    setProgress(0);
    addLog('SYS', 'Navigation reset. Awaiting new destination.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070b0a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Pathfinding Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿</span> ADA Pathfinding AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated ADA Wheelchair <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Routing & Elevation Profiler</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees in wheelchairs often follow standard map routes only to encounter a steep grassy hill or mud pit that they cannot cross, forcing them to backtrack for miles. Eventra solves this by integrating a high-resolution topographic elevation API with hyper-local weather data. The pathfinding AI calculates strictly ADA-compliant routes that guarantee a slope of less than 1:12 (8.3%). If sudden rain turns a dirt incline into a mud hazard, the system instantly reroutes the user to a paved alternative.
          </p>

          <div className="bg-[#0b1311] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">⛰️</span> Topographic Path Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetNav}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     !navActive ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed' :
                     'bg-slate-700 hover:bg-slate-600 text-white'
                   }`}
                 >
                   Reset Engine
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Slope Constraint Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routeStatus === 'NOMINAL' || routeStatus === 'ADA_SAFE' ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Max Incline (Slope Constraint)
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-3xl font-black font-mono leading-tight ${
                     routeStatus === 'NOMINAL' || routeStatus === 'ADA_SAFE' ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {routeStatus === 'IDLE' || routeStatus === 'CALCULATING' ? '---' : '1:12 (8.3%)'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Strict ADA Compliance Enforced
                   </span>
                 </div>
               </div>

               {/* Surface/Weather Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routeStatus === 'REROUTING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 rainEvent ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex flex-col">
                   <span>Surface Integrity</span>
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     routeStatus === 'REROUTING' ? 'text-yellow-400' :
                     rainEvent ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {routeStatus === 'IDLE' ? 'Awaiting Route' : 
                      routeStatus === 'REROUTING' ? 'MUD HAZARD' : 
                      rainEvent ? 'PAVEMENT ONLY' : 'DRY DIRT ALLOWED'}
                   </span>
                 </div>
                 <span className="text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-500">
                   {routeStatus === 'REROUTING' ? 'Calculating reroute...' : 
                    rainEvent ? 'Precipitation detected' : 'Nominal conditions'}
                 </span>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050b09] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Pathfinding Telemetry Log</span>
                 {routeStatus === 'CALCULATING' && <span className="text-teal-400 animate-pulse">Running Dijkstra's Algo...</span>}
                 {routeStatus === 'REROUTING' && <span className="text-yellow-400 animate-pulse">Avoiding Hazard...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Eventra App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Phone Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[10px] border-[#18181b] shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans mb-4 bg-slate-100 transition-all duration-300`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-[#18181b] rounded-b-2xl"></div>
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-end pb-1 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-800">13:00</span>
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Eventra ADA Maps</span>
              </div>

              {/* Map Interface */}
              <div className="flex-1 relative bg-[#e2e8f0] overflow-hidden">
                
                {/* Simulated Map Background (Grass/Dirt/Paths) */}
                <div className="absolute inset-0 bg-[#d1fae5] z-0"></div> {/* Base Grass */}
                
                {/* Decorative Map Elements */}
                <div className="absolute top-20 left-10 w-24 h-24 bg-[#a7f3d0] rounded-full blur-xl z-0"></div>
                <div className="absolute bottom-32 right-10 w-32 h-32 bg-[#a7f3d0] rounded-full blur-xl z-0"></div>
                
                {/* Stage markers */}
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-indigo-100 border-2 border-indigo-400 rounded flex items-center justify-center z-10 shadow-lg">
                  <span className="text-[10px] font-black text-indigo-700 uppercase">Sahara</span>
                </div>
                
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-slate-100 border-2 border-slate-400 rounded flex items-center justify-center z-10 shadow-lg">
                  <span className="text-[10px] font-black text-slate-700 uppercase text-center leading-tight">Main<br/>Entrance</span>
                </div>

                {/* The Path Overlay */}
                <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
                  
                  {/* Standard Non-ADA Path (Steep Hill) */}
                  {navActive && !rainEvent && (
                    <path 
                      d="M 170 480 C 170 350, 100 300, 170 144" 
                      fill="none" 
                      stroke="#cbd5e1" 
                      strokeWidth="8" 
                      strokeLinecap="round"
                      strokeDasharray="10 10"
                    />
                  )}

                  {/* ADA Nominal Path (Dirt/Paved mix, avoids steep hill) */}
                  {navActive && routeStatus === 'NOMINAL' && (
                    <path 
                      id="adaPath1"
                      d="M 170 480 C 250 400, 250 250, 170 144" 
                      fill="none" 
                      stroke="#0ea5e9" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                    />
                  )}

                  {/* Mud Hazard Zone (appears when raining) */}
                  {rainEvent && (
                    <circle cx="230" cy="325" r="40" fill="#92400e" opacity="0.4" className="animate-pulse" />
                  )}
                  {rainEvent && (
                    <circle cx="230" cy="325" r="40" fill="url(#diagonalHatch)" opacity="0.3" />
                  )}

                  {/* ADA Rerouted Path (Paved only, avoids mud) */}
                  {navActive && routeStatus === 'ADA_SAFE' && (
                    <path 
                      id="adaPath2"
                      d="M 170 480 C 80 400, 80 250, 170 144" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                    />
                  )}

                  {/* User Position Dot */}
                  {navActive && (routeStatus === 'NOMINAL' || routeStatus === 'ADA_SAFE') && (
                    <circle 
                      cx="170" 
                      cy="480" 
                      r="6" 
                      fill="#1e293b" 
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-300"
                      style={{
                        offsetPath: routeStatus === 'ADA_SAFE' ? "path('M 170 480 C 80 400, 80 250, 170 144')" : "path('M 170 480 C 250 400, 250 250, 170 144')",
                        offsetDistance: `${progress}%`
                      }}
                    />
                  )}
                  
                  <defs>
                    <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="4" stroke="#78350f" strokeWidth="1" />
                    </pattern>
                  </defs>
                </svg>

                {/* Popups */}
                {routeStatus === 'CALCULATING' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-3 rounded-2xl shadow-xl z-30 flex items-center space-x-3 w-4/5">
                    <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Analyzing Elevation</h4>
                      <p className="text-[9px] text-slate-500">Checking slope constraints...</p>
                    </div>
                  </div>
                )}

                {routeStatus === 'REROUTING' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-50 px-4 py-3 rounded-2xl shadow-xl z-30 flex items-center space-x-3 w-4/5 border border-yellow-200">
                    <div className="text-xl">⚠️</div>
                    <div>
                      <h4 className="text-xs font-black text-yellow-800 uppercase tracking-widest">Mud Hazard Detected</h4>
                      <p className="text-[9px] text-yellow-600 font-bold">Rerouting via paved roads...</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Navigation Panel */}
              <div className="h-32 bg-white border-t border-slate-200 p-4 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-30 relative">
                
                {navActive && (routeStatus === 'NOMINAL' || routeStatus === 'ADA_SAFE' || routeStatus === 'REROUTING') ? (
                  <div className="animate-fade-in-up">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-none">Sahara Tent</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">12 min • 0.4 miles</p>
                      </div>
                      <div className="bg-teal-100 text-teal-700 w-10 h-10 rounded-full flex items-center justify-center text-xl">♿</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${routeStatus === 'ADA_SAFE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        Max Incline: 6%
                      </div>
                      <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${routeStatus === 'ADA_SAFE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {routeStatus === 'ADA_SAFE' ? 'Paved Route' : 'Dirt Route'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Where to?</h3>
                    <p className="text-[10px] text-slate-500 font-bold">Select a destination for ADA routing.</p>
                  </div>
                )}

              </div>

            </div>

            {/* Interaction Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={startNavigation}
                disabled={navActive}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  navActive ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-teal-600 border-teal-500 text-white hover:bg-teal-500'
                }`}
              >
                Request Route
              </button>
              
              <button 
                onClick={simulateRain}
                disabled={!navActive || routeStatus !== 'NOMINAL' || progress > 80}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !navActive || routeStatus !== 'NOMINAL' || progress > 80 ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-blue-900/40 border-blue-800 text-blue-400 hover:bg-blue-900/60'
                }`}
              >
                Trigger Rainstorm
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ADARoutingElevationProfiler;
