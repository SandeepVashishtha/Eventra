/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticMetamaterialFence = () => {
  const [ancActive, setAncActive] = useState(false);
  const [acousticState, setAcousticState] = useState('LEAKING'); // LEAKING, NULLIFYING, SECURE
  
  // DSP & Noise Metrics
  const [internalSPL, setInternalSPL] = useState(115); // Sound Pressure Level inside (dB)
  const [externalSPL, setExternalSPL] = useState(92); // Sound Pressure Level outside (dB)
  
  const [antiPhasePower, setAntiPhasePower] = useState(0); // kW
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:30:00', type: 'SYS', msg: 'Acoustic Metamaterial Perimeter array online.' },
    { id: 2, time: '22:30:02', type: 'SYS', msg: 'Awaiting DSP wave inversion authorization.' }
  ]);

  // Visualizer states
  const [wavefront, setWavefront] = useState(0);

  useEffect(() => {
    let loop;
    
    if (ancActive) {
      if (acousticState === 'NULLIFYING') {
        let step = 0;
        loop = setInterval(() => {
          step++;
          setExternalSPL(prev => Math.max(45, prev - (Math.random() * 2 + 1)));
          setAntiPhasePower(prev => Math.min(125, prev + (Math.random() * 5 + 5)));
          setWavefront(prev => prev + 1);

          if (step > 25) {
             setAcousticState('SECURE');
             addLog('SUCCESS', 'Destructive interference locked. City noise bleed mitigated.');
          }
        }, 150);
      } else if (acousticState === 'SECURE') {
        loop = setInterval(() => {
          setInternalSPL(115 + (Math.random() * 4 - 2));
          // External SPL stays low (ambient city noise ~45dB)
          setExternalSPL(45 + (Math.random() * 2 - 1));
          setAntiPhasePower(125 + (Math.random() * 4 - 2));
          setWavefront(prev => prev + 1);
        }, 150);
      }
    } else {
       // When off, external noise mirrors internal minus natural distance attenuation
       loop = setInterval(() => {
          const internal = 115 + (Math.random() * 4 - 2);
          setInternalSPL(internal);
          setExternalSPL(internal - 23); // Natural attenuation without ANC
          setWavefront(prev => prev + 1);
       }, 200);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [ancActive, acousticState]);

  const triggerBassDrop = () => {
    if (ancActive && acousticState === 'SECURE') {
      addLog('WARN', 'Sub-bass transient spike detected (122dB).');
      addLog('ACTION', 'Dynamically increasing metamaterial actuator excursion.');
      setInternalSPL(122);
      setAntiPhasePower(150);
      setTimeout(() => {
          setInternalSPL(115);
          setAntiPhasePower(125);
          addLog('SYS', 'Transient absorbed. City compliance maintained.');
      }, 1500);
    } else if (!ancActive) {
      setInternalSPL(122);
      setExternalSPL(99);
      addLog('CRIT', 'Sub-bass transient breached perimeter (99dB exterior). Police noise complaint likely.');
      setTimeout(() => {
          setInternalSPL(115);
          setExternalSPL(92);
      }, 1500);
    }
  };

  const toggleANC = () => {
    if (!ancActive) {
      setAncActive(true);
      setAcousticState('NULLIFYING');
      addLog('SYS', 'Active Noise Cancellation Enabled. Emitting anti-phase frequencies.');
    } else {
      setAncActive(false);
      setAcousticState('LEAKING');
      setAntiPhasePower(0);
      addLog('CRIT', 'DSP Offline. Metamaterial barrier disabled. Severe noise leakage occurring.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Audio Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔊</span> Acoustic Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Acoustic Metamaterial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Noise Cancellation Perimeter</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Outdoor festivals face immense pressure and strict 10 PM curfews from surrounding residential neighborhoods complaining about acoustic low-frequency noise pollution. Eventra avoids shutting down the party by deploying adaptive acoustic metamaterial arrays along the physical perimeter fencing. Eventra uses machine learning to analyze the outgoing acoustic wavefront from the stages. It controls active DSP actuators in the fence to emit precisely calculated anti-phase frequencies, creating a destructive interference barrier that effectively silences the festival audio for the surrounding city while keeping it at 115dB inside.
          </p>

          <div className="bg-[#140b0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> DSP Perimeter Control
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleANC}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     ancActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {ancActive ? 'Disable Metamaterial Wall' : 'Arm Anti-Phase Array'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Internal SPL */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 internalSPL > 120 ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Internal SPL (Stage)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     internalSPL > 120 ? 'text-red-400 animate-pulse' : 'text-white'
                   }`}>
                     {Math.floor(internalSPL)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

               {/* External SPL */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 externalSPL > 80 ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 ancActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   External SPL (City)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     externalSPL > 80 ? 'text-red-500 animate-bounce' :
                     ancActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(externalSPL)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* Actuator Power */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ancActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Actuator Load
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     ancActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(antiPhasePower)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kW</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#080302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Metamaterial Log</span>
                 {acousticState === 'NULLIFYING' && <span className="text-orange-400 animate-pulse">Calculating Phase Inversion...</span>}
                 {acousticState === 'SECURE' && <span className="text-emerald-400 animate-pulse">PERIMETER SILENCED</span>}
                 {acousticState === 'LEAKING' && <span className="text-red-500 animate-pulse">NOISE COMPLAINT IMMINENT</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
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
            
            {/* Wavefront Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">ACOUSTIC SIMULATION</span>
                <span className="text-[8px] font-mono text-slate-400">DESTRUCTIVE INTERFERENCE</span>
              </div>

              <div className="flex-1 relative bg-[#060202] overflow-hidden flex flex-col">
                
                {/* Physical Layout */}
                <div className="absolute inset-0 z-0 flex flex-col">
                    {/* Internal (Festival) */}
                    <div className="h-1/2 w-full bg-slate-900/30 flex items-end justify-center pb-2 relative">
                        <span className="absolute top-10 text-[10px] font-black uppercase text-slate-600">Festival Grounds</span>
                        {/* Stage Speaker */}
                        <div className="w-12 h-6 bg-black border-t-2 border-x-2 border-slate-700 rounded-t-lg z-10 flex items-center justify-center">
                            <span className="text-[6px] text-orange-500">PA System</span>
                        </div>
                    </div>
                    {/* The Fence */}
                    <div className={`h-2 w-full ${ancActive ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]' : 'bg-slate-600'} z-20 flex justify-around items-center`}>
                        {[1,2,3,4,5,6,7].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${ancActive ? 'bg-white animate-ping' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                    {/* External (City) */}
                    <div className="h-1/2 w-full bg-blue-950/10 flex items-start justify-center pt-8 relative">
                        <span className="absolute bottom-4 text-[10px] font-black uppercase text-slate-600">Residential City Area</span>
                    </div>
                </div>

                {/* Wave Visualizations */}
                <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                    
                    {/* Outgoing Stage Waves */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <radialGradient id="stageWave" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
                                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                            </radialGradient>
                        </defs>
                        
                        {/* Internal Waves mapping */}
                        {[0, 1, 2].map(i => {
                            const yPos = 50 - ((wavefront * 2 + (i * 20)) % 50);
                            const opacity = Math.max(0, yPos / 50);
                            return (
                                <ellipse 
                                    key={`in-${i}`}
                                    cx="50%" 
                                    cy={`${yPos}%`} 
                                    rx={`${100 - yPos}%`} 
                                    ry="10%" 
                                    fill="none" 
                                    stroke="rgba(239, 68, 68, 0.8)" 
                                    strokeWidth="2"
                                    opacity={opacity}
                                />
                            )
                        })}

                        {/* External Waves (Bleed vs Cancelled) */}
                        {[0, 1, 2].map(i => {
                            const yPos = 50 + ((wavefront * 2 + (i * 20)) % 50);
                            const opacity = ancActive ? 0.05 : Math.max(0, (100 - yPos) / 50); // Muted if ANC on
                            
                            return (
                                <ellipse 
                                    key={`out-${i}`}
                                    cx="50%" 
                                    cy={`${yPos}%`} 
                                    rx={`${yPos}%`} 
                                    ry="10%" 
                                    fill="none" 
                                    stroke={ancActive ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.6)"} 
                                    strokeWidth={ancActive ? "1" : "2"}
                                    opacity={opacity}
                                />
                            )
                        })}

                        {/* Anti-Phase Metamaterial Waves */}
                        {ancActive && [0, 1, 2].map(i => {
                             const yPos = 50 + ((wavefront * 2 + (i * 20)) % 30);
                             const opacity = Math.max(0, (80 - yPos) / 30);
                             
                             return (
                                 <ellipse 
                                     key={`anti-${i}`}
                                     cx="50%" 
                                     cy={`${yPos}%`} 
                                     rx={`${yPos}%`} 
                                     ry="5%" 
                                     fill="none" 
                                     stroke="rgba(249, 115, 22, 0.8)" 
                                     strokeWidth="2"
                                     strokeDasharray="4 4"
                                     opacity={opacity}
                                 />
                             )
                        })}
                    </svg>

                </div>

                {/* Overlays */}
                {acousticState === 'SECURE' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col z-30 bg-black/80 p-2 rounded border border-orange-500/50">
                    <span className="text-[8px] font-mono text-orange-400 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse shadow-[0_0_5px_#10b981]"></span>
                        DESTRUCTIVE INTERFERENCE LOCKED
                    </span>
                  </div>
                )}
                
                {acousticState === 'LEAKING' && (
                  <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col z-30 bg-red-950/80 p-2 rounded border border-red-500/50 text-center shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                    <span className="text-[10px] font-black text-red-500">WARNING</span>
                    <span className="text-[6px] font-mono text-white">92dB LEAKING INTO RESIDENTIAL</span>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-1 gap-3">
              <button 
                onClick={triggerBassDrop}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !ancActive ? 'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60' : 
                  'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                }`}
              >
                Trigger Sub-Bass Drop (122dB Spike)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AcousticMetamaterialFence;
