/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ARAudioNavigation = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [routingState, setRoutingState] = useState('IDLE'); // IDLE, ROUTING, OBSTACLE, ARRIVED
  
  // Navigation Metrics
  const [distance, setDistance] = useState(0); // meters
  const [uwbAccuracy, setUwbAccuracy] = useState(12); // millimeters
  const [spatialAngle, setSpatialAngle] = useState(0); // Degrees offset from center
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'UWB (Ultra-Wideband) Beacon Network Online.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Spatial Audio DSP ready for ADA navigation.' }
  ]);

  // Visualizer State
  const [userPos, setUserPos] = useState({ x: 50, y: 80 }); // Bottom center
  const [targetPos, setTargetPos] = useState(null);
  const [obstaclePos, setObstaclePos] = useState(null);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setUwbAccuracy(10 + (Math.random() * 4)); // Fluctuate accuracy slightly
          
          if (routingState === 'ROUTING' && targetPos) {
              // Move user towards target
              setUserPos(prev => {
                  const dx = targetPos.x - prev.x;
                  const dy = targetPos.y - prev.y;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  
                  // Calculate angle for spatial audio cue (relative to user facing UP)
                  // Assuming user is always facing 'up' (y decreases)
                  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
                  setSpatialAngle(angle);
                  setDistance(dist * 2.5); // Arbitrary scaling for meters
                  
                  if (dist < 2) {
                      setRoutingState('ARRIVED');
                      setSpatialAngle(0);
                      addLog('SUCCESS', 'Destination reached: ADA Viewing Platform.');
                      return prev;
                  }
                  
                  return {
                      x: prev.x + (dx/dist) * 1.5,
                      y: prev.y + (dy/dist) * 1.5
                  };
              });
              
          } else if (routingState === 'OBSTACLE') {
              // User hits an unexpected crowd/obstacle
              setSpatialAngle(90); // Hard right audio cue to avoid
              
              setUserPos(prev => {
                  // Dodge right
                  return {
                      x: prev.x + 1.0,
                      y: prev.y
                  };
              });
              
              // If cleared obstacle X bounds
              if (userPos.x > 65) {
                  setRoutingState('ROUTING');
                  setObstaclePos(null);
                  addLog('SYS', 'Obstacle cleared. Recalculating path to destination.');
              }
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, routingState, targetPos, userPos.x]);

  const triggerNavigation = (dest) => {
    if (!systemActive) return;
    
    setRoutingState('ROUTING');
    setUserPos({ x: 50, y: 80 });
    setTargetPos({ x: 30, y: 20 });
    setObstaclePos(null);
    
    addLog('ACTION', `Routing to: ${dest}. Establishing UWB fix.`);
    addLog('SYS', 'Generating 3D spatial audio ping for heading vector.');
  };

  const triggerObstacle = () => {
      if (!systemActive || routingState !== 'ROUTING') return;
      
      setRoutingState('OBSTACLE');
      setObstaclePos({ x: userPos.x, y: userPos.y - 10 }); // Put obstacle right in front of them
      
      addLog('WARN', 'Dynamic Obstacle Detected: Crowd bottleneck ahead.');
      addLog('CRIT', 'Rerouting: Emitting localized spatial audio cue to user\'s right ear.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setRoutingState('IDLE');
      setUserPos({ x: 50, y: 80 });
      setTargetPos(null);
      setDistance(0);
      setSpatialAngle(0);
      addLog('SYS', 'ADA AR Audio-Spatial Navigation Armed.');
    } else {
      setSystemActive(false);
      setRoutingState('IDLE');
      setTargetPos(null);
      setObstaclePos(null);
      addLog('WARN', 'Navigation Offline. User must rely on physical pathways.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000210] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Visually Impaired Accessibility
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AR Audio-Spatial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-500">Navigation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Navigating a chaotic, loud, and constantly shifting festival environment is incredibly dangerous and disorienting for visually impaired attendees. Physical ADA pathways are often blocked by crowds. Eventra solves this by implementing a localized audio-spatial Augmented Reality (AR) navigation mode. Using ultra-wideband (UWB) beacons placed around the festival, the app provides millimeter-accurate 3D spatial audio cues through the user's headphones (e.g., a pinging noise sounding exactly 10 feet to the right), safely guiding them around obstacles and crowds to their destination.
          </p>

          <div className="bg-[#030612] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> UWB Spatial Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt DSP Router' : 'Enable UWB Beacons'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Distance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routingState !== 'IDLE' && distance < 10 ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 routingState !== 'IDLE' ? 'bg-indigo-950/40 border-indigo-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Dest. Distance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     routingState !== 'IDLE' && distance < 10 ? 'text-emerald-400' : 
                     routingState !== 'IDLE' ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {distance.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m</span>
                 </div>
               </div>

               {/* Spatial Angle */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routingState === 'OBSTACLE' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 routingState !== 'IDLE' ? 'bg-blue-950/40 border-blue-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Audio Heading
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     routingState === 'OBSTACLE' ? 'text-red-400' :
                     routingState !== 'IDLE' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {Math.abs(spatialAngle).toFixed(0)}°
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">
                       {spatialAngle > 0 ? 'R' : spatialAngle < 0 ? 'L' : 'C'}
                   </span>
                 </div>
               </div>
               
               {/* UWB Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   UWB Precision
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? uwbAccuracy.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mm</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>AR DSP Router Ledger</span>
                 {routingState === 'ROUTING' && <span className="text-indigo-400 font-black animate-pulse">EMITTING SPATIAL PING</span>}
                 {routingState === 'OBSTACLE' && <span className="text-red-500 font-black animate-pulse">AVOIDANCE CUE RENDERED</span>}
                 {routingState === 'ARRIVED' && <span className="text-emerald-400 font-black">DESTINATION REACHED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* UWB Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#030612]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">UWB MESH TRACKING</span>
                <span className="text-[8px] font-mono text-slate-400">2D PLANE MAP</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">BEACONS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Grid / Beacons */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:30px_30px]">
                          {/* Corner Beacons */}
                          <div className="absolute top-2 left-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-50"></div>
                          <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-50"></div>
                          <div className="absolute bottom-2 left-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-50"></div>
                          <div className="absolute bottom-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-50"></div>
                      </div>

                      {/* Destination Target */}
                      {targetPos && (
                          <div className="absolute w-8 h-8 flex flex-col items-center justify-center z-10" style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }}>
                              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <span className="text-[6px] font-black uppercase tracking-widest text-emerald-400 mt-1 whitespace-nowrap">ADA Platform</span>
                          </div>
                      )}

                      {/* Dynamic Obstacle */}
                      {obstaclePos && (
                          <div className="absolute w-16 h-8 bg-red-900/50 border border-red-500 rounded flex items-center justify-center z-10" style={{ left: `${obstaclePos.x}%`, top: `${obstaclePos.y}%`, transform: 'translate(-50%, -50%)' }}>
                              <span className="text-[6px] font-black uppercase tracking-widest text-red-500 animate-pulse">Dense Crowd</span>
                          </div>
                      )}

                      {/* User Avatar */}
                      <div className="absolute w-8 h-8 flex items-center justify-center z-30 transition-all duration-75" style={{ left: `${userPos.x}%`, top: `${userPos.y}%`, transform: 'translate(-50%, -50%)' }}>
                          
                          {/* Spatial Audio Ping Visualization */}
                          {routingState !== 'IDLE' && routingState !== 'ARRIVED' && (
                              <div className="absolute inset-0 pointer-events-none">
                                  {/* Right Ear Ping */}
                                  {spatialAngle > 10 && (
                                      <svg width="40" height="40" className="absolute top-1/2 left-full -translate-y-1/2 -ml-2 text-blue-500 animate-[ping_1s_ease-out_infinite]">
                                          <path d="M 5 10 Q 15 20 5 30" stroke="currentColor" strokeWidth="2" fill="none"/>
                                          <path d="M 10 5 Q 25 20 10 35" stroke="currentColor" strokeWidth="2" fill="none"/>
                                      </svg>
                                  )}
                                  {/* Left Ear Ping */}
                                  {spatialAngle < -10 && (
                                      <svg width="40" height="40" className="absolute top-1/2 right-full -translate-y-1/2 -mr-2 text-blue-500 animate-[ping_1s_ease-out_infinite] scale-x-[-1]">
                                          <path d="M 5 10 Q 15 20 5 30" stroke="currentColor" strokeWidth="2" fill="none"/>
                                          <path d="M 10 5 Q 25 20 10 35" stroke="currentColor" strokeWidth="2" fill="none"/>
                                      </svg>
                                  )}
                                  {/* Center Ping */}
                                  {Math.abs(spatialAngle) <= 10 && (
                                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-indigo-400 rounded-full animate-ping opacity-50"></div>
                                  )}
                              </div>
                          )}

                          {/* The User */}
                          <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] relative z-10">
                              {/* Heading indicator */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0.5 h-3 bg-white origin-bottom" style={{ transform: `rotate(${spatialAngle}deg)` }}></div>
                          </div>
                      </div>

                  </div>
                )}

              </div>
            </div>

            {/* Navigation Scenarios */}
            <div className="w-full bg-[#030612] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Trigger Navigation Scenario</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerNavigation('ADA Platform')}
                   disabled={!systemActive || routingState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || routingState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(79,70,229,0.3)] animate-pulse'
                   }`}
                 >
                   📍 Route to ADA Platform
                 </button>

                 <button 
                   onClick={triggerObstacle}
                   disabled={!systemActive || routingState !== 'ROUTING'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || routingState !== 'ROUTING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                   }`}
                 >
                   🚧 Inject Dynamic Obstacle
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ARAudioNavigation;
