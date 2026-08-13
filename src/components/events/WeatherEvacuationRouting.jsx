/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WeatherEvacuationRouting = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Meteorological Metrics
  const [stormDistance, setStormDistance] = useState(25); // miles
  const [lightningStrikes, setLightningStrikes] = useState(0); 
  const [exitFlowRate, setExitFlowRate] = useState(0); // people / min
  const [activeEvacuees, setActiveEvacuees] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'NOAA Doppler Radar API connection established.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Monitoring regional mesocyclone activity.' }
  ]);

  // Visualizer State
  const [appState, setAppState] = useState('CLEAR'); // CLEAR, WARNING, EVACUATING
  const [stormPosition, setStormPosition] = useState({ x: -20, y: -20 });
  const [evacRoutes, setEvacRoutes] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive && appState !== 'CLEAR') {
      loop = setInterval(() => {
          
          if (appState === 'WARNING') {
              setStormDistance(prev => Math.max(8, prev - 0.5));
              setLightningStrikes(prev => prev + Math.floor(Math.random() * 3));
              setStormPosition(prev => ({ x: prev.x + 2, y: prev.y + 2 }));
              
              if (stormDistance < 10) {
                  triggerEvacuation();
              }
          } else if (appState === 'EVACUATING') {
              setStormDistance(prev => Math.max(0, prev - 0.2));
              setLightningStrikes(prev => prev + Math.floor(Math.random() * 8));
              setStormPosition(prev => ({ x: prev.x + 1, y: prev.y + 1 }));
              
              setExitFlowRate(2450 + Math.floor(Math.random() * 200));
              setActiveEvacuees(prev => Math.min(85000, prev + exitFlowRate / 60)); // Simulate people leaving per second
          }

      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, appState, stormDistance, exitFlowRate]);

  const simulateStorm = () => {
      if (!systemActive || appState !== 'CLEAR') return;
      
      setAppState('WARNING');
      setStormDistance(15);
      setLightningStrikes(12);
      setStormPosition({ x: -10, y: -10 }); // Start top-left moving towards center
      addLog('WARN', 'NOAA Alert: Severe supercell approaching from Northwest.');
      addLog('SYS', 'Calculating trajectory and wind vectors for impact probability.');
  };

  const triggerEvacuation = () => {
      setAppState('EVACUATING');
      setEvacRoutes([
          { zone: 'MAIN_STAGE', exit: 'NORTH_GATE', active: true, color: '#facc15' }, // Yellow
          { zone: 'NEON_TENT', exit: 'EAST_GATE', active: true, color: '#f97316' }, // Orange
          { zone: 'CAMPING', exit: 'WEST_GATE', active: false, color: '#ef4444' } // Red (Delaying to prevent gridlock)
      ]);
      
      addLog('CRIT', 'STORM INGRESS < 10 MILES. LIGHTNING RISK IMMINENT.');
      addLog('ACTION', 'Initiating staggered evacuation routing protocol.');
      
      // Simulate staggered routing
      setTimeout(() => {
          if (!systemActive) return;
          addLog('SYS', 'North & East gates clear. Re-routing Camping Zone to West Gate.');
          setEvacRoutes(prev => prev.map(r => r.zone === 'CAMPING' ? { ...r, active: true } : { ...r, active: false }));
      }, 5000);
  };

  const resetSystem = () => {
      setAppState('CLEAR');
      setStormDistance(25);
      setLightningStrikes(0);
      setExitFlowRate(0);
      setActiveEvacuees(0);
      setStormPosition({ x: -20, y: -20 });
      setEvacRoutes([]);
      addLog('SUCCESS', 'All Clear received from meteorology. Resuming standard operations.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Dynamic Evacuation Engine Armed.');
    } else {
      setSystemActive(false);
      resetSystem();
      addLog('WARN', 'Evacuation Engine Offline. Defaulting to generic PA announcements.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛈️</span> Emergency Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-time Weather <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">Evacuation Routing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            In the event of a severe lightning storm, directing 100,000 people to their cars simultaneously via a generic PA announcement causes dangerous gridlock, panic, and bottlenecks in exposed areas. Eventra solves this by integrating live NOAA Doppler radar APIs directly into the crowd management system. If a storm is approaching, the system calculates the exact trajectory and wind vectors. It then dynamically updates the app UI and physical digital signage to route specific zones of the festival to different exits in a staggered formation, keeping attendees moving away from the highest-risk lightning zones.
          </p>

          <div className="bg-[#050a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🎛️</span> Doppler Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Routing Engine' : 'Engage API Polling'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Storm Distance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 appState === 'EVACUATING' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' : 
                 appState === 'WARNING' ? 'bg-yellow-950/40 border-yellow-500/50' :
                 systemActive ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Storm Proximity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     appState === 'EVACUATING' ? 'text-red-400' : 
                     appState === 'WARNING' ? 'text-yellow-400' : 'text-sky-400'
                   }`}>
                     {systemActive ? stormDistance.toFixed(1) : '--'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mi</span>
                 </div>
               </div>

               {/* Lightning Strikes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 lightningStrikes > 50 ? 'bg-yellow-950/40 border-yellow-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Strike Count
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     lightningStrikes > 50 ? 'text-yellow-400' : 'text-slate-300'
                   }`}>
                     {lightningStrikes}
                   </span>
                 </div>
               </div>
               
               {/* Exit Flow Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 appState === 'EVACUATING' ? 'bg-emerald-950/40 border-emerald-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Egress Flow
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         appState === 'EVACUATING' ? 'text-emerald-400' : 'text-slate-600'
                       }`}>
                         {exitFlowRate}
                       </span>
                     </div>
                     <span className="text-[8px] font-bold text-slate-500 uppercase">Pax / Min</span>
                 </div>
               </div>
               
               {/* Active Evacuees */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 appState === 'EVACUATING' ? 'bg-indigo-950/40 border-indigo-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Safe Egress
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     appState === 'EVACUATING' ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {(activeEvacuees / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010205] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Routing Orchestration Ledger</span>
                 {appState === 'EVACUATING' && <span className="text-red-400 font-black animate-pulse">EVACUATION PROTOCOL ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' : 'text-slate-400'
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
            
            {/* Map Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#050a12]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">DOPPLER RADAR OVERLAY</span>
                <span className="text-[8px] font-mono text-slate-400">FESTIVAL GROUNDS</span>
              </div>

              <div className="flex-1 relative overflow-hidden bg-slate-950">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">MAP OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20">
                        
                        {/* Map Grid / Base */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        {/* Festival Zones */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-slate-700 rounded-2xl bg-slate-900/50 p-4">
                            
                            {/* Main Stage */}
                            <div className={`absolute top-4 left-4 w-16 h-16 rounded border ${
                                evacRoutes.find(r => r.zone === 'MAIN_STAGE')?.active ? 'bg-yellow-900/50 border-yellow-500' : 'bg-slate-800 border-slate-600'
                            }`}>
                                <span className="text-[6px] font-black text-slate-400 absolute bottom-1 right-1">MAIN</span>
                            </div>
                            
                            {/* Neon Tent */}
                            <div className={`absolute top-4 right-4 w-12 h-20 rounded-full border ${
                                evacRoutes.find(r => r.zone === 'NEON_TENT')?.active ? 'bg-orange-900/50 border-orange-500' : 'bg-slate-800 border-slate-600'
                            }`}>
                                <span className="text-[6px] font-black text-slate-400 absolute bottom-2 right-2">TENT</span>
                            </div>

                            {/* Camping */}
                            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 rounded border ${
                                evacRoutes.find(r => r.zone === 'CAMPING')?.active ? 'bg-red-900/50 border-red-500' : 'bg-slate-800 border-slate-600'
                            }`}>
                                <span className="text-[6px] font-black text-slate-400 absolute top-1 left-2">CAMPING</span>
                            </div>

                        </div>

                        {/* Exits & Routing Arrows */}
                        {evacRoutes.map((route, i) => {
                            if (!route.active) return null;
                            
                            let startPath, exitPos, labelPos;
                            if (route.exit === 'NORTH_GATE') {
                                startPath = "M 40 40 Q 40 10 50 5";
                                exitPos = { top: '0', left: '45%' };
                                labelPos = 'NORTH EXIT';
                            } else if (route.exit === 'EAST_GATE') {
                                startPath = "M 80 50 Q 95 50 95 40";
                                exitPos = { top: '35%', right: '0' };
                                labelPos = 'EAST EXIT';
                            } else {
                                startPath = "M 50 80 Q 10 80 5 70";
                                exitPos = { bottom: '25%', left: '0' };
                                labelPos = 'WEST EXIT';
                            }

                            return (
                                <React.Fragment key={i}>
                                    {/* Exit Marker */}
                                    <div className="absolute w-12 h-4 bg-emerald-900/80 border border-emerald-500 text-[5px] font-black text-emerald-400 flex items-center justify-center rounded-sm z-30 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" style={exitPos}>
                                        {labelPos}
                                    </div>
                                    
                                    {/* Routing Arrow (SVG SVG ViewBox assumes 0-100 percentages essentially) */}
                                    <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path 
                                            d={startPath} 
                                            fill="none" 
                                            stroke={route.color} 
                                            strokeWidth="2" 
                                            strokeDasharray="4 4" 
                                            className="animate-dash"
                                            style={{ animation: 'dash 1s linear infinite' }}
                                        />
                                        <style>{`
                                            @keyframes dash {
                                                to { stroke-dashoffset: -8; }
                                            }
                                        `}</style>
                                    </svg>
                                </React.Fragment>
                            )
                        })}

                        {/* Doppler Radar Simulation Blob */}
                        {appState !== 'CLEAR' && (
                            <div 
                                className="absolute w-64 h-64 rounded-full mix-blend-screen pointer-events-none transition-all duration-1000 ease-linear"
                                style={{
                                    left: `${stormPosition.x}%`,
                                    top: `${stormPosition.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    background: 'radial-gradient(circle, rgba(220,38,38,0.6) 0%, rgba(234,179,8,0.4) 40%, rgba(34,197,94,0.2) 70%, transparent 100%)',
                                    filter: 'blur(10px)'
                                }}
                            >
                                {/* Lightning flashes inside the blob */}
                                {Math.random() > 0.7 && (
                                    <div className="absolute inset-0 bg-white/40 rounded-full animate-ping duration-75 mix-blend-overlay"></div>
                                )}
                            </div>
                        )}

                        {/* Overlay Warning */}
                        {appState === 'EVACUATING' && (
                            <div className="absolute top-12 inset-x-4 bg-red-600/90 backdrop-blur-sm border-2 border-white rounded-lg p-2 text-center z-50 animate-in slide-in-from-top-4 duration-300">
                                <span className="text-white font-black uppercase text-[10px] tracking-widest block mb-1">STORM EVACUATION ACTIVE</span>
                                <span className="text-red-100 text-[8px]">Please follow staggered exit routes on your app.</span>
                            </div>
                        )}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Meteorological Events</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={simulateStorm}
                   disabled={!systemActive || appState !== 'CLEAR'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || appState !== 'CLEAR' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-yellow-950/40 border-yellow-600 text-yellow-400 hover:bg-yellow-900/60 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                   }`}
                 >
                   🌪️ Spawn Supercell
                 </button>
                 
                 <button 
                   onClick={resetSystem}
                   disabled={!systemActive || appState === 'CLEAR'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || appState === 'CLEAR' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-sky-950/40 border-sky-600 text-sky-400 hover:bg-sky-900/60 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                   }`}
                 >
                   ☀️ Issue All-Clear
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WeatherEvacuationRouting;
