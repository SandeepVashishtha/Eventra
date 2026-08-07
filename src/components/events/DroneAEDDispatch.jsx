/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneAEDDispatch = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState('STANDBY'); // STANDBY, SCRAMBLE, EN_ROUTE, HOVERING, TETHER_DROPPED
  const [droneAlt, setDroneAlt] = useState(0); // feet
  const [distance, setDistance] = useState(0); // meters
  
  const [medLog, setMedLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'AeroMed Drone Network online. 4 AED payloads armed at Base.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Listening for Attendee SOS beacons.' }
  ]);

  useEffect(() => {
    let loop;
    if (dispatchStatus === 'SCRAMBLE') {
      loop = setInterval(() => {
        setDroneAlt(prev => {
          const next = prev + 15;
          if (next >= 120) {
            setDispatchStatus('EN_ROUTE');
            clearInterval(loop);
          }
          return next;
        });
      }, 200);
    } else if (dispatchStatus === 'EN_ROUTE') {
      loop = setInterval(() => {
        setDistance(prev => {
          const next = prev - 45;
          if (next <= 0) {
            setDispatchStatus('HOVERING');
            clearInterval(loop);
          }
          return Math.max(0, next);
        });
      }, 400);
    } else if (dispatchStatus === 'HOVERING') {
      setTimeout(() => {
        setDispatchStatus('TETHER_DROPPED');
        addLog('SUCCESS', 'AED tether successfully lowered to bystanders at GPS coordinates.');
      }, 2000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [dispatchStatus]);

  const triggerSOS = () => {
    if (systemActive && dispatchStatus === 'STANDBY') {
      setDistance(850); // Target is 850m away
      addLog('CRIT', 'CARDIAC ARREST SOS RECEIVED. Location: Center Pit, Main Stage.');
      
      setTimeout(() => {
        addLog('ACTION', 'Auto-scrambling AeroMed Drone 01. Bypassing manual authorization.');
        setDispatchStatus('SCRAMBLE');
      }, 500);
    }
  };

  const resetDrone = () => {
    setDispatchStatus('STANDBY');
    setDroneAlt(0);
    setDistance(0);
    addLog('SYS', 'Drone 01 recovered. AED reloaded. Standing by for next dispatch.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Medical Dispatch AI initialized. Crowd monitoring active.');
    } else {
      setSystemActive(false);
      setDispatchStatus('STANDBY');
      setDroneAlt(0);
      setDistance(0);
      addLog('WARN', 'Autonomous Medevac offline. Reverting to foot patrols.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setMedLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080305] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Medical Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚁</span> Autonomous Aerial Medevac
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Aerial Drone <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">AED Dispatch</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When an attendee suffers cardiac arrest in the middle of a dense 80,000-person crowd, it routinely takes paramedics 15+ minutes to physically push through the bodies, which is often fatal. Eventra solves this with rapid aerial logistics. If the system receives an SOS ping, an autonomous drone carrying an Automated External Defibrillator (AED) instantly scrambles from a launchpad. It flies directly over the crowd, hovers above the GPS coordinate, and lowers the AED via a tether directly to bystanders in under 60 seconds.
          </p>

          <div className="bg-[#0f0508] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🛰️</span> AeroMed Command
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-700 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(190,18,60,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Auto-Launch' : 'Arm Aerial Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Fleet Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dispatchStatus === 'STANDBY' ? 'bg-slate-900 border-slate-800' :
                 dispatchStatus === 'TETHER_DROPPED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 'bg-rose-950/40 border-rose-500/50 shadow-inner'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Drone 01 Status</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     dispatchStatus === 'STANDBY' ? 'text-slate-600' :
                     dispatchStatus === 'TETHER_DROPPED' ? 'text-emerald-400' : 'text-rose-500'
                   }`}>
                     {dispatchStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {dispatchStatus === 'STANDBY' ? 'Armed & Ready' : 
                      dispatchStatus === 'SCRAMBLE' ? 'Ascending to 120ft' : 
                      dispatchStatus === 'EN_ROUTE' ? 'Navigating to Target' :
                      dispatchStatus === 'HOVERING' ? 'Deploying Tether' : 'AED Delivered'}
                   </span>
                 </div>
               </div>

               {/* Telemetry */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center space-y-3">
                 
                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Altitude (AGL)</span>
                     <span className="text-xs font-mono font-bold text-cyan-400">{droneAlt} ft</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min(100, (droneAlt / 150) * 100)}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Distance to Target</span>
                     <span className={`text-xs font-mono font-bold ${dispatchStatus !== 'STANDBY' ? 'text-rose-400' : 'text-slate-600'}`}>
                       {distance} m
                     </span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.min(100, (distance / 1000) * 100)}%` }}></div>
                   </div>
                 </div>

               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Dispatch Event Log</span>
                 {dispatchStatus !== 'STANDBY' && dispatchStatus !== 'TETHER_DROPPED' && <span className="text-rose-500 animate-pulse">EMERGENCY FLIGHT</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {medLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Drone Flight Visualizer & App (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[6px] border-[#111] shadow-2xl relative flex flex-col h-[320px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300 ${
              dispatchStatus !== 'STANDBY' ? 'shadow-[0_0_50px_rgba(225,29,72,0.3)] border-slate-800' : ''
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none bg-black/60 backdrop-blur-sm border-b border-white/10 flex justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest ${dispatchStatus !== 'STANDBY' ? 'text-rose-500' : 'text-slate-400'}`}>
                  Drone 01 : Nose Camera
                </span>
                {dispatchStatus !== 'STANDBY' && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>}
              </div>

              <div className="flex-1 relative flex items-center justify-center bg-[#02050a] overflow-hidden perspective-[1000px]">
                
                {/* Simulated Crowd View */}
                <div className="absolute inset-0 bg-black z-0">
                   <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] mix-blend-screen pointer-events-none"></div>
                   
                   {dispatchStatus !== 'STANDBY' && (
                     <div className={`w-full h-full transition-transform duration-[4000ms] ease-linear ${
                       dispatchStatus === 'SCRAMBLE' ? 'scale-50 opacity-0' :
                       dispatchStatus === 'EN_ROUTE' ? 'scale-110 opacity-60' : 'scale-150 opacity-80'
                     }`}>
                       {/* Abstract crowd representation */}
                       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] transform rotate-x-[45deg]"></div>
                       
                       {/* Target Beacon */}
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                         <div className="w-16 h-16 border-4 border-rose-600 rounded-full animate-ping opacity-50"></div>
                         <span className="absolute text-3xl">📍</span>
                       </div>
                     </div>
                   )}
                </div>

                {/* HUD Overlay */}
                {dispatchStatus !== 'STANDBY' && (
                  <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 pb-8 opacity-80">
                    <div className="flex justify-between items-start mt-8">
                       <div className="text-[10px] font-mono text-cyan-400">
                         <div className="border-l-2 border-cyan-400 pl-1 mb-1">ALT: {Math.floor(droneAlt)}</div>
                         <div className="border-l-2 border-cyan-400 pl-1 mb-1">SPD: {dispatchStatus === 'EN_ROUTE' ? '42' : '00'}</div>
                       </div>
                       <div className="w-8 h-8 border-2 border-rose-500 rounded-full flex items-center justify-center">
                         <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                       </div>
                    </div>
                    
                    {dispatchStatus === 'HOVERING' && (
                      <div className="text-center text-rose-500 font-black text-2xl tracking-widest animate-pulse border-y-2 border-rose-500 py-2 bg-black/50">
                        DEPLOYING TETHER
                      </div>
                    )}
                    
                    {dispatchStatus === 'TETHER_DROPPED' && (
                      <div className="text-center text-emerald-500 font-black text-xl tracking-widest border-y-2 border-emerald-500 py-2 bg-black/50">
                        AED DELIVERED
                      </div>
                    )}
                    
                    <div className="w-full flex justify-center mb-4">
                      <div className="w-32 h-1 bg-white/20">
                        <div className="h-full bg-white/60 w-1/3 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                )}

                {dispatchStatus === 'STANDBY' && (
                  <div className="text-center opacity-30 z-10 flex flex-col items-center justify-center h-full">
                    <span className="text-4xl block mb-2">🚁</span>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Docked at Base</p>
                  </div>
                )}

              </div>
            </div>

            {/* User Interaction Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerSOS}
                disabled={!systemActive || dispatchStatus !== 'STANDBY'}
                className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border flex flex-col items-center justify-center ${
                  !systemActive || dispatchStatus !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-rose-950/40 border-rose-900 text-rose-500 hover:bg-rose-900/60'
                }`}
              >
                <span className="text-xl mb-1">🚨</span>
                Simulate SOS Ping
              </button>
              
              <button 
                onClick={resetDrone}
                disabled={dispatchStatus !== 'TETHER_DROPPED'}
                className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  dispatchStatus !== 'TETHER_DROPPED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Recover Drone
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DroneAEDDispatch;
