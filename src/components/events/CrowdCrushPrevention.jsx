/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrowdCrushPrevention = () => {
  const [engineActive, setEngineActive] = useState(false);
  
  // Real-time metrics
  const [crowdDensity, setCrowdDensity] = useState(2.1); // pax per sq meter
  const [kinematicPanicLevel, setKinematicPanicLevel] = useState(12); // % of crowd showing erratic movement
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);

  // Constants
  const CRITICAL_DENSITY_THRESHOLD = 4.0;
  const CRITICAL_PANIC_THRESHOLD = 40;

  const [aiLog, setAiLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Edge AI Node #04 (Stage Left CCTV) initialized. Pose-estimation loaded.' }
  ]);

  useEffect(() => {
    let loop;
    if (engineActive && !emergencyTriggered) {
      loop = setInterval(() => {
        // AI reading metrics, slowly escalating towards a crush
        setCrowdDensity(prev => {
          let next = prev + (Math.random() * 0.15);
          return Math.min(6.0, next);
        });

        setKinematicPanicLevel(prev => {
          // Panic spikes as density crosses 3.5
          let factor = crowdDensity > 3.5 ? 4 : 1.5;
          let next = prev + (Math.random() * factor);
          return Math.min(100, next);
        });

      }, 1000);
    }
    return () => clearInterval(loop);
  }, [engineActive, emergencyTriggered, crowdDensity]);

  useEffect(() => {
    // Safety Algorithmic Trigger
    if (engineActive && !emergencyTriggered) {
      if (crowdDensity >= CRITICAL_DENSITY_THRESHOLD && kinematicPanicLevel >= CRITICAL_PANIC_THRESHOLD) {
        setEmergencyTriggered(true);
        addLog('CRIT', 'CROWD CRUSH DETECTED! Density > 4.0 pax/m2 + High Kinematic Panic.');
        addLog('ACTION', 'Auto-Triggering stage audio halt. Dispatching Rapid Response Team A to Sector 4.');
      }
    }
  }, [crowdDensity, kinematicPanicLevel, engineActive, emergencyTriggered]);

  const toggleSimulation = () => {
    if (!engineActive) {
      setEngineActive(true);
      setEmergencyTriggered(false);
      setCrowdDensity(2.1);
      setKinematicPanicLevel(12);
      addLog('AI', 'Simulating crowd surge event in Sector 4...');
    } else {
      setEngineActive(false);
      setEmergencyTriggered(false);
      setCrowdDensity(2.1);
      setKinematicPanicLevel(12);
      addLog('SYS', 'Simulation reset to baseline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAiLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/50 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚨</span> Edge AI / Computer Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Crowd Crush <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">Prevention Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Dangerous crowd crushes develop incredibly fast near the front barricades of a stage. Human security usually only notices after attendees are already trapped and suffocating beneath the crush. Eventra solves this by deploying Edge AI nodes directly to the stage CCTV cameras. The AI runs real-time pose-estimation and density-mapping algorithms. If it calculates critical density alongside erratic kinematic panic movements, it auto-triggers a life-safety shutdown.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">👁️</span> Edge AI Node #04 Telemetry
               </h3>
               
               <button 
                 onClick={toggleSimulation}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   engineActive && !emergencyTriggered ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                   'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                 }`}
               >
                 {engineActive && !emergencyTriggered ? 'Surge in Progress...' : 'Simulate Crowd Surge'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Density Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-500 ${
                 crowdDensity >= CRITICAL_DENSITY_THRESHOLD ? 'bg-rose-950 border-rose-500 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Crowd Density (Sector 4)</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     crowdDensity >= CRITICAL_DENSITY_THRESHOLD ? 'text-rose-500' : 'text-slate-300'
                   }`}>
                     {crowdDensity.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">pax / m²</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${crowdDensity >= CRITICAL_DENSITY_THRESHOLD ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${(crowdDensity / 6) * 100}%` }}
                   ></div>
                 </div>
               </div>

               {/* Kinematic Panic Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-500 ${
                 kinematicPanicLevel >= CRITICAL_PANIC_THRESHOLD ? 'bg-rose-950 border-rose-500 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Kinematic Panic Indicator</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     kinematicPanicLevel >= CRITICAL_PANIC_THRESHOLD ? 'text-rose-500' : 'text-slate-300'
                   }`}>
                     {kinematicPanicLevel.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">% erratic</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${kinematicPanicLevel >= CRITICAL_PANIC_THRESHOLD ? 'bg-rose-500' : 'bg-orange-500'}`} 
                     style={{ width: `${kinematicPanicLevel}%` }}
                   ></div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Computer Vision Engine Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {aiLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-rose-500 font-black' : 
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' :
                       log.type === 'AI' ? 'text-rose-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: CCTV AI Overlay Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] bg-black rounded-lg border-8 border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span> REC
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                CAM_04_FRONT_STAGE
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-900 overflow-hidden">
               
               {/* Simulated Crowd Visual */}
               <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTUiIGZpbGw9IiM1NTViNmUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] bg-[length:20px_20px]"></div>

               {/* Grid Overlay for ML context */}
               <div className="absolute inset-0 border border-slate-700/30 grid grid-cols-4 grid-rows-6 z-10 pointer-events-none">
                 {[...Array(24)].map((_, i) => (
                   <div key={i} className="border border-slate-700/20 flex items-center justify-center">
                     {/* Randomly highlight some grids if crush is happening */}
                     {emergencyTriggered && Math.random() > 0.7 && (
                       <div className="absolute w-full h-full bg-rose-500/20 border border-rose-500/50 animate-pulse"></div>
                     )}
                   </div>
                 ))}
               </div>

               {/* Pose Estimation Stick Figures (Simulated) */}
               {engineActive && (
                 <div className="absolute inset-0 z-20">
                   {[...Array(15)].map((_, i) => {
                     // In emergency, poses become horizontal/erratic
                     const isFallen = emergencyTriggered && Math.random() > 0.4;
                     return (
                       <div 
                         key={i} 
                         className={`absolute border-2 rounded ${
                           isFallen ? 'border-rose-500 bg-rose-500/20' : 'border-emerald-500 bg-emerald-500/10'
                         }`}
                         style={{
                           left: `${Math.random()*80}%`,
                           top: `${Math.random()*60 + 20}%`,
                           width: isFallen ? '40px' : '20px',
                           height: isFallen ? '20px' : '60px',
                           transform: `rotate(${isFallen ? Math.random()*45 - 20 : Math.random()*10 - 5}deg)`,
                           transition: 'all 0.5s ease'
                         }}
                       >
                         {/* Skeleton Head */}
                         <div className={`absolute -top-3 left-1/2 -ml-2 w-4 h-4 rounded-full border-2 ${isFallen ? 'border-rose-500' : 'border-emerald-500'}`}></div>
                         
                         {isFallen && (
                           <div className="absolute -top-6 -right-6 text-[8px] bg-rose-600 text-white font-black px-1 rounded animate-ping">
                             CRUSH
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               )}

               {/* Emergency Overlay */}
               {emergencyTriggered && (
                 <div className="absolute inset-0 z-30 flex items-center justify-center bg-rose-900/40 backdrop-blur-sm border-8 border-rose-600 animate-pulse">
                   <div className="bg-black/90 p-6 border-2 border-rose-500 text-center shadow-[0_0_50px_rgba(225,29,72,0.8)]">
                     <span className="text-6xl mb-2 block">🛑</span>
                     <h2 className="font-black text-rose-500 text-2xl uppercase tracking-widest leading-none mb-1">Emergency Halt</h2>
                     <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest mb-4">Life-Safety Protocol Engaged</p>
                     
                     <div className="space-y-1 text-left text-[9px] font-mono text-white">
                       <p className="border-b border-rose-900 pb-1">❯ PA System: Muted</p>
                       <p className="border-b border-rose-900 pb-1">❯ Work Lights: 100% Output</p>
                       <p>❯ Security Teams: Dispatched to Sector 4</p>
                     </div>
                   </div>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrowdCrushPrevention;
