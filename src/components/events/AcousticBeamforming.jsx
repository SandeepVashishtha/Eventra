/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticBeamforming = () => {
  const [arrayActive, setArrayActive] = useState(false);
  
  // Beamforming Targets
  const [targets, setTargets] = useState([
    { id: 'VIP-1', name: 'Cabana Alpha', x: 20, y: 75, active: false, spl: 82 },
    { id: 'VIP-2', name: 'Skydeck Beta', x: 80, y: 70, active: false, spl: 80 },
    { id: 'VIP-3', name: 'Artist Lounge', x: 50, y: 85, active: false, spl: 85 }
  ]);
  
  // DSP Engine Metrics
  const [activeBeams, setActiveBeams] = useState(0);
  const [dspLoad, setDspLoad] = useState(12); // %
  const [phaseVariance, setPhaseVariance] = useState(0); // degrees
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Phased-Array Transducers online.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Awaiting spatial coordinate targeting.' }
  ]);

  // Beam animation state
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let loop;
    
    if (arrayActive) {
      loop = setInterval(() => {
          setPulse(p => (p + 1) % 100);
          
          const activeCount = targets.filter(t => t.active).length;
          setActiveBeams(activeCount);
          
          if (activeCount > 0) {
             setDspLoad(prev => Math.min(95, prev + (activeCount * 2) + (Math.random() * 4 - 2)));
             setPhaseVariance(Math.random() * 0.4); // Very tight phase
          } else {
             setDspLoad(Math.max(12, dspLoad - 5));
             setPhaseVariance(0);
          }
          
      }, 50); // fast loop for visual pulse
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [arrayActive, targets, dspLoad]);

  const toggleTarget = (id) => {
    if (!arrayActive) return;
    
    setTargets(prev => prev.map(t => {
       if (t.id === id) {
           const newState = !t.active;
           if (newState) {
               addLog('ACTION', `Focusing acoustic beam onto coordinates: ${t.name}.`);
               addLog('AI', `Phase shift calculated. Sound bubble established at 105dB SPL.`);
           } else {
               addLog('WARN', `Acoustic beam to ${t.name} dissolved.`);
           }
           return { ...t, active: newState, spl: newState ? 105 : (80 + Math.random()*5) };
       }
       return t;
    }));
  };

  const toggleArray = () => {
    if (!arrayActive) {
      setArrayActive(true);
      addLog('SYS', 'Spatial Audio Engine armed. Calibrating transducers.');
    } else {
      setArrayActive(false);
      setTargets(prev => prev.map(t => ({ ...t, active: false, spl: 80 + Math.random()*5 })));
      setActiveBeams(0);
      setDspLoad(12);
      addLog('CRIT', 'Phased Array offline. Audio returning to omnidirectional spread.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Audio Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎯</span> Spatial Audio Physics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Driven Acoustic Beamforming <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">for VIP Sound Bubbles</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Ultra-VIP cabanas located far from the stage often suffer from terrible audio quality and excessive crowd noise bleed, ruining the premium experience. Eventra deploys phased-array speakers across the physical festival perimeter. The platform's audio engine uses AI to calculate real-time spatial acoustic beamforming. By manipulating micro-second phase delays, it tightly focuses pristine audio beams directly into specific VIP cabana coordinates, creating localized "sound bubbles" of studio-quality 105dB audio that cannot be heard by people standing just 5 feet outside the beam.
          </p>

          <div className="bg-[#050a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Phased Array DSP Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleArray}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     arrayActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {arrayActive ? 'Disable Phased Array' : 'Arm Spatial Audio Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Beams */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeBeams > 0 ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Beams
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     activeBeams > 0 ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {activeBeams}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Targets</span>
                 </div>
               </div>

               {/* DSP Load */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dspLoad > 80 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 arrayActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   DSP Calculus Load
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     dspLoad > 80 ? 'text-orange-400 animate-pulse' :
                     arrayActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(dspLoad)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Phase Variance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeBeams > 0 ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Phase Coherence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     activeBeams > 0 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     ±{phaseVariance.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Deg</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020509] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Spatial Algorithm Log</span>
                 {activeBeams > 0 && <span className="text-cyan-400 animate-pulse">TRANSMITTING SPATIAL AUDIO...</span>}
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
            
            {/* Visualizer Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">ACOUSTIC MAP</span>
                <span className="text-[8px] font-mono text-slate-400">PHASED ARRAY EMISSION</span>
              </div>

              <div className="flex-1 relative bg-[#020306] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Stage and Phased Array */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Main Stage Array</span>
                    <div className="w-32 h-3 flex space-x-[1px]">
                        {/* Transducers */}
                        {[...Array(24)].map((_, i) => (
                           <div key={i} className={`flex-1 ${arrayActive ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Omni-directional spread (when array is active but no targets) */}
                {arrayActive && activeBeams === 0 && (
                   <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 w-0 h-0 border-l-[150px] border-l-transparent border-r-[150px] border-r-transparent border-t-[300px] border-t-cyan-900/20 mix-blend-screen animate-pulse pointer-events-none"></div>
                )}

                {/* VIP Targets and Beamforming */}
                <div className="absolute inset-0 z-10">
                    <svg className="w-full h-full pointer-events-none">
                        {targets.map(t => {
                            if (!t.active) return null;
                            
                            // Draw tight beam from center top (stage) to target
                            const pulseOffset = (pulse / 100) * 10;
                            
                            return (
                                <g key={`beam-${t.id}`}>
                                    {/* The concentrated beam path */}
                                    <polygon 
                                        points={`50%,20 50%,20 ${t.x - 2}%,${t.y}% ${t.x + 2}%,${t.y}%`}
                                        fill="rgba(6, 182, 212, 0.15)"
                                        className="mix-blend-screen"
                                    />
                                    {/* Center intense laser-like line */}
                                    <line 
                                        x1="50%" y1="20" 
                                        x2={`${t.x}%`} y2={`${t.y}%`} 
                                        stroke="rgba(6, 182, 212, 0.8)" 
                                        strokeWidth="1.5"
                                        strokeDasharray="4 4"
                                        strokeDashoffset={-pulseOffset}
                                    />
                                </g>
                            )
                        })}
                    </svg>
                    
                    {/* Render VIP Cabana Nodes */}
                    {targets.map(t => (
                        <div 
                            key={`node-${t.id}`}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                            style={{ top: `${t.y}%`, left: `${t.x}%` }}
                        >
                            {t.active && (
                                <div className="absolute inset-[-20px] bg-cyan-500/20 rounded-full animate-ping z-0 pointer-events-none"></div>
                            )}
                            
                            <div className={`w-12 h-12 rounded-lg border-2 z-10 flex flex-col items-center justify-center backdrop-blur-sm ${
                                t.active ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-slate-700 bg-slate-900/80'
                            }`}>
                                <span className="text-[7px] font-black uppercase text-slate-400">{t.id}</span>
                                <span className={`text-[11px] font-mono font-bold ${t.active ? 'text-cyan-400' : 'text-slate-600'}`}>{Math.floor(t.spl)}dB</span>
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 mt-1">{t.name}</span>
                        </div>
                    ))}
                </div>

                {/* HUD Alerts */}
                {activeBeams > 0 && (
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center z-30 pointer-events-none w-full">
                       <div className="bg-cyan-950/90 border border-cyan-500/50 px-4 py-1.5 rounded flex items-center shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                              ISOLATED SOUND BUBBLES ACTIVE
                          </span>
                       </div>
                   </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#050a14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Cabana Targeting API</span>
               
               <div className="grid grid-cols-1 gap-2">
                 {targets.map(t => (
                    <button 
                       key={`btn-${t.id}`}
                       onClick={() => toggleTarget(t.id)}
                       disabled={!arrayActive}
                       className={`py-2.5 rounded-lg font-black uppercase tracking-widest text-[9px] transition flex justify-between px-4 border ${
                         !arrayActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                         t.active ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' :
                         'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'
                       }`}
                     >
                       <span>{t.name}</span>
                       <span>{t.active ? 'LOCKED' : 'FOCUS BEAM'}</span>
                    </button>
                 ))}
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AcousticBeamforming;
