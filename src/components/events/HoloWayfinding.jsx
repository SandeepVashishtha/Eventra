/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HoloWayfinding = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [lostDensity, setLostDensity] = useState(5); // % of attendees exhibiting lost behavior
  
  // IoT Metrics
  const [activeLasers, setActiveLasers] = useState(0); 
  const [fogVolume, setFogVolume] = useState(0); // m3
  const [pathfindingLatency, setPathfindingLatency] = useState(0); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Volumetric Projection Array Online.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Pathfinding AI monitoring GPS heatmaps.' }
  ]);

  // Visualizer State
  const [projectionState, setProjectionState] = useState('IDLE'); // IDLE, FOGGING, PROJECTING
  const [targetDestination, setTargetDestination] = useState('MEDICAL'); // MEDICAL, EXIT, STAGE
  const [fogParticles, setFogParticles] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (projectionState === 'FOGGING' || projectionState === 'PROJECTING') {
              setFogVolume(prev => Math.min(1500, prev + 50));
              setActiveLasers(12);
              setPathfindingLatency(4 + Math.random() * 2);
              
              // Generate fog particles
              setFogParticles(prev => {
                  const newParticles = [...prev, {
                      id: Date.now() + Math.random(),
                      x: 20 + Math.random() * 60,
                      y: 80,
                      size: 20 + Math.random() * 40,
                      opacity: 0.8
                  }];
                  
                  // Float up and fade
                  return newParticles.map(p => ({
                      ...p,
                      y: p.y - 2,
                      x: p.x + (Math.random() - 0.5) * 5,
                      opacity: p.opacity - 0.02,
                      size: p.size + 1
                  })).filter(p => p.opacity > 0);
              });
              
              if (projectionState === 'FOGGING' && fogVolume > 800) {
                  setProjectionState('PROJECTING');
                  addLog('ACTION', 'Fog density optimal. Engaging Volumetric Lasers.');
              }
              
          } else {
              setFogVolume(prev => Math.max(0, prev - 20));
              setActiveLasers(0);
              setPathfindingLatency(0);
              setFogParticles([]);
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, projectionState, fogVolume]);

  const triggerWayfinding = (destination) => {
      if (!systemActive) return;
      
      setTargetDestination(destination);
      setLostDensity(45); // Simulate a spike in lost people
      setProjectionState('FOGGING');
      
      const destName = destination === 'MEDICAL' ? 'Med Tent' : destination === 'EXIT' ? 'North Exit' : 'Neon Stage';
      addLog('CRIT', `GPS AI: High density of lost attendees detected looking for ${destName}.`);
      addLog('SYS', `Deploying localized fog curtain in Sector 4...`);
  };

  const resetSystem = () => {
      if (!systemActive) return;
      setLostDensity(5);
      setProjectionState('IDLE');
      addLog('SUCCESS', 'Crowd flow normalized. Securing lasers and foggers.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setLostDensity(5);
      addLog('SYS', 'Real-time Pathfinding Algorithms Active.');
    } else {
      setSystemActive(false);
      setProjectionState('IDLE');
      setFogParticles([]);
      addLog('WARN', 'Holographic Wayfinding Offline. Attendees relying on physical signage.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020504] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔦</span> Volumetric Projection
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Holographic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500">Wayfinding</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            At night, attendees struggle to read standard signage and often get lost looking for exits, medical tents, or specific stages, leading to dangerous bottlenecks. Eventra solves this by deploying a network of localized fog machines coupled with high-powered laser projectors. When Eventra's AI detects a high volume of lost attendees via GPS telemetry (e.g., people walking in circles), it dynamically projects massive 3D holographic directional arrows and distance markers directly onto the mist above the crowd's heads.
          </p>

          <div className="bg-[#050f0c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> IoT Fog & Laser Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Projection' : 'Initialize Holograms'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Lost Attendee Density */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 lostDensity > 20 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Lost Entity GPS
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     lostDensity > 20 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {lostDensity}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Fog Volume */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fogVolume > 500 ? 'bg-slate-800/80 border-slate-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Fog Displacement
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fogVolume > 500 ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {Math.floor(fogVolume)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m³</span>
                 </div>
               </div>
               
               {/* Active Lasers */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeLasers > 0 ? 'bg-teal-950/40 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Volumetric Lasers
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     activeLasers > 0 ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {activeLasers}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010403] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Pathfinding Ledger</span>
                 {projectionState === 'FOGGING' && <span className="text-slate-400 font-black animate-pulse">DEPLOYING FOG CURTAIN</span>}
                 {projectionState === 'PROJECTING' && <span className="text-teal-400 font-black animate-pulse">LASERS ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-orange-500 font-bold uppercase bg-orange-900/30 px-1' :
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* Hologram Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">NIGHT VISION CAM</span>
                <span className="text-[8px] font-mono text-slate-400">SECTOR 4</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-end overflow-hidden pt-12">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CAM OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-end">
                      
                      {/* Festival Background (Dark) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-black z-0"></div>
                      
                      {/* Crowd Silhouettes */}
                      <div className="absolute bottom-0 w-full h-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwb2x5Z29uIHBvaW50cz0iMCwxMDAgMTAsODAgMjAsOTAgMzAsNzAgNDAsOTAgNTAsNjAgNjAsODAgNzAsNTAgODAsODAgOTAsNjAgMTAwLDcwIDEwMCwxMDAiIGZpbGw9IiMwZjE3MmEiLz48L3N2Zz4=')] bg-cover bg-bottom opacity-50 z-30"></div>

                      {/* Volumetric Fog Particles */}
                      <div className="absolute inset-0 z-10 overflow-hidden">
                          {fogParticles.map(p => (
                              <div 
                                  key={p.id}
                                  className="absolute bg-slate-400 rounded-full blur-2xl transition-all duration-300"
                                  style={{
                                      left: `${p.x}%`,
                                      top: `${p.y}%`,
                                      width: `${p.size}px`,
                                      height: `${p.size}px`,
                                      opacity: p.opacity * 0.3
                                  }}
                              ></div>
                          ))}
                      </div>

                      {/* Laser Hologram Projection */}
                      {projectionState === 'PROJECTING' && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center -mt-12 pointer-events-none">
                              
                              {/* Laser Beams from ground */}
                              <div className="absolute bottom-0 w-full flex justify-between px-10 opacity-30">
                                  <div className="w-0.5 h-64 bg-teal-400 blur-sm rotate-[30deg] origin-bottom"></div>
                                  <div className="w-0.5 h-64 bg-teal-400 blur-sm -rotate-[30deg] origin-bottom"></div>
                              </div>

                              {/* The Hologram Graphic */}
                              <div className="relative animate-pulse flex flex-col items-center" style={{ filter: 'drop-shadow(0 0 20px rgba(45,212,191,0.8))' }}>
                                  
                                  {/* Arrow */}
                                  <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-l-transparent border-r-transparent border-b-teal-400 mb-4 opacity-90 drop-shadow-[0_0_15px_rgba(45,212,191,1)]"></div>
                                  
                                  {/* Text */}
                                  <div className="bg-teal-900/50 border-2 border-teal-400 px-6 py-2 backdrop-blur-md rounded-lg text-center">
                                      <h2 className="text-3xl font-black text-white tracking-widest uppercase" style={{ textShadow: '0 0 10px rgba(255,255,255,1)' }}>
                                          {targetDestination === 'MEDICAL' ? 'MED TENT' : targetDestination === 'EXIT' ? 'NORTH EXIT' : 'NEON STAGE'}
                                      </h2>
                                      <p className="text-teal-200 font-mono text-xl font-bold mt-1">200m ↑</p>
                                  </div>

                              </div>
                          </div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050f0c] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Pathfinding Events</span>
               
               <div className="grid grid-cols-3 gap-2 mb-2">
                 <button 
                   onClick={() => triggerWayfinding('MEDICAL')}
                   disabled={!systemActive || projectionState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || projectionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   🚨 Med Tent
                 </button>

                 <button 
                   onClick={() => triggerWayfinding('EXIT')}
                   disabled={!systemActive || projectionState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || projectionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-teal-950/40 border-teal-600 text-teal-400 hover:bg-teal-900/60 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                   }`}
                 >
                   🏃 North Exit
                 </button>
                 
                 <button 
                   onClick={() => triggerWayfinding('STAGE')}
                   disabled={!systemActive || projectionState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || projectionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                   }`}
                 >
                   🎵 Neon Stage
                 </button>
               </div>
               
               <button 
                 onClick={resetSystem}
                 disabled={!systemActive || projectionState === 'IDLE'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                   !systemActive || projectionState === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Clear Holograms (Flow Normalized)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HoloWayfinding;
