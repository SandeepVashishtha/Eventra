/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SwarmDroneLightShows = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [formation, setFormation] = useState('IDLE'); // IDLE, EQUALIZER, LOGO, GALAXY

  // Drone Telemetry
  const [activeDrones, setActiveDrones] = useState(0);
  const [avgBattery, setAvgBattery] = useState(100);
  const [smpteSync, setSmpteSync] = useState(0); // Timecode sync variance ms

  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Swarm UAV Control Dashboard Initialized.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: '5,000 Micro-Drones awaiting SMPTE timecode sync.' }
  ]);

  // Audio/Visual Sync State
  const [audioLevel, setAudioLevel] = useState([20, 30, 45, 80, 50, 40, 20]);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let loop;

    if (fleetActive) {
      loop = setInterval(() => {
          setPulse(p => (p + 1) % 100);

          if (formation === 'EQUALIZER') {
              // Drones reacting to audio levels
              setAudioLevel(prev => prev.map(val => {
                  const target = Math.random() * 100;
                  return val + (target - val) * 0.2;
              }));
              setSmpteSync(Math.random() * 2); // 0-2ms latency
          } else if (formation !== 'IDLE') {
              setAudioLevel([10, 10, 10, 10, 10, 10, 10]);
              setSmpteSync(Math.random() * 0.5); // Very tight sync for static shapes
          }

          // Battery drain
          if (formation !== 'IDLE') {
              setAvgBattery(prev => Math.max(0, prev - 0.05));
          }

      }, 100);
    }

    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive, formation]);

  const triggerFormation = (type, name) => {
    if (!fleetActive) return;
    setFormation(type);
    addLog('ACTION', `Executing 3D Volumetric Formation: [${name}]`);
    addLog('AI', `Pathing physics calculated. 5,000 nodes synchronized to SMPTE Timecode.`);
  };

  const emergencyRth = () => {
    if (!fleetActive) return;
    setFormation('IDLE');
    addLog('CRIT', 'EMERGENCY ABORT. All drones executing Return-To-Home (RTH).');
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      setActiveDrones(5000);
      setAvgBattery(100);
      addLog('SYS', 'Launch Sequence Initiated. 5,000 Drones airborne and holding at 400ft.');
    } else {
      setFleetActive(false);
      setActiveDrones(0);
      setFormation('IDLE');
      addLog('WARN', 'Swarm grounded. Dashboard offline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050a] flex items-center justify-center font-sans p-6 text-slate-300">

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

        {/* Left Side: Fleet Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> Aerial Swarm Robotics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Swarm Drone Volumetric <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Light Shows</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional pyrotechnics and fireworks are environmentally destructive, pose extreme fire hazards, and create massive noise pollution for neighboring communities. Eventra replaces them with a zero-emission alternative: a fleet of 5,000 RGB-equipped micro-drones. This dashboard allows the lighting director to choreograph real-time volumetric 3D animations in the sky. The swarm uses a spatial physics engine to dynamically synchronize its movements and light emissions to the DJ's live SMPTE timecode, creating impossibly complex, reusable aerial light shows.
          </p>

          <div className="bg-[#120a16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">

             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🕹️</span> Central Swarm Orchestration
               </h3>

               <div className="flex space-x-2">
                 <button
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Land & Power Down Fleet' : 'Launch 5,000 UAV Swarm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">

               {/* Airborne Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive ? 'bg-fuchsia-950/20 border-fuchsia-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Airborne Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fleetActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeDrones.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* SMPTE Sync */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 formation === 'EQUALIZER' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 fleetActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Audio/Visual Sync
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     formation !== 'IDLE' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {smpteSync.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms latency</span>
                 </div>
               </div>

               {/* Fleet Battery */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 avgBattery < 20 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' :
                 fleetActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fleet Avg Battery
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     avgBattery < 20 ? 'text-red-400' :
                     fleetActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {avgBattery.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#060308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Physics & Telemetry Log</span>
                 {formation !== 'IDLE' && <span className="text-fuchsia-400 animate-pulse">TRANSMITTING SPATIAL PATHS...</span>}
               </span>

               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' :
                       log.type === 'AI' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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

            {/* Aerial Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>

              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">SKY POV</span>
                <span className="text-[8px] font-mono text-slate-400">VOLUMETRIC PATHING</span>
              </div>

              <div className="flex-1 relative bg-[#010103] overflow-hidden flex flex-col p-4 pt-10">

                {/* Night Sky Background */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#010103] to-[#010103] z-0"></div>

                {!fleetActive ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">DRONES SECURED ON PADS</span>
                   </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
                      {/* Formations */}
                      {formation === 'IDLE' && (
                          <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-1 opacity-20">
                              {[...Array(100)].map((_, i) => (
                                  <div key={i} className="bg-slate-500 rounded-full w-1 h-1"></div>
                              ))}
                          </div>
                      )}

                      {formation === 'EQUALIZER' && (
                          <div className="w-full h-full flex items-end justify-between space-x-2 pb-4">
                              {audioLevel.map((lvl, i) => (
                                  <div key={i} className="flex-1 flex flex-col justify-end space-y-1">
                                      {/* Simulate column of drones */}
                                      {[...Array(20)].map((_, j) => {
                                          const isActive = (19 - j) < (lvl / 5);
                                          return (
                                              <div
                                                key={j}
                                                className={`w-full h-2 rounded-sm transition-all duration-[50ms] ${
                                                    isActive ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-800/30'
                                                }`}
                                              ></div>
                                          )
                                      })}
                                  </div>
                              ))}
                          </div>
                      )}

                      {formation === 'LOGO' && (
                          <div className="relative flex items-center justify-center animate-pulse">
                              {/* Simulate 3D Eventra Logo made of drones */}
                              <svg width="150" height="150" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_rgba(217,70,239,0.8)]">
                                  <polygon points="50,10 90,90 10,90" fill="none" stroke="#d946ef" strokeWidth="4" strokeDasharray="2 2" className="animate-spin-slow" style={{ animationDuration: '10s'}}/>
                                  <polygon points="50,90 10,10 90,10" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="2 2" className="animate-spin-slow" style={{ animationDuration: '10s', animationDirection: 'reverse'}}/>
                                  <circle cx="50" cy="50" r="20" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray="1 3"/>
                              </svg>
                          </div>
                      )}

                      {formation === 'GALAXY' && (
                          <div className="relative w-full h-full flex items-center justify-center">
                              {/* Swirling galaxy spiral */}
                              {[...Array(60)].map((_, i) => {
                                  const angle = (i / 60) * Math.PI * 4 + (pulse / 10);
                                  const radius = 10 + (i / 60) * 80;
                                  const x = Math.cos(angle) * radius;
                                  const y = Math.sin(angle) * radius;
                                  const hue = (pulse * 5 + i * 10) % 360;
                                  return (
                                      <div
                                          key={i}
                                          className="absolute w-2 h-2 rounded-full transition-all duration-75"
                                          style={{
                                              transform: `translate(${x}px, ${y}px)`,
                                              backgroundColor: `hsl(${hue}, 100%, 60%)`,
                                              boxShadow: `0 0 10px hsl(${hue}, 100%, 60%)`
                                          }}
                                      ></div>
                                  )
                              })}
                          </div>
                      )}
                  </div>
                )}

                {/* HUD Overlay */}
                {fleetActive && (
                    <div className="absolute top-10 left-3 z-20 flex flex-col space-y-1 pointer-events-none">
                        <span className="text-[7px] font-mono text-fuchsia-400">ALT: 420.5 ft</span>
                        <span className="text-[7px] font-mono text-cyan-400">WIND: 12 mph NE</span>
                        <span className="text-[7px] font-mono text-emerald-400">SAT: 28 Locked</span>
                    </div>
                )}

                {formation === 'EQUALIZER' && (
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center z-30 pointer-events-none w-full">
                       <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/50 flex items-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                           <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                           SMPTE AUDIO SYNC ACTIVE
                       </span>
                   </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120a16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Trigger 3D Formations</span>

               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button
                   onClick={() => triggerFormation('EQUALIZER', 'Audio-Reactive Equalizer')}
                   disabled={!fleetActive || formation === 'EQUALIZER'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || formation === 'EQUALIZER' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' :
                     'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                   }`}
                 >
                   Inject Audio-Reactive Equalizer
                 </button>

                 <button
                   onClick={() => triggerFormation('LOGO', 'Eventra 3D Logo')}
                   disabled={!fleetActive || formation === 'LOGO'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || formation === 'LOGO' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' :
                     'bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-400 hover:bg-fuchsia-900/60'
                   }`}
                 >
                   Render 3D Festival Logo
                 </button>

                 <button
                   onClick={() => triggerFormation('GALAXY', 'Nebula Swirl')}
                   disabled={!fleetActive || formation === 'GALAXY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || formation === 'GALAXY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' :
                     'bg-pink-950/40 border-pink-900 text-pink-400 hover:bg-pink-900/60'
                   }`}
                 >
                   Render Kinetic Nebula Swirl
                 </button>
               </div>

               <button
                   onClick={emergencyRth}
                   disabled={!fleetActive || formation === 'IDLE'}
                   className={`w-full py-2 mt-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !fleetActive || formation === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' :
                     'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                   }`}
                 >
                   EMERGENCY ABORT (RTH)
               </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SwarmDroneLightShows;
