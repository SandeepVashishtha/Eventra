/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticMetamaterial = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [crowdSize, setCrowdSize] = useState('SPARSE'); // EMPTY, SPARSE, DENSE
  
  // Acoustic Metrics
  const [crowdAbsorption, setCrowdAbsorption] = useState(1200); // Sabins (unit of sound absorption)
  const [wallAngle, setWallAngle] = useState(15); // Degrees of metamaterial tilt
  const [reverbDecay, setReverbDecay] = useState(1.4); // RT60 in seconds
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Acoustic AI DSP Engine Initialized.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Linear actuators engaged on Stage L/R Baffles.' }
  ]);

  // Visualizer State
  const [panels, setPanels] = useState(Array(16).fill(15)); // Angles for 16 panels
  const [soundRipples, setSoundRipples] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (crowdSize === 'EMPTY') {
              setCrowdAbsorption(50 + Math.random() * 20); // Very low absorption
              setWallAngle(45); // Max deflection to scatter sound
              setReverbDecay(prev => Math.max(1.5, prev - 0.1)); // Trying to tame it
              
          } else if (crowdSize === 'SPARSE') {
              setCrowdAbsorption(1200 + Math.random() * 100);
              setWallAngle(25); // Moderate tuning
              setReverbDecay(prev => {
                  const target = 1.2;
                  return prev + (target - prev) * 0.1;
              });
              
          } else if (crowdSize === 'DENSE') {
              setCrowdAbsorption(8500 + Math.random() * 400); // High absorption (meat shields)
              setWallAngle(5); // Almost flat to reflect highs back into the crowd
              setReverbDecay(prev => {
                  const target = 0.8;
                  return prev + (target - prev) * 0.1;
              });
          }

          // Smoothly animate panels to the target wallAngle
          setPanels(prev => prev.map((currentAngle, i) => {
              // Add slight variance to each panel for "metamaterial" complex geometry look
              const target = wallAngle + (i % 2 === 0 ? 2 : -2); 
              return currentAngle + (target - currentAngle) * 0.1;
          }));

          // Generate sound ripples randomly
          if (Math.random() > 0.6) {
              setSoundRipples(prev => [
                  ...prev, 
                  { id: Date.now(), radius: 0, opacity: 1 }
              ].slice(-4)); // Keep max 4 ripples
          }
          
          // Expand ripples
          setSoundRipples(prev => prev.map(r => ({
              ...r,
              radius: r.radius + (crowdSize === 'DENSE' ? 4 : 6), // Sound travels differently
              opacity: r.opacity - (crowdSize === 'DENSE' ? 0.08 : 0.04) // Dies faster in dense crowd
          })).filter(r => r.opacity > 0));

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, crowdSize, wallAngle]);

  const triggerCrowd = (type) => {
    if (!systemActive) return;
    
    setCrowdSize(type);
    
    if (type === 'EMPTY') {
        addLog('WARN', 'Crowd density negligible (Soundcheck Mode).');
        addLog('ACTION', 'Actuators shifting to 45° max-deflection to prevent slap-back echo.');
    } else if (type === 'SPARSE') {
        addLog('SYS', 'Crowd density moderate (~5,000 pax).');
        addLog('ACTION', 'Tuning metamaterial lattice to 25° for balanced RT60 decay.');
    } else if (type === 'DENSE') {
        addLog('CRIT', 'Maximum crowd density detected (~50,000 pax). High human absorption.');
        addLog('ACTION', 'Actuators flattening to 5°. Reflecting high frequencies back into audience.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setCrowdSize('SPARSE');
      addLog('SYS', 'Shape-Shifting Metamaterial Actuators Online. Syncing with CV cameras.');
    } else {
      setSystemActive(false);
      setCrowdSize('SPARSE');
      setSoundRipples([]);
      addLog('WARN', 'Active DSP Offline. Baffles locked in default geometric position.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020606] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📐</span> Active Acoustics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Acoustic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500">Metamaterials</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Acoustic reflections change drastically depending on whether a stage has 5,000 people or 50,000 people, often leading to muddy, echoing sound during smaller sets. Eventra solves this by constructing the stage's side and rear acoustic baffles using shape-shifting metamaterials controlled by linear actuators. Eventra's AI uses crowd density cameras to calculate the exact acoustic absorption of the current audience, and physically alters the geometric shape and angle of the metamaterial walls in real-time to perfectly tune reflections, ensuring studio-quality sound regardless of crowd size.
          </p>

          <div className="bg-[#050a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Acoustic Tuning Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Lock Actuators' : 'Engage DSP Geometry'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Crowd Absorption */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdSize === 'EMPTY' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 crowdSize === 'DENSE' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Human Absorption
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     crowdSize === 'EMPTY' ? 'text-orange-400' : 
                     crowdSize === 'DENSE' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(crowdAbsorption)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Sabins</span>
                 </div>
               </div>

               {/* Geometric Deflection */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Lattice Deflection
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {wallAngle.toFixed(1)}°
                   </span>
                 </div>
               </div>
               
               {/* Reverb Decay (RT60) */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 reverbDecay > 1.4 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 reverbDecay < 1.0 ? 'bg-blue-950/40 border-blue-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   RT60 Reverb Decay
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     reverbDecay > 1.4 ? 'text-red-400' :
                     reverbDecay < 1.0 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {reverbDecay.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">sec</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010303] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Metamaterial Actuator Ledger</span>
                 {crowdSize === 'EMPTY' && <span className="text-orange-400 font-black animate-pulse">SCATTERING MODE (EMPTY)</span>}
                 {crowdSize === 'DENSE' && <span className="text-emerald-400 font-black animate-pulse">REFLECTION MODE (DENSE)</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* Acoustic Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#010404]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">ACOUSTIC RAY TRACING</span>
                <span className="text-[8px] font-mono text-slate-400">TOP-DOWN PLAN</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">ACTUATORS UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 overflow-hidden">
                      
                      {/* Subwoofer Source (Top Center) */}
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-8 bg-[#111] border border-slate-700 rounded z-30 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                              <div className="w-1 h-1 bg-teal-500 rounded-full animate-ping"></div>
                          </div>
                      </div>

                      {/* Sound Ripples */}
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
                          {soundRipples.map(ripple => (
                              <div 
                                  key={ripple.id}
                                  className="absolute border border-teal-500/50 rounded-full"
                                  style={{
                                      width: `${ripple.radius * 2}px`,
                                      height: `${ripple.radius * 2}px`,
                                      left: `-${ripple.radius}px`,
                                      top: `-${ripple.radius}px`,
                                      opacity: ripple.opacity
                                  }}
                              ></div>
                          ))}
                      </div>

                      {/* Left Metamaterial Wall */}
                      <div className="absolute top-20 left-4 bottom-12 w-4 flex flex-col justify-between z-20">
                          {panels.slice(0, 8).map((angle, i) => (
                              <div 
                                  key={`L${i}`} 
                                  className="w-full h-[10%] bg-slate-700 border border-slate-500 transition-transform shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
                                  style={{ transform: `rotateY(${angle}deg) skewY(${angle / 2}deg)` }}
                              ></div>
                          ))}
                      </div>

                      {/* Right Metamaterial Wall */}
                      <div className="absolute top-20 right-4 bottom-12 w-4 flex flex-col justify-between z-20">
                          {panels.slice(8, 16).map((angle, i) => (
                              <div 
                                  key={`R${i}`} 
                                  className="w-full h-[10%] bg-slate-700 border border-slate-500 transition-transform shadow-[-2px_0_5px_rgba(0,0,0,0.5)]"
                                  style={{ transform: `rotateY(${-angle}deg) skewY(${-angle / 2}deg)` }}
                              ></div>
                          ))}
                      </div>

                      {/* The Crowd (Bottom area) */}
                      <div className="absolute bottom-0 inset-x-0 h-1/2 flex items-end justify-center px-12 z-20 pointer-events-none">
                          {crowdSize === 'EMPTY' && (
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-8">Soundcheck (No Crowd)</span>
                          )}
                          {crowdSize === 'SPARSE' && (
                              <div className="w-full h-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')]">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 absolute bottom-4 left-1/2 -translate-x-1/2">Sparse Crowd</span>
                              </div>
                          )}
                          {crowdSize === 'DENSE' && (
                              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDE2LDE4NSwxMjksMC4yKSIvPjwvc3ZnPg==')] border-t border-emerald-900/30">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 absolute bottom-4 left-1/2 -translate-x-1/2">Dense Crowd (Max Absorption)</span>
                              </div>
                          )}
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Audience Sim Controls */}
            <div className="w-full bg-[#050a0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Computer Vision Density Data</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerCrowd('EMPTY')}
                   disabled={!systemActive || crowdSize === 'EMPTY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdSize === 'EMPTY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   Empty<br/>(Soundcheck)
                 </button>

                 <button 
                   onClick={() => triggerCrowd('SPARSE')}
                   disabled={!systemActive || crowdSize === 'SPARSE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdSize === 'SPARSE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-teal-950/40 border-teal-600 text-teal-400 hover:bg-teal-900/60 shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-pulse'
                   }`}
                 >
                   Sparse<br/>(5,000 pax)
                 </button>

                 <button 
                   onClick={() => triggerCrowd('DENSE')}
                   disabled={!systemActive || crowdSize === 'DENSE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdSize === 'DENSE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   Dense<br/>(50,000 pax)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AcousticMetamaterial;
