/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MagLevDJBooth = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [magLevState, setMagLevState] = useState('LOCKED'); // LOCKED, LEVITATING, COMPENSATING
  
  // Seismic & Magnetic Metrics
  const [stageSeismicForce, setStageSeismicForce] = useState(0); // Richter / Vibration units
  const [levitationGap, setLevitationGap] = useState(0); // mm
  const [magneticFlux, setMagneticFlux] = useState(0); // Tesla
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'MagLev Isolation Platform Online.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Turntable chassis physically locked to stage.' }
  ]);

  // Visualizer State
  const [tableShake, setTableShake] = useState(0);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (magLevState === 'LOCKED') {
              // Stage vibrates, table vibrates
              const baseShake = Math.random() * 4;
              setStageSeismicForce(baseShake);
              setTableShake(baseShake);
              setLevitationGap(0);
              setMagneticFlux(0);
          } else if (magLevState === 'LEVITATING') {
              // Stage vibrates, table does not
              const baseShake = Math.random() * 4;
              setStageSeismicForce(baseShake);
              setTableShake(0.1); // Micro-wobble only
              setLevitationGap(prev => Math.min(25, prev + 2)); // Levitate to 25mm
              setMagneticFlux(prev => Math.min(1.2, prev + 0.1));
          } else if (magLevState === 'COMPENSATING') {
              // Heavy bass drop, violent stage shake, table remains perfectly still
              const violentShake = 8 + (Math.random() * 6);
              setStageSeismicForce(violentShake);
              setTableShake(0); // Perfect isolation
              setLevitationGap(25);
              setMagneticFlux(1.8 + (Math.random() * 0.4)); // Flux working hard
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, magLevState]);

  const triggerEvent = (type) => {
    if (!systemActive) return;
    
    if (type === 'ENGAGE') {
        if (magLevState !== 'LOCKED') return;
        setMagLevState('LEVITATING');
        addLog('ACTION', 'Unlocking chassis. Engaging primary electromagnetic coils.');
        addLog('SYS', 'Levitation gap established at 25mm. Friction zeroed.');
    } else if (type === 'DROP') {
        if (magLevState !== 'LEVITATING') return;
        setMagLevState('COMPENSATING');
        addLog('CRIT', 'SUB-BASS TRANSIENT DETECTED. Stage experiencing violent seismic feedback.');
        addLog('AI', 'Active Vibration Cancellation (AVC) compensating at 1000Hz poll rate.');
        addLog('SUCCESS', 'Turntable analog needles 100% isolated. Zero skipping.');
        
        setTimeout(() => {
            if (systemActive) {
                setMagLevState('LEVITATING');
                addLog('SYS', 'Sub-bass transient passed. Returning to nominal levitation.');
            }
        }, 4000);
    } else if (type === 'DISENGAGE') {
        setMagLevState('LOCKED');
        addLog('WARN', 'Disengaging magnets. Chassis physically grounding to stage.');
        addLog('CRIT', 'WARNING: Analog equipment susceptible to seismic interference.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setMagLevState('LOCKED');
      addLog('SYS', 'Electromagnetic Levitation Rig powered and ready.');
    } else {
      setSystemActive(false);
      setMagLevState('LOCKED');
      setStageSeismicForce(0);
      setTableShake(0);
      setLevitationGap(0);
      setMagneticFlux(0);
      addLog('WARN', 'MagLev Offline. Hard-coupling to stage floor.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05090f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧲</span> Seismic Isolation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Magnetic Levitation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">DJ Booth Stabilizers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            At bass-heavy festivals, the physical vibration from the subwoofers shakes the stage so violently that the needles on the DJ's vinyl turntables skip, ruining the performance. Eventra solves this by suspending the entire DJ table via electromagnetic levitation (MagLev). Eventra interfaces with the electromagnets to actively counteract the seismic vibrations in real-time, providing a perfectly isolated, frictionless, zero-vibration surface for delicate analog equipment.
          </p>

          <div className="bg-[#0b101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🎛️</span> Electromagnetic Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Cut MagLev Power' : 'Charge Superconductors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Levitation Gap */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 levitationGap > 0 ? 'bg-sky-950/40 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Levitation Gap
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     levitationGap > 0 ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {levitationGap.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mm</span>
                 </div>
               </div>

               {/* Magnetic Flux */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 magneticFlux > 1.5 ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Magnetic Flux
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     magneticFlux > 1.5 ? 'text-indigo-400' :
                     magneticFlux > 0 ? 'text-sky-300' : 'text-slate-600'
                   }`}>
                     {magneticFlux.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">T</span>
                 </div>
               </div>
               
               {/* Stage Vibration */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stageSeismicForce > 5 ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Stage Vibration
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     stageSeismicForce > 5 ? 'text-red-500' :
                     systemActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {stageSeismicForce.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">G</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Active Vibration Log</span>
                 {magLevState === 'LEVITATING' && <span className="text-sky-400 animate-pulse">ISOLATED</span>}
                 {magLevState === 'COMPENSATING' && <span className="text-indigo-400 font-black animate-pulse">CANCELLING KINETICS...</span>}
                 {magLevState === 'LOCKED' && systemActive && <span className="text-red-500 font-black">HARD-COUPLED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* MagLev Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#080d16]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">DJ BOOTH CROSS-SECTION</span>
                <span className="text-[8px] font-mono text-slate-400">MAGLEV RIG</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col justify-end pt-12 pb-6">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SYSTEM UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-end items-center">
                      
                      {/* The Stage Floor (Shakes violently) */}
                      <div 
                          className="absolute bottom-0 inset-x-0 h-16 bg-slate-800 border-t-2 border-slate-600 flex justify-center items-start pt-2 z-10"
                          style={{
                              transform: `translate(${Math.random() * stageSeismicForce - stageSeismicForce/2}px, ${Math.random() * stageSeismicForce - stageSeismicForce/2}px)`
                          }}
                      >
                          <span className="text-[10px] font-mono text-slate-500">STAGE DECK</span>
                          
                          {/* Stage Subwoofers underneath */}
                          <div className="absolute -bottom-12 inset-x-0 flex justify-around">
                              <div className="w-16 h-16 bg-black rounded-t border-t border-slate-700 flex items-center justify-center">
                                  <div className={`w-10 h-10 border border-slate-700 rounded-full bg-slate-900 ${stageSeismicForce > 5 ? 'animate-ping' : ''}`}></div>
                              </div>
                              <div className="w-16 h-16 bg-black rounded-t border-t border-slate-700 flex items-center justify-center">
                                  <div className={`w-10 h-10 border border-slate-700 rounded-full bg-slate-900 ${stageSeismicForce > 5 ? 'animate-ping' : ''}`}></div>
                              </div>
                          </div>

                          {/* Base Coils (Fixed to stage) */}
                          <div className="absolute top-0 w-48 h-8 flex justify-between px-2 pt-1">
                              <div className="w-10 h-4 bg-amber-900/50 border border-amber-600 rounded-b flex flex-col items-center overflow-hidden">
                                  <div className="w-full h-1 bg-amber-500 mb-0.5"></div>
                                  <div className="w-full h-1 bg-amber-500"></div>
                              </div>
                              <div className="w-10 h-4 bg-amber-900/50 border border-amber-600 rounded-b flex flex-col items-center overflow-hidden">
                                  <div className="w-full h-1 bg-amber-500 mb-0.5"></div>
                                  <div className="w-full h-1 bg-amber-500"></div>
                              </div>
                          </div>
                      </div>

                      {/* Magnetic Flux Field Lines */}
                      {magLevState !== 'LOCKED' && (
                          <div className="absolute bottom-16 w-48 h-12 flex justify-between px-2 z-10">
                              <div className="w-10 h-full relative flex justify-center overflow-hidden">
                                  <div className={`w-1 h-full bg-sky-400 opacity-50 blur-sm ${magLevState === 'COMPENSATING' ? 'animate-ping' : ''}`}></div>
                                  <div className={`absolute w-4 h-full bg-sky-300 opacity-20 blur-md ${magLevState === 'COMPENSATING' ? 'animate-pulse' : ''}`}></div>
                              </div>
                              <div className="w-10 h-full relative flex justify-center overflow-hidden">
                                  <div className={`w-1 h-full bg-sky-400 opacity-50 blur-sm ${magLevState === 'COMPENSATING' ? 'animate-ping' : ''}`}></div>
                                  <div className={`absolute w-4 h-full bg-sky-300 opacity-20 blur-md ${magLevState === 'COMPENSATING' ? 'animate-pulse' : ''}`}></div>
                              </div>
                          </div>
                      )}

                      {/* The Levitating DJ Table (Isolated) */}
                      <div 
                          className="absolute w-56 bg-slate-900 border-2 border-slate-700 rounded-t-lg z-30 flex flex-col items-center pb-2 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out"
                          style={{
                              bottom: `${64 + (levitationGap * 1.5)}px`, // Base stage height (64) + levitation gap scaled for UI
                              transform: `translate(${Math.random() * tableShake - tableShake/2}px, ${Math.random() * tableShake - tableShake/2}px)`
                          }}
                      >
                          {/* Upper Coils (Fixed to table) */}
                          <div className="absolute -bottom-2 w-48 h-2 flex justify-between px-2">
                              <div className="w-10 h-2 bg-slate-700 rounded-t"></div>
                              <div className="w-10 h-2 bg-slate-700 rounded-t"></div>
                          </div>

                          {/* DJ Gear */}
                          <div className="w-full px-4 pt-4 flex justify-between items-end">
                              {/* Left Turntable */}
                              <div className="w-12 h-8 bg-[#111] border border-slate-600 rounded flex items-center justify-center relative">
                                  <div className="w-8 h-8 rounded-full border border-slate-700 bg-black flex items-center justify-center animate-[spin_3s_linear_infinite]">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                  <div className="absolute right-1 top-1 w-1 h-4 bg-silver border border-gray-400 rounded-full transform rotate-45 origin-top-right"></div>
                              </div>
                              
                              {/* Mixer */}
                              <div className="w-14 h-10 bg-[#222] border border-slate-600 rounded flex flex-col justify-around px-1">
                                  <div className="flex justify-around">
                                      <div className="w-1 h-2 bg-gray-500 rounded"></div>
                                      <div className="w-1 h-2 bg-gray-500 rounded"></div>
                                      <div className="w-1 h-2 bg-gray-500 rounded"></div>
                                  </div>
                                  <div className="flex justify-around">
                                      <div className="w-1 h-3 bg-white/20 rounded relative"><div className="absolute bottom-0 w-full h-1 bg-white"></div></div>
                                      <div className="w-1 h-3 bg-white/20 rounded relative"><div className="absolute top-1 w-full h-1 bg-white"></div></div>
                                  </div>
                              </div>

                              {/* Right Turntable */}
                              <div className="w-12 h-8 bg-[#111] border border-slate-600 rounded flex items-center justify-center relative">
                                  <div className="w-8 h-8 rounded-full border border-slate-700 bg-black flex items-center justify-center animate-[spin_3s_linear_infinite]">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                  <div className="absolute left-1 top-1 w-1 h-4 bg-silver border border-gray-400 rounded-full transform -rotate-45 origin-top-left"></div>
                              </div>
                          </div>

                          {/* Shake Alert Visuals */}
                          {magLevState === 'LOCKED' && tableShake > 1 && (
                              <div className="absolute -top-6 text-[8px] font-black text-red-500 animate-bounce uppercase">
                                  ⚠️ NEEDLE SKIPPING
                              </div>
                          )}
                          {magLevState === 'COMPENSATING' && (
                              <div className="absolute -top-6 text-[8px] font-black text-sky-400 uppercase tracking-widest bg-sky-900/50 px-2 py-0.5 rounded border border-sky-500 backdrop-blur">
                                  STABLE
                              </div>
                          )}

                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Stage Event Controls */}
            <div className="w-full bg-[#0b101a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">MagLev Control Deck</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerEvent('ENGAGE')}
                   disabled={!systemActive || magLevState !== 'LOCKED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || magLevState !== 'LOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-sky-950/40 border-sky-600 text-sky-400 hover:bg-sky-900/60 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                   }`}
                 >
                   Levitate Booth
                 </button>

                 <button 
                   onClick={() => triggerEvent('DROP')}
                   disabled={!systemActive || magLevState !== 'LEVITATING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || magLevState !== 'LEVITATING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse'
                   }`}
                 >
                   Heavy Bass Drop (Seismic)
                 </button>

                 <button 
                   onClick={() => triggerEvent('DISENGAGE')}
                   disabled={!systemActive || magLevState === 'LOCKED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || magLevState === 'LOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   Hard-Lock (Ground)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MagLevDJBooth;
