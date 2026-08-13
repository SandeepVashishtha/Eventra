/* eslint-disable */
import React, { useState, useEffect } from 'react';

const NoisePollutionModeler = () => {
  const [windSpeed, setWindSpeed] = useState(15); // mph
  const [windDir, setWindDir] = useState(45); // degrees (0 is North)
  const [subwooferVolume, setSubwooferVolume] = useState(110); // dB at source
  const [stageRotation, setStageRotation] = useState(0); // degrees
  
  const [violationActive, setViolationActive] = useState(false);
  const [residentialDb, setResidentialDb] = useState(45);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Acoustic physics engine initialized. City ordinance threshold: 65 dB.' }
  ]);

  // Calculate physics simulation
  useEffect(() => {
      // Very basic mock acoustic calculation
      // 1. Base attenuation over distance (inverse square law approximation for UI)
      let baseDbAtBoundary = subwooferVolume - 45; 
      
      // 2. Wind effect
      // If wind is blowing towards the residential zone (which is East, around 90 deg)
      // and stage is pointing East (around 90 deg)
      
      // Calculate how much the stage is pointing at the residential zone (assume residential is at 90 deg East)
      const stageAngleRad = (stageRotation - 90) * (Math.PI / 180);
      const stageDirectionFactor = Math.cos(stageAngleRad); // 1 if pointing exactly East, -1 if pointing West
      
      // Calculate how much wind is blowing towards residential zone
      const windAngleRad = (windDir - 90) * (Math.PI / 180);
      const windDirectionFactor = Math.cos(windAngleRad);
      
      // Apply factors
      const directionalGain = stageDirectionFactor * 15; // up to +15dB if pointing directly at it
      const windGain = windDirectionFactor * (windSpeed * 0.3); // up to +X dB based on wind speed
      
      let finalDb = baseDbAtBoundary + directionalGain + windGain;
      finalDb = Math.max(30, Math.min(130, finalDb)); // Clamp values
      
      setResidentialDb(finalDb);
      
      if (finalDb > 65 && !violationActive) {
          setViolationActive(true);
          addLog('CRIT', `ORDINANCE VIOLATION PREDICTED: Boundary noise level ${finalDb.toFixed(1)} dB (Legal Limit: 65 dB).`);
      } else if (finalDb <= 65 && violationActive) {
          setViolationActive(false);
          addLog('SUCCESS', `Compliance Restored: Boundary noise level ${finalDb.toFixed(1)} dB.`);
      }

  }, [windSpeed, windDir, subwooferVolume, stageRotation]);

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#081112] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔊</span> Physics & Audio Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Noise Pollution <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Propagation Modeler</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals are frequently fined hundreds of thousands of dollars because bass frequencies bleed into neighboring residential areas, violating strict city noise ordinances. Eventra solves this by creating an acoustic propagation simulator in the admin dashboard. The backend calculates acoustic physics (accounting for wind direction APIs and terrain topography) to render a visual dB contour map, predicting exactly how loud the music will be in adjacent neighborhoods before the speakers are even built.
          </p>

          <div className="bg-[#0c1a1b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Environmental & Rigging Controls
               </h3>
               
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                 Simulation Engine Active
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
               
               {/* Controls */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 space-y-4">
                   
                   <div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                           <span>Wind Speed</span>
                           <span className="text-teal-400">{windSpeed} mph</span>
                       </div>
                       <input 
                           type="range" min="0" max="40" value={windSpeed} 
                           onChange={(e) => setWindSpeed(Number(e.target.value))}
                           className="w-full accent-teal-500"
                       />
                   </div>

                   <div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                           <span>Wind Direction</span>
                           <span className="text-teal-400">{windDir}°</span>
                       </div>
                       <input 
                           type="range" min="0" max="360" value={windDir} 
                           onChange={(e) => setWindDir(Number(e.target.value))}
                           className="w-full accent-teal-500"
                       />
                   </div>

               </div>

               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 space-y-4">
                   
                   <div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                           <span>Subwoofer Output</span>
                           <span className="text-cyan-400">{subwooferVolume} dB</span>
                       </div>
                       <input 
                           type="range" min="90" max="140" value={subwooferVolume} 
                           onChange={(e) => setSubwooferVolume(Number(e.target.value))}
                           className="w-full accent-cyan-500"
                       />
                   </div>

                   <div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                           <span>Stage Rig Rotation</span>
                           <span className="text-cyan-400">{stageRotation}°</span>
                       </div>
                       <input 
                           type="range" min="0" max="360" value={stageRotation} 
                           onChange={(e) => setStageRotation(Number(e.target.value))}
                           className="w-full accent-cyan-500"
                       />
                   </div>

               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#050b0c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Engine Telemetry</span>
                 <span className="text-emerald-400 font-black animate-pulse">CALCULATING PROPAGATION...</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-white font-bold bg-red-600 px-1' :
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
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
            
            {/* Simulation Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center shadow-md z-20 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Contour Map Simulator</span>
                      <span className="text-xs text-white font-bold flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span> Topographical Physics Render
                      </span>
                  </div>
                  <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${violationActive ? 'bg-red-900/50 text-red-400 border-red-500/50 animate-pulse' : 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50'}`}>
                      {violationActive ? 'VIOLATION' : 'COMPLIANT'}
                  </div>
              </div>

              {/* Map Area */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
                  
                  {/* Grid / Blueprint Base */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                  
                  {/* Residential Zone (East side) */}
                  <div className={`absolute top-0 right-0 w-1/3 h-full border-l-2 border-dashed transition-colors duration-500 flex flex-col items-center pt-8 ${violationActive ? 'border-red-500 bg-red-900/10' : 'border-slate-600 bg-slate-900/30'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${violationActive ? 'text-red-400' : 'text-slate-500'}`}>Residential</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${violationActive ? 'text-red-400' : 'text-slate-500'}`}>Zone</span>
                      
                      {/* dB Meter */}
                      <div className={`mt-4 p-2 rounded border bg-slate-900 flex flex-col items-center ${violationActive ? 'border-red-500' : 'border-slate-700'}`}>
                          <span className={`text-2xl font-mono font-black ${violationActive ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                              {residentialDb.toFixed(1)}
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Estimated dB</span>
                          <div className="w-full bg-slate-800 h-1 mt-1 rounded overflow-hidden">
                              <div className={`h-full ${violationActive ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${(residentialDb / 100) * 100}%`}}></div>
                          </div>
                      </div>
                  </div>

                  {/* Stage Rig */}
                  <div 
                      className="absolute top-1/2 left-1/4 w-12 h-4 bg-slate-400 rounded-sm shadow-xl z-10 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `translate(-50%, -50%) rotate(${stageRotation}deg)` }}
                  >
                      <div className="text-[6px] font-black uppercase text-slate-900">STAGE</div>
                      
                      {/* Audio Projection Cone Visualizer */}
                      <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ transform: 'translate(-50%, -50%) rotate(90deg)' }}>
                          <svg width="400" height="400" className="opacity-40 mix-blend-screen overflow-visible">
                              <defs>
                                  <radialGradient id="soundGradient" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
                                      <stop offset="0%" stopColor="rgba(239, 68, 68, 1)" />
                                      <stop offset="20%" stopColor="rgba(234, 179, 8, 0.8)" />
                                      <stop offset="50%" stopColor="rgba(34, 197, 94, 0.4)" />
                                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                  </radialGradient>
                              </defs>
                              {/* Scale the cone based on volume */}
                              <path 
                                  d="M 200 0 L 0 400 L 400 400 Z" 
                                  fill="url(#soundGradient)" 
                                  style={{ transform: `scale(${subwooferVolume / 100})`, transformOrigin: 'top center', transition: 'all 0.3s ease' }} 
                              />
                          </svg>
                      </div>
                  </div>

                  {/* Wind Direction Indicator */}
                  <div className="absolute bottom-4 left-4 flex flex-col items-center">
                      <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Wind ({windSpeed}mph)</div>
                      <div 
                          className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center relative"
                          style={{ transform: `rotate(${windDir}deg)` }}
                      >
                          <div className="absolute top-1 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-cyan-400"></div>
                          <div className="w-0.5 h-4 bg-cyan-400 absolute top-2"></div>
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0c1a1b] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Acoustic Projection Physics:</span>
               Adjust the <span className="text-white font-bold bg-emerald-600 px-1 rounded">Wind Direction</span> and <span className="text-white font-bold bg-emerald-600 px-1 rounded">Stage Rotation</span>. The simulation renders a dynamic audio propagation cone. If the wind blows East and the stage is rotated East, the bass frequencies will bleed into the <span className="text-red-400 font-bold">Residential Zone</span>. If the estimated dB crosses 65dB, it instantly flags a City Ordinance Violation alert.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default NoisePollutionModeler;
