/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HolographicWayfinding = () => {
  const [arActive, setArActive] = useState(false);
  const [destination, setDestination] = useState(null); // 'MAIN_STAGE', 'RESTROOM'
  const [distance, setDistance] = useState(0);
  
  const [arLog, setArLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'WebXR Spatial Core initialized. Awaiting camera permissions.' }
  ]);

  useEffect(() => {
    let loop;
    if (arActive && destination) {
      loop = setInterval(() => {
        // Simulate walking closer
        setDistance(prev => {
          const next = prev - (Math.random() * 2 + 1);
          if (next <= 5) {
            addLog('SUCCESS', `Arrived at ${destination.replace('_', ' ')}.`);
            setArActive(false);
            setDestination(null);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(loop);
  }, [arActive, destination]);

  const routeTo = (destName, startDist) => {
    if (!arActive) {
      setArActive(true);
      setDestination(destName);
      setDistance(startDist);
      
      addLog('NAV', `Calculating spatial mesh for route to ${destName}.`);
      setTimeout(() => {
        addLog('RENDER', 'Anchoring 3D holographic waypoint to real-world coordinates.');
      }, 600);
    }
  };

  const cancelNav = () => {
    setArActive(false);
    setDestination(null);
    setDistance(0);
    addLog('SYS', 'Spatial navigation cancelled. De-rendering AR objects.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setArLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: AR Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕶️</span> Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Holographic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Wayfinding Arrows</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees often get lost looking for specific stages or bathrooms, and staring down at a 2D map on their phone causes them to bump into others in crowded environments. Eventra implements a WebXR feature utilizing spatial computing. Attendees hold up their phone, and the app renders massive, glowing 3D holographic arrows floating in the air above the crowd. The arrows anchor perfectly to real-world coordinates, guiding the user directly to their destination heads-up.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">📍</span> ARKit Integration Module
               </h3>
               
               <div className="flex space-x-2">
                 {arActive ? (
                   <button 
                     onClick={cancelNav}
                     className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-slate-800 hover:bg-slate-700 text-white"
                   >
                     Cancel Navigation
                   </button>
                 ) : (
                   <>
                     <button 
                       onClick={() => routeTo('NEON_STAGE', 120)}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900/60"
                     >
                       Route Stage
                     </button>
                     <button 
                       onClick={() => routeTo('RESTROOM_B', 45)}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-purple-900/40 text-purple-400 border border-purple-500/50 hover:bg-purple-900/60"
                     >
                       Route Restroom
                     </button>
                   </>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Distance Metric */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Distance to Target</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${arActive ? 'text-white' : 'text-slate-600'}`}>
                     {arActive ? distance.toFixed(1) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">meters</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${arActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                   GPS Tracking Active
                 </div>
               </div>

               {/* Spatial Anchors */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 arActive ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Spatial Anchors</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${arActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                     {arActive ? 'LOCKED' : 'IDLE'}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {arActive ? 'Plane Detection Running' : 'Awaiting mesh data'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebXR Processing Log</span>
                 {arActive && <span className="text-cyan-400 animate-pulse">Rendering...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {arLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'RENDER' ? 'text-cyan-400 font-bold' :
                       log.type === 'NAV' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: AR Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-[2.5rem] border-8 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                Attendee Camera Feed
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
               
               {/* Simulated Camera Background (Dark gradient for night festival) */}
               <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c] via-[#1a1c2e] to-[#0d0914] z-0">
                 
                 {/* Crowd Silhouettes */}
                 <svg className="absolute bottom-0 w-full h-32 opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d="M0 100 L0 70 Q 5 60, 10 70 T 20 70 T 30 65 T 40 75 T 50 65 T 60 70 T 70 60 T 80 70 T 90 65 T 100 70 L100 100 Z" fill="#000" />
                   <path d="M0 100 L0 80 Q 15 70, 25 85 T 45 75 T 65 85 T 85 75 T 100 80 L100 100 Z" fill="#050505" />
                 </svg>

                 {/* Stage Lights in distance */}
                 <div className="absolute top-[30%] left-[20%] w-1 h-32 bg-purple-500/20 blur-md transform rotate-45"></div>
                 <div className="absolute top-[30%] right-[30%] w-1 h-32 bg-cyan-500/20 blur-md transform -rotate-12"></div>
               </div>

               {/* Holographic AR Element */}
               {arActive ? (
                 <div className="relative z-20 flex flex-col items-center animate-fade-in-up">
                   
                   {/* 3D Arrow SVG with Glow */}
                   <div className="relative animate-bounce">
                     {/* Outer Glow */}
                     <div className={`absolute inset-0 blur-xl rounded-full ${destination === 'NEON_STAGE' ? 'bg-cyan-500/50' : 'bg-purple-500/50'}`}></div>
                     
                     <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={destination === 'NEON_STAGE' ? '#22d3ee' : '#c084fc'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="relative drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                       <path d="M12 19V5M5 12l7-7 7 7"/>
                       
                       {/* Inner fill to make it look "solid" */}
                       <path d="M12 5l-7 7h4v7h6v-7h4z" fill={destination === 'NEON_STAGE' ? 'rgba(34,211,238,0.2)' : 'rgba(192,132,252,0.2)'} />
                     </svg>
                   </div>

                   {/* Floating Info Tag */}
                   <div className={`mt-8 px-4 py-2 rounded-xl backdrop-blur-md border shadow-[0_0_20px_rgba(0,0,0,0.5)] text-center ${
                     destination === 'NEON_STAGE' ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-100' : 'bg-purple-950/60 border-purple-500/40 text-purple-100'
                   }`}>
                     <p className="font-black uppercase tracking-widest text-sm mb-1">{destination.replace('_', ' ')}</p>
                     <p className="font-mono text-xs opacity-80">{distance.toFixed(1)}m ahead</p>
                   </div>
                   
                   {/* Spatial tracking dots (UI decoration) */}
                   <div className="absolute -inset-20 border border-white/5 rounded-full z-10 animate-[spin_10s_linear_infinite]"></div>
                   <div className="absolute -inset-32 border border-white/5 rounded-full z-10 animate-[spin_15s_linear_infinite_reverse]"></div>
                 </div>
               ) : (
                 <div className="relative z-20 text-center opacity-40">
                   <span className="text-4xl block mb-2">📱</span>
                   <p className="text-[10px] font-bold text-white uppercase tracking-widest">Select a destination to begin</p>
                 </div>
               )}

               {/* Fake Camera UI Overlay */}
               <div className="absolute inset-0 pointer-events-none z-30">
                 {/* Focus box */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-3xl"></div>
                 {/* Reticle dots */}
                 <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HolographicWayfinding;
