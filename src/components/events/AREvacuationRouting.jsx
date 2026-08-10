/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AREvacuationRouting = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [evacState, setEvacState] = useState('NOMINAL'); // NOMINAL, CALCULATING, EVACUATING, CLEAR
  
  // Telemetry Metrics
  const [crowdDensity, setCrowdDensity] = useState(85); // %
  const [activeARUsers, setActiveARUsers] = useState(0); 
  const [estimatedClearTime, setEstimatedClearTime] = useState(0); // mins
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Crowd-Flow Fluid Dynamics AI Online.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting emergency weather telemetry.' }
  ]);

  // Visualizer State
  const [arArrows, setArArrows] = useState([]);
  const [alertType, setAlertType] = useState(null);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (evacState === 'NOMINAL') {
              setCrowdDensity(prev => {
                  let next = prev + (Math.random() * 4 - 2);
                  return next > 95 ? 95 : next < 40 ? 40 : next;
              });
          } else if (evacState === 'EVACUATING') {
              setCrowdDensity(prev => Math.max(0, prev - 1.5));
              setEstimatedClearTime(prev => Math.max(0, prev - 0.2));
              
              if (crowdDensity <= 2) {
                  setEvacState('CLEAR');
                  setArArrows([]);
                  addLog('SUCCESS', 'Grounds cleared. All attendees safely evacuated.');
              }
              
              // Animate AR routing arrows
              setArArrows(prev => {
                  if (prev.length < 5) {
                      return [...prev, { id: Date.now(), progress: 0 }];
                  }
                  return prev.map(a => ({ ...a, progress: a.progress + 5 })).filter(a => a.progress < 100);
              });
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, evacState, crowdDensity]);

  const triggerEvac = (type) => {
    if (!systemActive || evacState !== 'NOMINAL') return;
    
    setEvacState('CALCULATING');
    setAlertType(type);
    
    if (type === 'LIGHTNING') {
        addLog('CRIT', 'SEVERE WEATHER: Lightning strike detected within 5 miles.');
    } else {
        addLog('CRIT', 'EMERGENCY: Main Gate crowd crush detected.');
    }
    
    addLog('AI', 'Calculating individualized fluid-dynamic escape vectors...');
    
    setTimeout(() => {
        setEvacState('EVACUATING');
        setEstimatedClearTime(15.4);
        addLog('ACTION', 'Pushing dynamic AR routing overlays to 14,202 connected wearables/phones.');
        addLog('SYS', 'Rerouting users away from bottlenecks toward secondary exits.');
    }, 2000);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveARUsers(14202);
      setCrowdDensity(85);
      setEvacState('NOMINAL');
      setAlertType(null);
      addLog('SYS', 'AR Wearable API Connected. Fluid Dynamics mesh generated.');
    } else {
      setSystemActive(false);
      setActiveARUsers(0);
      setEvacState('NOMINAL');
      setArArrows([]);
      addLog('WARN', 'AR Routing offline. Reverting to manual PA announcements.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚨</span> Crowd Fluid Dynamics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Evacuation Routing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">via AR Glasses</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During severe weather evacuations (e.g., lightning strikes), standard PA announcements cause panicked stampedes toward the main exits, ignoring closer, safer secondary emergency exits. Eventra solves this by integrating with AR wearables and mobile phone cameras. Our crowd-flow AI calculates the safest path for each individual based on their exact GPS coordinates and the density of nearby exits, rendering glowing, augmented reality arrows directing them away from bottlenecks.
          </p>

          <div className="bg-[#0f0a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🧭</span> Emergency Navigation HUD
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Fluid Dynamics AI' : 'Initialize Crowd AI'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Connected Wearables */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   AR Nodes Online
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeARUsers.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Crowd Density */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdDensity > 90 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Field Density
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crowdDensity > 90 ? 'text-red-400' :
                     systemActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(crowdDensity)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Est Clear Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 evacState === 'EVACUATING' ? 'bg-yellow-950/30 border-yellow-500/50 shadow-inner' :
                 evacState === 'CLEAR' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Clear Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     evacState === 'EVACUATING' ? 'text-yellow-400' :
                     evacState === 'CLEAR' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {estimatedClearTime.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Mins</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Emergency Telemetry Log</span>
                 {evacState === 'CALCULATING' && <span className="text-yellow-400 animate-pulse">GENERATING ROUTES...</span>}
                 {evacState === 'EVACUATING' && <span className="text-red-500 animate-pulse">EVACUATION IN PROGRESS</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' :
                       log.type === 'AI' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* AR Glasses Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-gradient-to-b from-black/80 to-transparent">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">AR WEARABLE VIEWPORT</span>
                <span className="text-[8px] font-mono text-slate-400">PASSTHROUGH ACTIVE</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">AR OVERLAYS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full flex flex-col relative z-20">
                      
                      {/* Background (Simulating real world passthrough) */}
                      <div className="absolute inset-0 bg-slate-800 opacity-30 z-0">
                          {/* Dark crowd silhouettes */}
                          <div className="absolute bottom-0 w-full h-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')] bg-bottom opacity-20 blur-[2px]"></div>
                      </div>

                      {/* AR UI Layer */}
                      <div className="absolute inset-0 z-30">
                          
                          {/* Alert Overlay */}
                          {(evacState === 'EVACUATING' || evacState === 'CALCULATING') && (
                              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full animate-pulse">
                                  <div className="inline-block bg-red-600/80 backdrop-blur-md border border-red-400 px-6 py-2 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                                      <span className="text-[14px] font-black uppercase text-white tracking-widest">
                                          {alertType === 'LIGHTNING' ? 'SEVERE WEATHER' : 'EMERGENCY EVACUATION'}
                                      </span>
                                  </div>
                              </div>
                          )}

                          {/* Dynamic Routing Arrows (Rendered in 3D perspective) */}
                          {evacState === 'EVACUATING' && (
                              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full h-1/2 perspective-[800px] flex items-end justify-center pointer-events-none">
                                  
                                  {/* Holographic path on the ground */}
                                  <div className="absolute bottom-0 w-32 h-64 bg-gradient-to-t from-red-500/0 via-red-500/40 to-transparent" style={{ transform: 'rotateX(60deg)' }}></div>

                                  {/* Flowing Chevron Arrows */}
                                  {arArrows.map(arrow => (
                                      <div 
                                          key={arrow.id}
                                          className="absolute bottom-0 text-red-500 font-bold opacity-0 transition-transform duration-100"
                                          style={{ 
                                              transform: `translateY(-${arrow.progress * 2}px) scale(${1 - arrow.progress/100})`,
                                              opacity: arrow.progress > 10 && arrow.progress < 90 ? 1 : 0,
                                              textShadow: '0 0 20px rgba(239,68,68,1)'
                                          }}
                                      >
                                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="18 15 12 9 6 15"></polyline>
                                          </svg>
                                      </div>
                                  ))}
                              </div>
                          )}

                          {/* Floating HUD Elements */}
                          {evacState === 'EVACUATING' && (
                              <>
                                  {/* Distance to exit */}
                                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/60 border-r-2 border-red-500 p-2 rounded backdrop-blur">
                                      <span className="text-[8px] font-mono text-red-400 block uppercase">Exit N2</span>
                                      <span className="text-xl font-black text-white">450ft</span>
                                  </div>

                                  {/* Reroute reason */}
                                  <div className="absolute bottom-4 left-4 bg-black/60 border-l-2 border-yellow-500 p-2 rounded backdrop-blur max-w-[120px]">
                                      <span className="text-[8px] font-mono text-yellow-400 block uppercase">AI OVERRIDE</span>
                                      <span className="text-[8px] text-white">Main gate heavily congested. Rerouting to North Exit 2.</span>
                                  </div>
                              </>
                          )}

                          {evacState === 'CLEAR' && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center animate-fade-in">
                                  <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] mx-auto mb-2">
                                      <span className="text-2xl">✅</span>
                                  </div>
                                  <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400">SAFE ZONE REACHED</span>
                              </div>
                          )}

                          {/* Standard HUD */}
                          {evacState === 'NOMINAL' && (
                              <div className="absolute top-4 right-4 bg-black/40 border border-slate-800 px-2 py-1 rounded backdrop-blur flex flex-col items-end">
                                  <span className="text-[7px] font-mono text-slate-500">AR PASSIVE</span>
                                  <span className="text-[10px] font-bold text-white">Main Stage</span>
                              </div>
                          )}

                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0f0a05] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Emergency Events</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvac('LIGHTNING')}
                   disabled={!systemActive || evacState !== 'NOMINAL'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || evacState !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-500 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   Weather Evac (Lightning)
                 </button>

                 <button 
                   onClick={() => triggerEvac('CRUSH')}
                   disabled={!systemActive || evacState !== 'NOMINAL'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || evacState !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                   }`}
                 >
                   Crowd Crush Detected
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AREvacuationRouting;
