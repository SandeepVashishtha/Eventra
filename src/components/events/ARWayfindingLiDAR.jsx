/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ARWayfindingLiDAR = () => {
  const [arActive, setArActive] = useState(false);
  const [navState, setNavState] = useState('IDLE'); // IDLE, SCANNING, ROUTING
  
  // Spatial Metrics
  const [meshAccuracy, setMeshAccuracy] = useState(0); // cm
  const [distanceToTarget, setDistanceToTarget] = useState(0); // meters
  const [targetType, setTargetType] = useState('None');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Spatial Computing Engine online.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Pre-show Drone LiDAR mesh loaded into memory (8.2 GB).' }
  ]);

  useEffect(() => {
    let loop;
    
    if (arActive && navState === 'IDLE') {
      loop = setInterval(() => {
        setMeshAccuracy(Math.max(1.2, Math.min(2.5, 1.8 + (Math.random() - 0.5))));
      }, 800);
    } else if (navState === 'SCANNING') {
      let scanProgress = 0;
      loop = setInterval(() => {
        scanProgress += 20;
        setMeshAccuracy(5.0 - (scanProgress / 25)); // Accuracy improves as it scans
        
        if (scanProgress >= 100) {
          clearInterval(loop);
          setNavState('ROUTING');
          setMeshAccuracy(1.1); // Hyper accurate
          addLog('SUCCESS', 'Environmental Point-Cloud Locked. Initiating AR Pathing.');
          addLog('SYS', `Dynamic route generated to: ${targetType}. Avoiding high-density crowds.`);
        }
      }, 200);
    } else if (navState === 'ROUTING') {
      loop = setInterval(() => {
        setMeshAccuracy(Math.max(1.0, Math.min(1.5, 1.2 + (Math.random() * 0.4 - 0.2))));
        setDistanceToTarget(prev => {
          const next = prev - (Math.random() * 2 + 1);
          if (next <= 5) {
            setNavState('IDLE');
            addLog('SUCCESS', 'Destination reached within 5 meters. AR overlay terminated.');
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [arActive, navState, targetType]);

  const triggerRoute = (destination, distance) => {
    if (arActive && navState === 'IDLE') {
      setTargetType(destination);
      setDistanceToTarget(distance);
      setNavState('SCANNING');
      addLog('ACTION', `User initiated wayfinding to: ${destination}.`);
      addLog('AI', 'Calculating A* spatial path through real-time crowd density mesh...');
    }
  };

  const cancelRoute = () => {
    setNavState('IDLE');
    setTargetType('None');
    setDistanceToTarget(0);
    addLog('WARN', 'AR Route cancelled by user.');
  };

  const toggleAR = () => {
    if (!arActive) {
      setArActive(true);
      addLog('SYS', 'AR Camera active. Anchoring to physical coordinate space.');
    } else {
      setArActive(false);
      setNavState('IDLE');
      setTargetType('None');
      setDistanceToTarget(0);
      addLog('WARN', 'Spatial engine offline. Reverting to 2D flat maps.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070b09] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: AR Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧭</span> Spatial Computing Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Personalized AR Wayfinding <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">via LiDAR Scanning</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Static 2D paper maps or basic GPS maps are useless for attendees trying to navigate through dense crowds, massive tents, and temporary structures in the dark. Eventra solves this by generating a highly accurate 3D mesh of the festival grounds using pre-show LiDAR drone scans. Attendees open their camera to see a personalized, glowing AR path projected physically onto the ground. The spatial engine dynamically routes them around real-time crowd congestion to seamlessly find their friends, specific restrooms, or the nearest emergency exit.
          </p>

          <div className="bg-[#0b1713] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">📍</span> A* Pathfinding Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAR}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     arActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {arActive ? 'Disable Camera View' : 'Initialize AR Overlay'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Target Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 navState === 'ROUTING' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                 navState === 'SCANNING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 arActive ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active AR Destination
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     navState === 'ROUTING' ? 'text-emerald-400' :
                     navState === 'SCANNING' ? 'text-cyan-400 animate-pulse' :
                     arActive ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {arActive ? targetType : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {navState === 'ROUTING' ? `${Math.floor(distanceToTarget)}m Remaining` : 
                      navState === 'SCANNING' ? 'Scanning Environment...' : 'Awaiting Input'}
                   </span>
                 </div>
               </div>

               {/* Mesh Accuracy */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 navState === 'ROUTING' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Spatial Mesh Drift
                 </span>
                 <div className="flex items-end">
                   <span className="text-xl font-bold text-slate-500 mr-1 pb-1">±</span>
                   <span className={`text-3xl font-black font-mono leading-none ${
                     navState === 'ROUTING' ? 'text-white' : 
                     arActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {arActive ? meshAccuracy.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">cm</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Spatial Compute Log</span>
                 {navState === 'SCANNING' && <span className="text-cyan-400 animate-pulse">Anchoring Mesh...</span>}
                 {navState === 'ROUTING' && <span className="text-emerald-400 animate-pulse">Navigating</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Camera View Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              {/* Phone Frame Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-40 pointer-events-none">
                 <div className="w-32 h-full bg-[#0f172a] rounded-b-xl"></div>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-center justify-center">
                
                {/* Simulated Camera Feed (Dark, blurry background) */}
                <div className="absolute inset-0 bg-slate-900 z-0">
                  {/* Subtle crowds */}
                  <div className="absolute bottom-10 left-10 w-24 h-48 bg-slate-800 blur-xl opacity-60 rounded-full"></div>
                  <div className="absolute bottom-10 right-20 w-32 h-64 bg-slate-800 blur-xl opacity-60 rounded-full"></div>
                  {/* Ground perspective */}
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                </div>

                {/* AR LiDAR Mesh Overlay */}
                {arActive && (
                  <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
                     <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                       <defs>
                         <pattern id="hexagons" width="20" height="34.64" patternUnits="userSpaceOnUse" patternTransform="scale(1) perspective(500px) rotateX(60deg)">
                           <path d="M20 8.66L10 2.88 0 8.66v11.55l10 5.77 10-5.77zm-10 17.32l-10-5.77v-11.55L0 20.21l10 5.77 10-5.77v11.55z" fill="none" stroke="#2dd4bf" strokeWidth="0.5"/>
                         </pattern>
                       </defs>
                       <rect width="100%" height="100%" fill="url(#hexagons)"/>
                     </svg>
                  </div>
                )}

                {/* AR UI Elements */}
                <div className="relative w-full h-full z-20 flex flex-col justify-end pb-8">
                  
                  {/* Scanning Animation */}
                  {navState === 'SCANNING' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <div className="w-48 h-48 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin opacity-80"></div>
                       <div className="w-32 h-32 absolute border-2 border-teal-400 rounded-full border-b-transparent animate-[spin_2s_reverse_infinite] opacity-60"></div>
                       <span className="absolute text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-black/60 px-2 py-1 rounded animate-pulse">
                         MAPPING ENVIRONMENT
                       </span>
                    </div>
                  )}

                  {/* AR Route Path */}
                  {navState === 'ROUTING' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-12 perspective-[800px]">
                      
                      {/* The glowing path on the ground */}
                      <div className="w-16 h-[250px] relative flex flex-col items-center transform rotateX-[60deg] origin-bottom">
                         {/* Path Glow */}
                         <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 via-teal-400 to-transparent opacity-40 blur-md"></div>
                         
                         {/* Animated Chevrons */}
                         <div className="absolute inset-0 flex flex-col justify-end overflow-hidden">
                            <div className="w-full flex flex-col space-y-4 animate-[slideUp_1s_linear_infinite]">
                              {[1, 2, 3, 4, 5, 6].map(i => (
                                <svg key={i} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-8 opacity-80 drop-shadow-[0_0_5px_#10b981]">
                                  <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                              ))}
                            </div>
                         </div>
                         <style>{`
                           @keyframes slideUp {
                             0% { transform: translateY(0); }
                             100% { transform: translateY(-40px); }
                           }
                         `}</style>
                      </div>

                      {/* Destination Pin */}
                      <div className="absolute top-[30%] flex flex-col items-center animate-bounce">
                         <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#10b981]">
                           <span className="text-[12px]">📍</span>
                         </div>
                         <div className="w-1 h-8 bg-emerald-500"></div>
                         <span className="text-[10px] font-black text-white bg-black/80 px-2 py-1 rounded mt-1 border border-emerald-500">
                           {targetType} ({Math.floor(distanceToTarget)}m)
                         </span>
                      </div>

                    </div>
                  )}

                </div>
                
                {/* AR HUD Borders */}
                {arActive && (
                  <>
                    <div className="absolute top-8 left-4 w-6 h-6 border-t-2 border-l-2 border-teal-500 opacity-50"></div>
                    <div className="absolute top-8 right-4 w-6 h-6 border-t-2 border-r-2 border-teal-500 opacity-50"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-teal-500 opacity-50"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-teal-500 opacity-50"></div>
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b1713] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">AR Destination Triggers</span>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <button 
                   onClick={() => triggerRoute("Medical Tent B", 240)}
                   disabled={!arActive || navState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !arActive || navState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-400 hover:bg-red-900/60'
                   }`}
                 >
                   Find Medical
                 </button>
                 
                 <button 
                   onClick={() => triggerRoute("Friend: Sarah", 85)}
                   disabled={!arActive || navState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !arActive || navState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                   }`}
                 >
                   Find Friend
                 </button>
               </div>

               <button 
                 onClick={cancelRoute}
                 disabled={navState === 'IDLE'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                   navState === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Cancel AR Route
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ARWayfindingLiDAR;
