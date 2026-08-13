/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticPhasedArraySim = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [arrayType, setArrayType] = useState('BROADSIDE'); // BROADSIDE, END_FIRE, GRADIENT
  
  // Acoustic Metrics
  const [frequency, setFrequency] = useState(40); // Hz
  const [maxSpl, setMaxSpl] = useState(132); // dB
  const [rearRejection, setRearRejection] = useState(12); // dB
  const [simAccuracy, setSimAccuracy] = useState(98.5); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Acoustic Physics Engine (WebGL) initialized.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting subarray coordinate input...' }
  ]);

  // Visualizer State
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive && !isComputing) {
      loop = setInterval(() => {
          // Micro-fluctuations in atmospheric simulation
          setSimAccuracy(98.5 + Math.random() * 0.5);
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, isComputing]);

  const updateArrayConfiguration = (type) => {
      if (!systemActive) return;
      
      setIsComputing(true);
      setArrayType(type);
      addLog('ACTION', `Re-calculating physics for Subwoofer Array: ${type}`);
      
      // Simulate WebGL/DSP calculation time
      setTimeout(() => {
          setIsComputing(false);
          
          if (type === 'BROADSIDE') {
              setMaxSpl(138);
              setRearRejection(4);
              addLog('WARN', 'Broadside array selected. High SPL but poor rear rejection (high stage bleed).');
          } else if (type === 'END_FIRE') {
              setMaxSpl(134);
              setRearRejection(18);
              addLog('SUCCESS', 'End-Fire array configured. Excellent forward directivity, minimal rear bleed.');
          } else if (type === 'GRADIENT') {
              setMaxSpl(130);
              setRearRejection(24);
              addLog('SUCCESS', 'Cardioid Gradient selected. Maximum rear rejection achieved.');
          }
      }, 1200);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Connecting to DSP matrices. Fetching topographical data.');
    } else {
      setSystemActive(false);
      addLog('WARN', 'Simulator Offline. Reverting to manual trial-and-error soundchecks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔈</span> Acoustic DSP Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Acoustic Phased Array <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-500 to-red-500">Simulation Tool</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Sound engineers struggle to minimize low-frequency audio bleed between stages, which severely ruins the acoustic experience for attendees standing in the middle of the grounds. Trial-and-error soundchecks are slow and disrupt the local community. Eventra solves this by building a WebGL-based UI simulation tool within the admin dashboard. Audio engineers can input the exact GPS coordinates and phase angles of their subwoofer arrays. The tool mathematically calculates and renders interference heatmaps, allowing engineers to computationally "steer" the bass away from other stages before physically moving heavy speakers.
          </p>

          <div className="bg-[#080205] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> DSP Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Simulation' : 'Boot Physics Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Max SPL */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-rose-950/40 border-rose-900/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Forward SPL
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {maxSpl}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

               {/* Rear Rejection */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive && rearRejection > 15 ? 'bg-emerald-950/40 border-emerald-900/50' : 
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Rear Rejection
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive && rearRejection > 15 ? 'text-emerald-400' : 
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     -{rearRejection}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* Frequency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Target Freq
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {frequency}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>
               
               {/* Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isComputing ? 'bg-indigo-950/40 border-indigo-500/50 animate-pulse' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Engine Status
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         isComputing ? 'text-indigo-400' : systemActive ? 'text-slate-300' : 'text-slate-600'
                       }`}>
                         {isComputing ? 'CALC' : systemActive ? simAccuracy.toFixed(1) : '0.0'}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">{isComputing ? '' : '%'}</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030102] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebGL Render Ledger</span>
                 {isComputing && <span className="text-indigo-400 font-black animate-pulse">RENDER_PASS_ACTIVE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 'text-slate-400'
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
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">ACOUSTIC SIMULATOR</span>
                <span className="text-[8px] font-mono text-slate-400">f: {frequency}Hz</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">ENGINE OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex justify-center items-center">
                        
                        {/* Simulation Grid Background */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        {/* Main Stage Marker */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 border border-slate-600 z-30 flex items-center justify-center">
                            <span className="text-[6px] font-black text-slate-400">MAIN STAGE</span>
                        </div>

                        {/* Other Stage Marker (to show bleed reduction) */}
                        <div className="absolute bottom-10 right-4 w-16 h-4 bg-slate-800 border border-slate-600 z-30 flex items-center justify-center">
                            <span className="text-[6px] font-black text-slate-400">STAGE B</span>
                        </div>

                        {/* Subwoofer Array Nodes */}
                        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex space-x-1 z-30">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 bg-black border ${arrayType === 'GRADIENT' && i % 2 !== 0 ? 'border-sky-500' : 'border-pink-500'}`}></div>
                            ))}
                        </div>

                        {/* Interference Heatmap Rendering */}
                        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none transition-opacity duration-500" style={{ opacity: isComputing ? 0.3 : 1 }}>
                            
                            {/* Base Radiation */}
                            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 origin-bottom transition-all duration-1000"
                                 style={{
                                     width: '300px',
                                     height: '350px',
                                     background: 'radial-gradient(circle at bottom center, rgba(244,63,94,0.8) 0%, rgba(249,115,22,0.4) 40%, rgba(59,130,246,0.1) 70%, transparent 100%)',
                                     filter: 'blur(15px)',
                                     transform: arrayType === 'BROADSIDE' ? 'scaleY(0.7) scaleX(1.4)' : arrayType === 'END_FIRE' ? 'scaleY(1.2) scaleX(0.6)' : 'scaleY(1.0) scaleX(0.8)'
                                 }}
                            ></div>

                            {/* Rear Lobes (Bleed) */}
                            <div className="absolute top-[calc(100%-3.5rem)] left-1/2 -translate-x-1/2 origin-top transition-all duration-1000"
                                 style={{
                                     width: '200px',
                                     height: '150px',
                                     background: 'radial-gradient(circle at top center, rgba(239,68,68,0.6) 0%, rgba(168,85,247,0.3) 50%, transparent 100%)',
                                     filter: 'blur(15px)',
                                     transform: arrayType === 'BROADSIDE' ? 'scaleY(0.9)' : arrayType === 'END_FIRE' ? 'scaleY(0.3)' : 'scaleY(0.1)',
                                     opacity: arrayType === 'GRADIENT' ? 0.1 : 1
                                 }}
                            ></div>

                            {/* Wave Ripples (Constructive Interference lines) */}
                            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[400px] h-[400px] pointer-events-none opacity-30">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="absolute bottom-0 left-1/2 -translate-x-1/2 border-t-2 border-white rounded-full transition-all duration-1000"
                                         style={{
                                             width: `${i * 20}%`,
                                             height: `${i * 20}%`,
                                             transformOrigin: 'bottom center',
                                             transform: arrayType === 'END_FIRE' ? 'scaleY(1.5)' : arrayType === 'BROADSIDE' ? 'scaleX(1.3)' : 'scaleY(1.2)'
                                         }}
                                    ></div>
                                ))}
                            </div>

                        </div>

                        {/* Bleed Warning Overlay */}
                        {arrayType === 'BROADSIDE' && !isComputing && (
                            <div className="absolute bottom-6 right-2 bg-red-900/80 border border-red-500 rounded px-2 py-1 z-40 animate-pulse">
                                <span className="text-[6px] font-black text-red-400">⚠️ HIGH BLEED AT STAGE B</span>
                            </div>
                        )}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#080205] p-4 rounded-xl border border-slate-800">
               <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Configure DSP Phase Align</span>
               </div>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => updateArrayConfiguration('BROADSIDE')}
                   disabled={!systemActive || isComputing || arrayType === 'BROADSIDE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || isComputing || arrayType === 'BROADSIDE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                   }`}
                 >
                   Standard Broadside (0° Phase)
                 </button>
                 
                 <button 
                   onClick={() => updateArrayConfiguration('END_FIRE')}
                   disabled={!systemActive || isComputing || arrayType === 'END_FIRE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || isComputing || arrayType === 'END_FIRE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_15px_rgba(244,114,182,0.3)]'
                   }`}
                 >
                   End-Fire Array (Delay Steered)
                 </button>
                 
                 <button 
                   onClick={() => updateArrayConfiguration('GRADIENT')}
                   disabled={!systemActive || isComputing || arrayType === 'GRADIENT'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || isComputing || arrayType === 'GRADIENT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-600 text-rose-500 hover:bg-rose-900/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                   }`}
                 >
                   Cardioid Gradient (Polarity Inverted)
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AcousticPhasedArraySim;
