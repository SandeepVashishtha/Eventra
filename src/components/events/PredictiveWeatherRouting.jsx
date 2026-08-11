/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveWeatherRouting = () => {
  const [radarActive, setRadarActive] = useState(false);
  const [stormDistance, setStormDistance] = useState(12.5); // miles
  const [timeToImpact, setTimeToImpact] = useState(45); // minutes
  const [evacuationTriggered, setEvacuationTriggered] = useState(false);
  
  const SAFETY_RADIUS_MILES = 5.0;

  const [weatherLog, setWeatherLog] = useState([
    { id: 1, time: '14:00:00', type: 'API', msg: 'Aviation-grade meteorological radar connected (Tomorrow.io).' },
    { id: 2, time: '14:00:05', type: 'SYS', msg: 'Monitoring 5-mile lightning safety radius for Main Stage.' }
  ]);

  useEffect(() => {
    let loop;
    if (radarActive && !evacuationTriggered) {
      loop = setInterval(() => {
        setStormDistance(prev => {
          const next = prev - (Math.random() * 0.4 + 0.1);
          
          // Calculate time based on distance closing speed (rough proxy)
          setTimeToImpact(Math.max(1, Math.floor(next * 3.5)));
          
          if (next <= SAFETY_RADIUS_MILES) {
            triggerEvac();
            return SAFETY_RADIUS_MILES;
          }
          return next;
        });
      }, 500); // Fast simulation
    }
    return () => clearInterval(loop);
  }, [radarActive, evacuationTriggered]);

  const triggerEvac = () => {
    setEvacuationTriggered(true);
    addLog('CRIT', 'LIGHTNING CELL BREACHED 5-MILE RADIUS.');
    addLog('ACTION', 'Auto-executing Pre-programmed Evacuation Protocol Alpha.');
    setTimeout(() => {
      addLog('SYS', 'Pushing alerts to 45,219 attendee devices. Overriding digital signage.');
    }, 800);
  };

  const startSimulation = () => {
    if (!radarActive) {
      setRadarActive(true);
      addLog('RADAR', 'Storm cell #402 tracking Northeast at 35mph. Monitoring trajectory.');
    } else if (evacuationTriggered) {
      // Reset
      setRadarActive(false);
      setEvacuationTriggered(false);
      setStormDistance(12.5);
      setTimeToImpact(45);
      addLog('SYS', 'Simulation reset to safe baseline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setWeatherLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/50 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌩️</span> Meteorological API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Weather <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Routing System</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Sudden lightning storms can be fatal at outdoor festivals. Relying on generic consumer weather apps is incredibly dangerous due to their lack of hyper-local precision. Eventra integrates with aviation-grade meteorological radar APIs. The system actively monitors a strict 5-mile safety radius around the stage. If a lightning cell breaches the threshold, it automatically triggers pre-programmed evacuation alerts to all attendee phones and digital signage.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">📡</span> High-Frequency Radar Telemetry
               </h3>
               
               <button 
                 onClick={startSimulation}
                 disabled={radarActive && !evacuationTriggered}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   radarActive && !evacuationTriggered ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                   evacuationTriggered ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' :
                   'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]'
                 }`}
               >
                 {radarActive && !evacuationTriggered ? 'Tracking Cell...' : evacuationTriggered ? 'Reset Simulation' : 'Simulate Storm Cell'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Distance Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stormDistance <= SAFETY_RADIUS_MILES + 2 && !evacuationTriggered ? 'bg-yellow-900/30 border-yellow-500/50' : 
                 evacuationTriggered ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Distance to Stage</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     evacuationTriggered ? 'text-red-500' : 
                     stormDistance <= SAFETY_RADIUS_MILES + 2 ? 'text-yellow-500' : 'text-slate-300'
                   }`}>
                     {stormDistance.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">mi</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${evacuationTriggered ? 'bg-red-500' : stormDistance <= SAFETY_RADIUS_MILES + 2 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${(stormDistance / 15) * 100}%` }}
                   ></div>
                 </div>
               </div>

               {/* Time to Impact Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 evacuationTriggered ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Est. Time to Breach</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     evacuationTriggered ? 'text-red-500' : 'text-slate-300'
                   }`}>
                     {evacuationTriggered ? '00' : timeToImpact}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">min</span>
                 </div>
                 
                 <div className="absolute top-3 right-3 flex items-center space-x-1">
                   <span className={`w-2 h-2 rounded-full ${radarActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                   <span className="text-[8px] font-bold text-slate-500 uppercase">Live Polling</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Aviation Weather API Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {weatherLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-red-500 font-black' : 
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' :
                       log.type === 'RADAR' ? 'text-sky-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Radar / Digital Signage Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-3xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/50 text-sky-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                NEXRAD Radar Overlay
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-[#051014] overflow-hidden">
               
               {/* Map Grid */}
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSIjMTEyMjMzIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-50 z-0"></div>

               {/* Stage Marker */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                 <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1 bg-black/50 px-1 rounded">Stage</span>
               </div>

               {/* 5-Mile Safety Radius */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                 <div className={`w-40 h-40 rounded-full border-2 border-dashed flex items-center justify-center transition-colors duration-300 ${
                   evacuationTriggered ? 'border-red-500 bg-red-500/10' : 'border-sky-500/50 bg-sky-500/5'
                 }`}>
                   {/* 10-Mile Radius ring */}
                   <div className="w-72 h-72 rounded-full border border-slate-700 absolute"></div>
                 </div>
               </div>

               {/* Simulated Storm Cell Blob */}
               {radarActive && (
                 <div 
                   className="absolute z-20 transition-all ease-linear"
                   style={{
                     left: '50%',
                     top: '50%',
                     transform: `translate(calc(-50% - ${stormDistance * 10}px), calc(-50% + ${stormDistance * 8}px))`,
                     transitionDuration: '500ms'
                   }}
                 >
                   {/* Multi-layered blob to look like radar */}
                   <div className="relative">
                     <div className="w-24 h-24 bg-red-500/30 rounded-full blur-xl absolute -left-12 -top-12"></div>
                     <div className="w-16 h-16 bg-yellow-500/50 rounded-full blur-lg absolute -left-8 -top-8"></div>
                     <div className="w-8 h-8 bg-red-600/80 rounded-full blur-md absolute -left-4 -top-4"></div>
                     {/* Lightning indicator */}
                     <span className="absolute -left-2 -top-2 text-xl animate-pulse">⚡</span>
                   </div>
                 </div>
               )}

               {/* Sweeping Radar Line */}
               {radarActive && (
                 <div className="absolute top-1/2 left-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent to-sky-500 origin-left animate-spin z-10 opacity-40 pointer-events-none" style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}></div>
               )}
               
               {/* Emergency Digital Signage Overlay */}
               {evacuationTriggered && (
                 <div className="absolute inset-0 bg-red-950/80 z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-fade-in border-[12px] border-red-600">
                   <div className="bg-black/80 w-full h-full rounded-lg border-4 border-red-500 flex flex-col items-center justify-center p-4">
                     <span className="text-7xl mb-4 animate-bounce">⛈️</span>
                     <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest leading-none mb-2">Severe Weather</h2>
                     <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-6">Evacuate Area</h3>
                     
                     <div className="space-y-3 w-full">
                       <div className="bg-red-900/50 border border-red-500/50 p-2 rounded text-[10px] font-mono text-white uppercase flex items-center justify-center">
                         <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                         Seek shelter in vehicles
                       </div>
                       <div className="bg-red-900/50 border border-red-500/50 p-2 rounded text-[10px] font-mono text-white uppercase flex items-center justify-center">
                         <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                         Avoid metal structures
                       </div>
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

export default PredictiveWeatherRouting;
