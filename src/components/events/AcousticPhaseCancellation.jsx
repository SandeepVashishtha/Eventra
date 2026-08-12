/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticPhaseCancellation = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [bleedStatus, setBleedStatus] = useState('SEVERE'); // SEVERE, CALCULATING, NULL_ZONE_ACTIVE
  
  // Acoustic Metrics
  const [stageADelay, setStageADelay] = useState(0); // ms
  const [stageBDelay, setStageBDelay] = useState(0); // ms
  const [phaseShiftAngle, setPhaseShiftAngle] = useState(0); // degrees
  const [soundBleedIntensity, setSoundBleedIntensity] = useState(85); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '15:00:00', type: 'SYS', msg: 'DSP Phase Alignment Engine initialized.' },
    { id: 2, time: '15:00:02', type: 'WARN', msg: 'Severe low-frequency ghosting detected at Zone 4 (Intersection).' }
  ]);

  useEffect(() => {
    let loop;
    
    if (!engineActive) {
      loop = setInterval(() => {
        setSoundBleedIntensity(prev => Math.min(95, Math.max(75, prev + (Math.random() * 10 - 5))));
      }, 500);
    } else if (bleedStatus === 'CALCULATING') {
      loop = setInterval(() => {
        setStageADelay(prev => Math.min(145.2, prev + 15));
        setStageBDelay(prev => Math.min(112.8, prev + 10));
        setPhaseShiftAngle(prev => Math.min(180, prev + 20));
        
        if (phaseShiftAngle >= 170) {
          setBleedStatus('NULL_ZONE_ACTIVE');
          addLog('SUCCESS', '180-Degree Phase Inversion achieved at intersect coordinates.');
          addLog('ACTION', 'Subwoofer arrays aligned. Destructive interference locked.');
        }
      }, 300);
    } else if (bleedStatus === 'NULL_ZONE_ACTIVE') {
       loop = setInterval(() => {
         // Sound bleed is drastically reduced
         setSoundBleedIntensity(prev => Math.max(12, prev - 10));
       }, 300);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [engineActive, bleedStatus, phaseShiftAngle]);

  const toggleDSP = () => {
    if (!engineActive) {
      setEngineActive(true);
      setBleedStatus('CALCULATING');
      addLog('SYS', 'Engaging DSP Phase Cancellation Engine.');
      addLog('AI', 'Calculating geometric acoustic delays for Zone 4...');
    } else {
      setEngineActive(false);
      setBleedStatus('SEVERE');
      setStageADelay(0);
      setStageBDelay(0);
      setPhaseShiftAngle(0);
      setSoundBleedIntensity(85);
      addLog('WARN', 'DSP engine bypassed. Severe acoustic ghosting resumed.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#051114] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Acoustic Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔈</span> DSP Phase Cancellation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Acoustic Ghosting & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Echo Mitigation Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When multiple stages are placed near each other due to spatial constraints, "sound bleed" causes overlapping bass frequencies that ruin the audio experience for attendees standing in the middle, forcing organizers to turn the music down or build massive shipping container walls. Eventra solves this using acoustic physics and real-time DSP. The engine calculates the exact acoustic delay from Stage A and Stage B to the intersecting crowd zone, and slightly shifts the phase of the subwoofers (up to 180 degrees) to create a "Null Zone" of destructive interference exactly at the border, drastically reducing sound bleed without sacrificing volume.
          </p>

          <div className="bg-[#091a1a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Acoustic Alignment Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleDSP}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Bypass DSP Processing' : 'Engage Phase Alignment'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Sound Bleed Intensity */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bleedStatus === 'SEVERE' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 bleedStatus === 'CALCULATING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 'bg-emerald-950/20 border-emerald-900/50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Intersection Bleed
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     bleedStatus === 'SEVERE' ? 'text-red-500' :
                     bleedStatus === 'CALCULATING' ? 'text-yellow-400' : 'text-emerald-400'
                   }`}>
                     {Math.floor(soundBleedIntensity)}%
                   </span>
                 </div>
               </div>

               {/* Timing Delays */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Alignment Delay (ms)
                 </span>
                 <div className="flex flex-col text-[10px] font-mono text-slate-400 space-y-1">
                   <div className="flex justify-between border-b border-slate-700 pb-1">
                     <span>Stage A:</span>
                     <span className={engineActive ? 'text-emerald-400 font-bold' : ''}>{stageADelay.toFixed(1)}</span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span>Stage B:</span>
                     <span className={engineActive ? 'text-teal-400 font-bold' : ''}>{stageBDelay.toFixed(1)}</span>
                   </div>
                 </div>
               </div>

               {/* Phase Shift */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bleedStatus === 'NULL_ZONE_ACTIVE' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DSP Phase Shift
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     bleedStatus === 'NULL_ZONE_ACTIVE' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(phaseShiftAngle)}°
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#02080a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Physics Log</span>
                 {bleedStatus === 'CALCULATING' && <span className="text-yellow-400 animate-pulse">Computing Delays...</span>}
                 {bleedStatus === 'NULL_ZONE_ACTIVE' && <span className="text-emerald-400 animate-pulse">Null Zone Maintained</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-500 font-bold' :
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 
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
            
            {/* Top-Down Map Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">AERIAL PROPAGATION MAP</span>
                <span className="text-[8px] font-mono text-slate-400">LF BASS FREQUENCIES (30-80Hz)</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-center justify-center p-6">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMHptMTktMXZoLTE4VjE5eiIgZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-50 z-0"></div>

                <div className="relative w-full h-full">
                  
                  {/* Stage A (Top Left) */}
                  <div className="absolute top-[10%] left-[10%] z-20">
                    <div className="w-16 h-8 bg-slate-800 border-2 border-emerald-500/50 rounded flex items-center justify-center">
                      <span className="text-[10px] font-black text-emerald-400">STAGE A</span>
                    </div>
                  </div>

                  {/* Stage A Acoustic Waves */}
                  <div className="absolute top-[15%] left-[20%] w-[300px] h-[300px] border-4 border-emerald-500/30 rounded-full z-10 transform origin-top-left" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                  <div className="absolute top-[15%] left-[20%] w-[200px] h-[200px] border-4 border-emerald-500/40 rounded-full z-10 transform origin-top-left"></div>
                  <div className="absolute top-[15%] left-[20%] w-[100px] h-[100px] border-4 border-emerald-500/50 rounded-full z-10 transform origin-top-left"></div>

                  {/* Stage B (Bottom Right) */}
                  <div className="absolute bottom-[10%] right-[10%] z-20">
                    <div className="w-16 h-8 bg-slate-800 border-2 border-teal-500/50 rounded flex items-center justify-center">
                      <span className="text-[10px] font-black text-teal-400">STAGE B</span>
                    </div>
                  </div>

                  {/* Stage B Acoustic Waves */}
                  <div className={`absolute bottom-[15%] right-[20%] w-[300px] h-[300px] border-4 rounded-full z-10 transform origin-bottom-right transition-all duration-1000 ${
                    bleedStatus === 'NULL_ZONE_ACTIVE' ? 'border-teal-500/30 border-dashed animate-[spin_10s_linear_reverse]' : 'border-red-500/30'
                  }`}></div>
                  <div className={`absolute bottom-[15%] right-[20%] w-[200px] h-[200px] border-4 rounded-full z-10 transform origin-bottom-right transition-all duration-1000 ${
                    bleedStatus === 'NULL_ZONE_ACTIVE' ? 'border-teal-500/40 border-dashed animate-[spin_8s_linear_reverse]' : 'border-red-500/40'
                  }`}></div>
                  <div className={`absolute bottom-[15%] right-[20%] w-[100px] h-[100px] border-4 rounded-full z-10 transform origin-bottom-right transition-all duration-1000 ${
                    bleedStatus === 'NULL_ZONE_ACTIVE' ? 'border-teal-500/50 border-dashed animate-[spin_6s_linear_reverse]' : 'border-red-500/50'
                  }`}></div>

                  {/* Interference Zone (Center) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                    
                    {/* Zone Boundary */}
                    <div className={`w-32 h-32 rounded-full border-2 transition-all duration-500 flex items-center justify-center backdrop-blur-sm ${
                      bleedStatus === 'SEVERE' ? 'border-red-500 bg-red-900/40 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 
                      bleedStatus === 'CALCULATING' ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 
                      'border-cyan-500 bg-cyan-900/10 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    }`}>
                       {/* The wave phase graphic */}
                       <svg width="60" height="40" viewBox="0 0 100 50" className="opacity-80">
                         {/* Wave A (Fixed) */}
                         <path d="M 0 25 Q 12.5 0, 25 25 T 50 25 T 75 25 T 100 25" fill="none" stroke="#10b981" strokeWidth="3" />
                         
                         {/* Wave B (Phase Shifting) */}
                         <path 
                           d="M 0 25 Q 12.5 0, 25 25 T 50 25 T 75 25 T 100 25" 
                           fill="none" 
                           stroke={bleedStatus === 'SEVERE' ? '#ef4444' : '#14b8a6'} 
                           strokeWidth="3" 
                           style={{ 
                             transform: `translateX(${bleedStatus === 'NULL_ZONE_ACTIVE' ? '25px' : '0px'})`,
                             transition: 'transform 1s ease-in-out'
                           }}
                         />
                       </svg>
                    </div>
                    
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 bg-black/80 px-2 py-1 rounded mt-2 border border-slate-700">
                      Zone 4
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 px-1 rounded ${
                      bleedStatus === 'SEVERE' ? 'bg-red-500 text-white' : 
                      bleedStatus === 'CALCULATING' ? 'text-yellow-400' : 'bg-cyan-500 text-black'
                    }`}>
                      {bleedStatus === 'SEVERE' ? 'Massive Bleed' : 
                       bleedStatus === 'CALCULATING' ? 'Aligning...' : 'Null Zone Active'}
                    </span>

                  </div>

                </div>

              </div>
            </div>

            {/* Interaction Button */}
            <div className="w-full">
              <button 
                onClick={toggleDSP}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition shadow-md border ${
                  engineActive ? 'bg-slate-900 border-slate-800 text-slate-600 hover:bg-slate-800' : 
                  'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)]'
                }`}
              >
                {engineActive ? 'Bypass Engine (Restore Bleed)' : 'Engage Phase Cancellation'}
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AcousticPhaseCancellation;
