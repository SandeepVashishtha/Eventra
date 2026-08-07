/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicSubwooferPhasing = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [perimeterDb, setPerimeterDb] = useState(65.0); // Legal limit is 70dB
  const [phaseAlignment, setPhaseAlignment] = useState(0); // Degrees 0-180
  const [cancellationActive, setCancellationActive] = useState(false);
  
  const LEGAL_LIMIT_DB = 70.0;

  const [dspLog, setDspLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Connected to PA System DSP via Dante protocol.' },
    { id: 2, time: '20:00:05', type: 'IOT', msg: 'Perimeter IoT Decibel meters tracking at City Boundary (North).' }
  ]);

  useEffect(() => {
    let loop;
    if (systemActive) {
      loop = setInterval(() => {
        setPerimeterDb(prev => {
          let next;
          if (!cancellationActive) {
            // Bass is climbing, headliner comes on
            next = prev + (Math.random() * 2 + 0.5);
            if (next >= LEGAL_LIMIT_DB + 2) {
               triggerPhasing();
            }
          } else {
            // Phase cancellation active, drops db safely below limit
            next = prev - (Math.random() * 1.5 + 0.5);
            if (next < 62) next += 2; // Stabilize around 65
          }
          return Math.max(50, next);
        });
      }, 400);
    }
    return () => clearInterval(loop);
  }, [systemActive, cancellationActive]);

  useEffect(() => {
    if (cancellationActive) {
      // Simulate DSP calculating optimal phase cancellation angle
      const targetPhase = 145; // Simulated perfect cancellation angle
      let currentPhase = 0;
      const phaseLoop = setInterval(() => {
        currentPhase += 15;
        setPhaseAlignment(currentPhase);
        if (currentPhase >= targetPhase) {
          clearInterval(phaseLoop);
          setPhaseAlignment(targetPhase);
        }
      }, 100);
      return () => clearInterval(phaseLoop);
    } else {
      setPhaseAlignment(0);
    }
  }, [cancellationActive]);

  const triggerPhasing = () => {
    if (!cancellationActive) {
      setCancellationActive(true);
      addLog('WARN', `LEGAL LIMIT BREACHED: Low-frequency spill detected at ${perimeterDb.toFixed(1)}dB.`);
      
      setTimeout(() => {
        addLog('DSP', 'Calculating destructive interference wave pattern for North perimeter.');
        setTimeout(() => {
          addLog('ACTION', 'Inverting phase on Subwoofer Array B by 145°. Cancelling spill.');
        }, 600);
      }, 300);
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setCancellationActive(false);
      setPerimeterDb(60.0);
      addLog('EVENT', 'Headliner set started. Sub-bass output increasing.');
    } else {
      setSystemActive(false);
      setCancellationActive(false);
      setPerimeterDb(60.0);
      addLog('SYS', 'System idle. Reverting DSP to standard cardioid deployment.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setDspLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Audio Eng Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎛️</span> DSP Acoustic Control
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Subwoofer Phasing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Noise Ordinance Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals are constantly shut down or fined millions of dollars because low-frequency bass escapes the venue and rattles windows in nearby neighborhoods. Eventra fixes this via a closed-loop system. Perimeter IoT decibel meters read boundary noise in real-time. If bass hits the legal limit, the software automatically commands the DSP of the subwoofer array, adjusting the phase alignment to actively cancel out the specific sound waves heading toward the neighborhood, saving the show without turning down the music.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🔊</span> Sub-Bass Telemetry Matrix
               </h3>
               
               <button 
                 onClick={toggleSystem}
                 disabled={systemActive && !cancellationActive}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm flex items-center ${
                   systemActive && !cancellationActive ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                   systemActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' :
                   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                 }`}
               >
                 {systemActive && !cancellationActive ? 'Tracking Audio Levels...' : systemActive ? 'Reset Calibration' : 'Simulate Ordinance Breach'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Perimeter Noise Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 perimeterDb >= LEGAL_LIMIT_DB && !cancellationActive ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 
                 cancellationActive ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 flex justify-between">
                   <span>Neighborhood Spl</span>
                   <span className="text-slate-500 font-mono">Limit: {LEGAL_LIMIT_DB}</span>
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     perimeterDb >= LEGAL_LIMIT_DB && !cancellationActive ? 'text-red-500' : 
                     cancellationActive ? 'text-emerald-400' : 'text-slate-300'
                   }`}>
                     {perimeterDb.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-2 pb-1">dB</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${perimeterDb >= LEGAL_LIMIT_DB && !cancellationActive ? 'bg-red-500' : cancellationActive ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                     style={{ width: `${(perimeterDb / 90) * 100}%` }}
                   ></div>
                 </div>
               </div>

               {/* DSP Phase Alignment */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 cancellationActive ? 'bg-purple-950/30 border-purple-500/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">DSP Phase Shift (Array B)</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-500 ${
                     cancellationActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {phaseAlignment}°
                   </span>
                 </div>
                 
                 <div className="absolute top-3 right-3 flex items-center space-x-1">
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                     cancellationActive ? 'bg-purple-900/50 text-purple-400 border-purple-500/50 animate-pulse' : 'bg-slate-800 text-slate-500 border-slate-700'
                   }`}>
                     {cancellationActive ? 'CANCELLATION ACTIVE' : 'STANDARD ALIGN'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Audio Hardware Matrix</span>
                 <span className="text-indigo-400 animate-pulse">Monitoring Perimeter...</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {dspLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'WARN' ? 'text-red-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' :
                       log.type === 'DSP' ? 'text-indigo-300' :
                       log.type === 'EVENT' ? 'text-cyan-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Acoustic Physics Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-[2rem] border-8 border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/80 text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-800 backdrop-blur-md shadow-sm">
                Acoustic Waveform Analysis
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-[#07090f]">
               
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-0"></div>

               {/* Stage Subwoofers */}
               <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-20">
                 <div className="text-[10px] text-slate-500 font-black uppercase mb-1 ml-1">Array A</div>
                 {[1,2,3].map(i => (
                   <div key={`A-${i}`} className="w-8 h-12 bg-black border-2 border-slate-700 rounded-sm relative overflow-hidden flex items-center justify-center">
                     <div className={`w-6 h-6 rounded-full border border-slate-800 bg-slate-900 ${systemActive ? 'animate-pulse' : ''}`}></div>
                   </div>
                 ))}
                 
                 <div className="text-[10px] text-purple-500 font-black uppercase mt-4 mb-1 ml-1">Array B</div>
                 {[1,2].map(i => (
                   <div key={`B-${i}`} className={`w-8 h-12 bg-black border-2 rounded-sm relative overflow-hidden flex items-center justify-center transition-colors duration-500 ${cancellationActive ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-slate-700'}`}>
                     <div className={`w-6 h-6 rounded-full border border-slate-800 bg-slate-900 ${systemActive ? 'animate-pulse' : ''} ${cancellationActive ? 'shadow-[inset_0_0_10px_rgba(168,85,247,0.8)]' : ''}`}></div>
                   </div>
                 ))}
               </div>

               {/* Neighborhood Perimeter Line */}
               <div className="absolute right-12 top-0 bottom-0 w-1 bg-red-500/20 z-10 border-r border-dashed border-red-500/50"></div>
               <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-[8px] font-bold text-red-400 uppercase tracking-widest writing-vertical-rl rotate-180">
                 City Boundary Limits
               </div>

               {/* Sound Waves Animation */}
               <div className="absolute left-16 right-12 top-0 bottom-0 overflow-hidden z-10">
                 {/* Array A Waves (Primary Audio) */}
                 <svg className="absolute inset-0 w-full h-full opacity-60">
                   {systemActive && (
                     <path 
                       d="M0 300 Q 50 200, 100 300 T 200 300 T 300 300" 
                       fill="none" 
                       stroke="#4f46e5" 
                       strokeWidth="4" 
                       className="animate-wave-move"
                     />
                   )}
                 </svg>

                 {/* Array B Waves (Cancellation Audio) */}
                 <svg className="absolute inset-0 w-full h-full opacity-60">
                   {cancellationActive && (
                     <path 
                       d="M0 300 Q 50 400, 100 300 T 200 300 T 300 300" // Inverted sine wave
                       fill="none" 
                       stroke="#a855f7" 
                       strokeWidth="4" 
                       className="animate-wave-move"
                     />
                   )}
                 </svg>

                 {/* Resultant Waveform overlay near perimeter */}
                 {cancellationActive && (
                   <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-16 h-32 flex items-center bg-black/50 backdrop-blur-sm border-l border-emerald-500/50 border-y border-emerald-500/20 rounded-l-xl z-30 justify-center">
                      <div className="w-12 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                      <span className="absolute bottom-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest">Null Zone</span>
                   </div>
                 )}
               </div>

               <style dangerouslySetInnerHTML={{__html: `
                 @keyframes wave-move {
                   from { transform: translateX(-100px); }
                   to { transform: translateX(0); }
                 }
                 .animate-wave-move {
                   animation: wave-move 0.5s linear infinite;
                 }
               `}} />

               {/* Status Overlay */}
               <div className="absolute bottom-6 inset-x-6 bg-black/80 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md z-30 text-center">
                 
                 {cancellationActive ? (
                   <>
                     <span className="text-2xl mb-1 block">🔇</span>
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Destructive Interference Active</p>
                     <p className="text-xs text-slate-400 font-mono">Spill safely cancelled at boundary.</p>
                   </>
                 ) : systemActive && perimeterDb >= LEGAL_LIMIT_DB ? (
                   <>
                     <span className="text-2xl mb-1 block animate-bounce">🚨</span>
                     <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Warning: Violation Imminent</p>
                     <p className="text-xs text-slate-400 font-mono">Initializing DSP countermeasures...</p>
                   </>
                 ) : (
                   <>
                     <span className="text-2xl mb-1 block opacity-50">🎵</span>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Acoustic Status Nominal</p>
                     <p className="text-xs text-slate-600 font-mono">Standard cardioid propagation.</p>
                   </>
                 )}

               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicSubwooferPhasing;
