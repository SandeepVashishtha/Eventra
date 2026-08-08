/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MultiStageAudioSync = () => {
  const [syncActive, setSyncActive] = useState(false);
  const [syncState, setSyncState] = useState('DISSONANT'); // DISSONANT, NUDGING, PHASE_LOCKED
  
  // Audio Clock States
  const [stageABPM, setStageABPM] = useState(126.0);
  const [stageBBPM, setStageBBPM] = useState(128.0);
  const [targetBPM, setTargetBPM] = useState(127.0);
  
  // UI Visuals
  const [phaseOffset, setPhaseOffset] = useState(45); // Degrees out of phase
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:15:00', type: 'SYS', msg: 'Distributed PTP Audio Clock Hub online.' },
    { id: 2, time: '20:15:02', type: 'SYS', msg: 'Ingesting MIDI/SMPTE timecode from Stage A & B.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (syncActive) {
      if (syncState === 'DISSONANT') {
        loop = setInterval(() => {
          // Slight natural DJ drift
          setStageABPM(Math.max(125.8, Math.min(126.2, 126.0 + (Math.random() * 0.2 - 0.1))));
          setStageBBPM(Math.max(127.8, Math.min(128.2, 128.0 + (Math.random() * 0.2 - 0.1))));
          setPhaseOffset(Math.random() * 180); // Chaotic phase
        }, 500);
      } else if (syncState === 'NUDGING') {
        loop = setInterval(() => {
          setStageABPM(prev => {
            const next = prev + 0.1;
            if (next >= targetBPM - 0.05) return targetBPM;
            return next;
          });
          
          setStageBBPM(prev => {
            const next = prev - 0.1;
            if (next <= targetBPM + 0.05) return targetBPM;
            return next;
          });
          
          setPhaseOffset(prev => Math.max(0, prev - 5)); // Bringing into phase
          
          if (stageABPM === targetBPM && stageBBPM === targetBPM) {
            setSyncState('PHASE_LOCKED');
            setPhaseOffset(0);
            addLog('SUCCESS', `Multi-Stage Phase Lock Achieved at ${targetBPM.toFixed(1)} BPM.`);
            addLog('DSP', 'Overlap zone transformed into synchronized polyrhythm.');
          }
        }, 300);
      } else if (syncState === 'PHASE_LOCKED') {
        loop = setInterval(() => {
          // Locked together, slight drift compensated
          const drift = Math.random() * 0.04 - 0.02;
          setStageABPM(targetBPM + drift);
          setStageBBPM(targetBPM + drift);
          setPhaseOffset(0); // Perfect lock
        }, 500);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [syncActive, syncState, stageABPM, stageBBPM, targetBPM]);

  const initiateSync = () => {
    if (syncActive && syncState === 'DISSONANT') {
      const target = (stageABPM + stageBBPM) / 2;
      setTargetBPM(target);
      setSyncState('NUDGING');
      addLog('ACTION', 'Proximity threshold met (126 vs 128 BPM). Initiating DSP tempo override.');
      addLog('DSP', `Gently nudging both master clocks towards ${target.toFixed(1)} BPM target...`);
    }
  };

  const resetAudio = () => {
    setSyncState('DISSONANT');
    setStageABPM(126.0);
    setStageBBPM(128.0);
    setPhaseOffset(45);
    addLog('WARN', 'DSP Lock released. DJs returned to manual tempo control.');
  };

  const toggleSystem = () => {
    if (!syncActive) {
      setSyncActive(true);
      addLog('SYS', 'Real-Time DSP Tempo Manipulation Armed.');
    } else {
      setSyncActive(false);
      resetAudio();
      addLog('WARN', 'Clock Sync offline. Attendee overlap zone reverting to cacophony.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Audio Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎵</span> Distributed Clock Sync
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-Stage Audio Sync <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">Overlap Zones</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When attendees walk between Stage A and Stage B, the sound bleeds together, creating a jarring cacophony of two unmatched tempos that causes physical disorientation. Eventra solves this by intercepting the master clock (MIDI/SMPTE) from both stages via a central DSP hub. If the DJs are playing at similar tempos (e.g., 126 and 128 BPM), the algorithm gently nudges the pitch/tempo of both stages to exactly match in the middle (127 BPM). The acoustic overlap zone instantly transforms from a trainwreck into a cohesive, perfectly synchronized polyrhythm.
          </p>

          <div className="bg-[#120a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">⏱️</span> Master SMPTE Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     syncActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {syncActive ? 'Release Clock Lock' : 'Arm PTP Sync'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Stage A */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 syncState === 'PHASE_LOCKED' ? 'bg-purple-950/40 border-purple-500/50 shadow-inner' :
                 syncState === 'NUDGING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50' :
                 syncActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Stage A Clock
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     syncState === 'PHASE_LOCKED' ? 'text-purple-400' :
                     syncState === 'NUDGING' ? 'text-fuchsia-400' :
                     syncActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {syncActive ? stageABPM.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">BPM</span>
                 </div>
               </div>

               {/* Stage B */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 syncState === 'PHASE_LOCKED' ? 'bg-purple-950/40 border-purple-500/50 shadow-inner' :
                 syncState === 'NUDGING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50' :
                 syncActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Stage B Clock
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     syncState === 'PHASE_LOCKED' ? 'text-purple-400' :
                     syncState === 'NUDGING' ? 'text-fuchsia-400' :
                     syncActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {syncActive ? stageBBPM.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">BPM</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050207] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>DSP Analytics Log</span>
                 {syncState === 'NUDGING' && <span className="text-fuchsia-400 animate-pulse">Syncing...</span>}
                 {syncState === 'PHASE_LOCKED' && <span className="text-purple-400 animate-pulse">LOCKED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-purple-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'DSP' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* Audio Phase Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">BLEED ZONE POV</span>
                <span className="text-[8px] font-mono text-slate-400">PHASE ALIGNMENT</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMSIvPjwvc3ZnPg==')]"></div>

                {/* Oscilloscope View */}
                <div className="relative w-full h-48 border border-slate-700 bg-black rounded-lg flex items-center justify-center overflow-hidden z-10 shadow-inner">
                  
                  {/* Center Line */}
                  <div className="absolute w-full h-px bg-slate-700 top-1/2"></div>
                  
                  {/* Stage A Waveform (Cyan) */}
                  <div className="absolute inset-0 flex items-center opacity-80 mix-blend-screen"
                       style={{ 
                         transform: `translateX(${syncActive && syncState === 'PHASE_LOCKED' ? 0 : Math.sin(Date.now() / 200) * phaseOffset}px)`
                       }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                       <path 
                         d="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50" 
                         fill="none" stroke="#22d3ee" strokeWidth="4" 
                         className={syncActive ? 'animate-[dash_1s_linear_infinite]' : ''}
                         style={{ strokeDasharray: '100', animationDuration: `${60 / stageABPM}s` }}
                       />
                    </svg>
                  </div>

                  {/* Stage B Waveform (Pink) */}
                  <div className="absolute inset-0 flex items-center opacity-80 mix-blend-screen"
                       style={{ 
                         transform: `translateX(${syncActive && syncState === 'PHASE_LOCKED' ? 0 : Math.cos(Date.now() / 200) * phaseOffset}px)`
                       }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                       <path 
                         d="M0,50 Q25,90 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50" 
                         fill="none" stroke="#ec4899" strokeWidth="4" 
                         className={syncActive ? 'animate-[dash_1s_linear_infinite]' : ''}
                         style={{ strokeDasharray: '100', animationDuration: `${60 / stageBBPM}s` }}
                       />
                    </svg>
                  </div>

                  {/* Lock Indicator */}
                  {syncState === 'PHASE_LOCKED' && (
                    <div className="absolute inset-0 border-4 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)_inset] animate-pulse pointer-events-none"></div>
                  )}

                </div>

                {/* State Text */}
                <div className="mt-6 flex flex-col items-center z-10">
                   <span className={`text-[12px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                     syncState === 'PHASE_LOCKED' ? 'bg-purple-900/40 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
                     syncState === 'NUDGING' ? 'bg-fuchsia-900/40 border-fuchsia-500 text-fuchsia-400' :
                     syncActive ? 'bg-red-900/40 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                   }`}>
                     {syncActive ? syncState.replace('_', ' ') : 'OFFLINE'}
                   </span>
                   {syncState === 'PHASE_LOCKED' && (
                     <span className="text-[10px] font-mono text-slate-400 mt-2">Zero Dissonance Detected</span>
                   )}
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={initiateSync}
                disabled={!syncActive || syncState !== 'DISSONANT'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !syncActive || syncState !== 'DISSONANT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-400 hover:bg-fuchsia-900/60'
                }`}
              >
                Trigger DSP Nudge (127 BPM)
              </button>
              
              <button 
                onClick={resetAudio}
                disabled={!syncActive || syncState === 'DISSONANT'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !syncActive || syncState === 'DISSONANT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Abort Sync Lock
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MultiStageAudioSync;
