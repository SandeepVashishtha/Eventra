/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneMedicalDispatch = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [dispatchState, setDispatchState] = useState('STANDBY'); // STANDBY, SCRAMBLE, EN_ROUTE, DEPLOYING_PAYLOAD
  
  // Mission Telemetry
  const [targetPayload, setTargetPayload] = useState('None');
  const [droneAltitude, setDroneAltitude] = useState(0); // feet
  const [etaToTarget, setEtaToTarget] = useState(0); // seconds
  const [tetherLength, setTetherLength] = useState(0); // feet
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:15:00', type: 'SYS', msg: 'Heavy-Lift UAV MedEvac fleet online.' },
    { id: 2, time: '23:15:02', type: 'SYS', msg: 'Listening for SOS API triggers from attendee devices.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemActive && dispatchState === 'SCRAMBLE') {
      let takeoffAlt = 0;
      loop = setInterval(() => {
        takeoffAlt += 25;
        setDroneAltitude(takeoffAlt);
        
        if (takeoffAlt >= 150) {
          clearInterval(loop);
          setDispatchState('EN_ROUTE');
          addLog('SYS', 'UAV reached cruising altitude (150ft). Navigating to SOS coordinates.');
        }
      }, 300);
    } else if (dispatchState === 'EN_ROUTE') {
      loop = setInterval(() => {
        setEtaToTarget(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setDispatchState('DEPLOYING_PAYLOAD');
            addLog('ACTION', 'UAV hovering above SOS target. Initiating payload drop.');
            return 0;
          }
          return next;
        });
      }, 1000);
    } else if (dispatchState === 'DEPLOYING_PAYLOAD') {
      let tether = 0;
      loop = setInterval(() => {
        tether += 15;
        setTetherLength(tether);
        
        if (tether >= 145) {
          clearInterval(loop);
          addLog('SUCCESS', `Payload (${targetPayload}) successfully delivered to ground level.`);
          addLog('SYS', 'Tether retracting. UAV returning to base.');
          
          setTimeout(() => {
            resetMission();
          }, 3000);
        }
      }, 400);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, dispatchState]);

  const triggerSOS = (payloadType, distanceSecs) => {
    if (systemActive && dispatchState === 'STANDBY') {
      setTargetPayload(payloadType);
      setEtaToTarget(distanceSecs);
      setDispatchState('SCRAMBLE');
      addLog('CRIT', `SOS RECEIVED: Deep Crowd Zone. Dispatching ${payloadType}.`);
      addLog('ACTION', 'MedEvac UAV-01 scrambled. Launching from Medical Tent HQ.');
    }
  };

  const resetMission = () => {
    setDispatchState('STANDBY');
    setTargetPayload('None');
    setDroneAltitude(0);
    setEtaToTarget(0);
    setTetherLength(0);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'UAV Emergency Dispatch Armed. Awaiting SOS signals.');
    } else {
      setSystemActive(false);
      resetMission();
      addLog('WARN', 'UAV fleet grounded. Medics relying entirely on foot/ATV transport.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Dispatch Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚁</span> Autonomous MedEvac
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Drone-Delivered Emergency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">Medical Dispatch</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            In life-or-death situations such as overdoses or anaphylaxis, paramedics on foot or ATVs cannot push through 50,000 tightly packed attendees fast enough to administer life-saving drugs. Eventra solves this by integrating a heavy-lift drone API directly into the app's SOS feature. When an attendee triggers a medical emergency, a UAV instantly launches from the medical tent carrying Narcan, Epipens, or an AED. It flies directly over the crowd to the user's precise GPS beacon and lowers the payload via a tether in under 60 seconds, saving vital time.
          </p>

          <div className="bg-[#140b0b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🛰️</span> UAV Mission Control
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Ground UAV Fleet' : 'Arm MedEvac Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Mission Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 col-span-1 ${
                 dispatchState !== 'STANDBY' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 systemActive ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Payload Status
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     dispatchState !== 'STANDBY' ? 'text-red-400 animate-pulse' :
                     systemActive ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? (dispatchState !== 'STANDBY' ? 'DEPLOYED' : 'SECURE') : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {targetPayload}
                   </span>
                 </div>
               </div>

               {/* Drone Altitude */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dispatchState !== 'STANDBY' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Flight Altitude
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     dispatchState !== 'STANDBY' ? 'text-white' : 'text-slate-600'
                   }`}>
                     {systemActive ? Math.floor(droneAltitude) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ft</span>
                 </div>
               </div>
               
               {/* ETA */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dispatchState === 'EN_ROUTE' ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   T-Minus ETA
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     dispatchState === 'EN_ROUTE' ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? etaToTarget : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">sec</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Dispatch & Flight Log</span>
                 {dispatchState === 'SCRAMBLE' && <span className="text-red-500 animate-pulse">Launching...</span>}
                 {dispatchState === 'DEPLOYING_PAYLOAD' && <span className="text-cyan-400 animate-pulse">Lowering Tether...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 'text-slate-400'
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
            
            {/* Airspace Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">MEDEVAC CAMERA FEED</span>
                <span className="text-[8px] font-mono text-slate-400">TETHER CAM</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center">
                
                {/* Background Crowd (Dark, noisy) */}
                <div className="absolute inset-0 bg-slate-900 z-0">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
                    <filter id="noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" fill="none" />
                  </svg>
                  {/* Spotlight on target */}
                  {dispatchState === 'DEPLOYING_PAYLOAD' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 blur-xl rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Drone Visualization */}
                <div className="relative w-full h-full flex flex-col items-center z-20">
                   
                   {dispatchState === 'STANDBY' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                        <span className="text-4xl grayscale">🚁</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 bg-black/50 px-2 py-1 rounded">ON PAD</span>
                     </div>
                   )}

                   {dispatchState === 'SCRAMBLE' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl animate-bounce">🚁</span>
                        <div className="w-16 h-4 mt-8 border-2 border-red-500 rounded-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-red-500/30"></div>
                           <div className="absolute top-0 bottom-0 left-0 bg-red-500 transition-all duration-300" style={{ width: `${(droneAltitude / 150) * 100}%` }}></div>
                        </div>
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">ASCENDING</span>
                     </div>
                   )}

                   {dispatchState === 'EN_ROUTE' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative">
                          {/* Crosshair */}
                          <div className="w-32 h-32 border-2 border-orange-500/50 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-full h-px bg-orange-500/50"></div>
                            <div className="h-full w-px bg-orange-500/50 absolute left-1/2"></div>
                          </div>
                          
                          {/* Map Simulation */}
                          <div className="w-48 h-48 border border-slate-700 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden relative">
                             {/* Target ping */}
                             <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#ef4444] animate-ping"></div>
                             
                             {/* Drone moving to center */}
                             <div className="absolute bg-white w-3 h-3 rounded-full shadow-[0_0_10px_#ffffff]"
                                  style={{
                                    top: '50%',
                                    left: `${50 - (etaToTarget * 2)}%`,
                                    transition: 'left 1s linear'
                                  }}
                             ></div>
                          </div>
                        </div>
                     </div>
                   )}

                   {dispatchState === 'DEPLOYING_PAYLOAD' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-start pt-8">
                        {/* Drone base */}
                        <div className="w-24 h-4 bg-slate-800 rounded-b-xl border-b-2 border-slate-600 relative z-30 flex justify-center">
                           {/* Winch */}
                           <div className="w-6 h-4 bg-slate-700 absolute -bottom-2 rounded-b"></div>
                        </div>
                        
                        {/* Tether Line */}
                        <div className="w-[2px] bg-white/80 z-20 transition-all duration-[400ms]" style={{ height: `${tetherLength}px` }}></div>
                        
                        {/* Payload Box */}
                        <div className="w-10 h-10 bg-red-600 border-2 border-red-400 rounded-md z-30 shadow-[0_0_20px_rgba(220,38,38,0.6)] flex items-center justify-center transition-all duration-[400ms]" style={{ transform: `translateY(${tetherLength > 0 ? 0 : -20}px)` }}>
                           <span className="text-[14px] font-black text-white">✚</span>
                        </div>
                        
                        {/* Ground Target UI */}
                        <div className="absolute bottom-10 flex flex-col items-center">
                           <div className="w-16 h-4 border-2 border-cyan-400 rounded-full animate-ping opacity-50"></div>
                           <span className="text-[8px] font-black text-cyan-400 tracking-widest mt-2 bg-black/80 px-2 py-1 rounded">SOS BEACON</span>
                        </div>
                     </div>
                   )}

                </div>
                
                {/* HUD Overlay */}
                {systemActive && (
                  <>
                    <div className="absolute top-8 left-4 text-[8px] font-mono text-emerald-400 flex flex-col">
                      <span>BAT: 94%</span>
                      <span>SIG: STRONG</span>
                    </div>
                    <div className="absolute top-8 right-4 text-[8px] font-mono text-emerald-400 flex flex-col items-end">
                      <span>ALT: {droneAltitude}FT</span>
                      <span>SPD: {dispatchState === 'EN_ROUTE' ? '45KTS' : '0KTS'}</span>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#140b0b] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject SOS Beacons</span>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <button 
                   onClick={() => triggerSOS("NARCAN KITS", 12)}
                   disabled={!systemActive || dispatchState !== 'STANDBY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !systemActive || dispatchState !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-900 text-purple-400 hover:bg-purple-900/60'
                   }`}
                 >
                   Inject Overdose SOS
                 </button>
                 
                 <button 
                   onClick={() => triggerSOS("AED + EPIPEN", 18)}
                   disabled={!systemActive || dispatchState !== 'STANDBY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !systemActive || dispatchState !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                   }`}
                 >
                   Inject Cardiac SOS
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DroneMedicalDispatch;
