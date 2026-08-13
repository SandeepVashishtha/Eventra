/* eslint-disable */
import React, { useState, useEffect } from 'react';

const NoiseCancelBubble = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // DSP Metrics
  const [rawBleedDb, setRawBleedDb] = useState(95); // Ambient noise from stage
  const [reductionDb, setReductionDb] = useState(0); // Noise cancelled
  const [dspLatency, setDspLatency] = useState(0); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Active Noise Control (ANC) Array Online.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'DSP ingesting master FOH audio feed.' }
  ]);

  // Visualizer State
  const [stageWaves, setStageWaves] = useState([]);
  const [antiWaves, setAntiWaves] = useState([]);
  const [bassDrop, setBassDrop] = useState(false);

  useEffect(() => {
    let loop;
    
    // Simulate ambient noise baseline
    const baseDb = bassDrop ? 115 : 95 + Math.random() * 5;
    setRawBleedDb(baseDb);
    
    if (systemActive) {
        setReductionDb(Math.min(22, baseDb - 75)); // Try to bring it down to 75dB (conversational)
        setDspLatency(1.2 + Math.random() * 0.5); // Very low latency required for ANC
    } else {
        setReductionDb(0);
        setDspLatency(0);
    }

    loop = setInterval(() => {
        // Generate Stage Waves (Red)
        setStageWaves(prev => [...prev, {
            id: Date.now() + Math.random(),
            radius: 10,
            opacity: 0.8
        }].slice(-6));

        // Generate Anti-Waves (Blue) if active
        if (systemActive) {
            setAntiWaves(prev => [...prev, {
                id: Date.now() + Math.random(),
                radius: 100, // Starts large and shrinks inward
                opacity: 0.8
            }].slice(-6));
        } else {
            setAntiWaves([]);
        }

        // Animate waves
        setStageWaves(prev => prev.map(w => ({
            ...w,
            radius: w.radius + (bassDrop ? 8 : 4),
            opacity: w.opacity - 0.05
        })).filter(w => w.opacity > 0 && w.radius < 150));
        
        setAntiWaves(prev => prev.map(w => ({
            ...w,
            radius: w.radius - (bassDrop ? 4 : 2), // Shrinks towards center
            opacity: w.opacity - 0.05
        })).filter(w => w.opacity > 0 && w.radius > 10));

    }, 150); 
    
    return () => clearInterval(loop);
  }, [systemActive, bassDrop]);

  const triggerBassDrop = () => {
      setBassDrop(true);
      addLog('CRIT', 'Subwoofer spike detected: 115dB Low-Frequency Oscillation.');
      
      if (systemActive) {
          addLog('ACTION', 'DSP matching phase-inversion amplitude. Pumping anti-bass.');
      } else {
          addLog('WARN', 'ANC Offline. Vendor zone overwhelmed by acoustic bleed.');
      }
      
      setTimeout(() => {
          setBassDrop(false);
      }, 3000);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Phase-Inversion Array Active. Establishing Destructive Interference Field.');
    } else {
      setSystemActive(false);
      addLog('WARN', 'ANC Array Disabled. Noise cancellation bubble collapsed.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const netNoise = rawBleedDb - reductionDb;

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Acoustic Physics DSP
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Driven Noise <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-500">Cancellation Bubbles</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Chill-out zones and food vendor areas are often completely overwhelmed by massive acoustic bleed from the main stage subwoofers, making it impossible to communicate or relax. Eventra solves this by installing an array of directional acoustic phase-inversion speakers around designated quiet zones. Eventra's AI ingests the live master feed from the surrounding stages and instantly broadcasts the exact inverse soundwaves into the zone, creating a destructive interference field (a 20dB "noise cancellation bubble") in an open-air environment.
          </p>

          <div className="bg-[#060a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🎛️</span> DSP Interference Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Collapse ANC Bubble' : 'Deploy Anti-Noise Field'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Raw Acoustic Bleed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 rawBleedDb > 105 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Stage Bleed (Raw)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     rawBleedDb > 105 ? 'text-red-400 animate-pulse' : 'text-orange-400'
                   }`}>
                     {Math.floor(rawBleedDb)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

               {/* Noise Reduction */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-sky-950/40 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Phase Inversion
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     -{Math.floor(reductionDb)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* Net Quiet Zone */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 netNoise <= 80 ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Net Zone Level
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     netNoise <= 80 ? 'text-emerald-400' : 'text-red-400'
                   }`}>
                     {Math.floor(netNoise)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020406] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Interference Ledger</span>
                 {systemActive && <span className="text-sky-400 font-black animate-pulse">DSP LATENCY: {dspLatency.toFixed(1)}ms</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' : 'text-slate-400'
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
            
            {/* Acoustic Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#060a12]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">ACOUSTIC INTERFERENCE MAP</span>
                <span className="text-[8px] font-mono text-slate-400">VENDOR ZONE</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* The Main Stage (Top Left) */}
                  <div className="absolute top-8 left-8 flex flex-col items-center z-30">
                      <div className="w-16 h-16 bg-black rounded-lg border-2 border-red-900/50 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                          <div className={`w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center transition-transform ${bassDrop ? 'scale-125 bg-red-900/30' : 'bg-slate-900'}`}>
                              <div className="w-4 h-4 bg-black rounded-full border border-slate-700"></div>
                          </div>
                          {bassDrop && <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>}
                      </div>
                      <span className="text-[8px] font-black uppercase text-red-500 mt-2">Main Stage</span>
                  </div>

                  {/* Stage Soundwaves (Red) */}
                  {stageWaves.map(w => (
                      <div 
                          key={w.id}
                          className="absolute border-2 border-red-500 rounded-full pointer-events-none"
                          style={{
                              left: '3rem', // Center of stage
                              top: '3rem', // Center of stage
                              width: `${w.radius * 2}px`,
                              height: `${w.radius * 2}px`,
                              transform: 'translate(-50%, -50%)',
                              opacity: w.opacity * (bassDrop ? 1 : 0.4),
                              boxShadow: bassDrop ? '0 0 10px rgba(239,68,68,0.5)' : 'none'
                          }}
                      ></div>
                  ))}

                  {/* The Chill-out Zone (Bottom Right) */}
                  <div className="absolute bottom-12 right-12 z-30 flex items-center justify-center">
                      
                      {/* Quiet Bubble Forcefield */}
                      <div className={`absolute w-40 h-40 rounded-full transition-all duration-500 flex items-center justify-center ${
                          systemActive ? 'bg-sky-500/10 border border-sky-400/50 shadow-[0_0_30px_rgba(14,165,233,0.3)]' : 'border border-slate-700/50 border-dashed'
                      }`}>
                          
                          {/* Inner Zone indicator */}
                          <div className={`text-[10px] font-black uppercase tracking-widest text-center px-4 py-2 rounded-full backdrop-blur-sm transition-colors ${
                              systemActive ? 'text-sky-300 bg-sky-900/30' : 'text-slate-500 bg-slate-900/80'
                          }`}>
                              {systemActive ? 'Quiet Zone' : 'Loud Zone'}
                              <br/>
                              <span className={`font-mono text-xs ${systemActive ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {Math.floor(netNoise)} dB
                              </span>
                          </div>

                          {/* Perimeter Speakers */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-sky-500 rounded"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-black border border-sky-500 rounded"></div>
                          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-sky-500 rounded"></div>
                          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-sky-500 rounded"></div>
                      </div>

                      {/* Anti-Noise Soundwaves (Blue - Shrinking inward) */}
                      {antiWaves.map(w => (
                          <div 
                              key={w.id}
                              className="absolute border border-sky-400 rounded-full pointer-events-none"
                              style={{
                                  width: `${w.radius * 2}px`,
                                  height: `${w.radius * 2}px`,
                                  opacity: w.opacity * 0.5,
                                  boxShadow: '0 0 5px rgba(14,165,233,0.5)'
                              }}
                          ></div>
                      ))}

                  </div>
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#060a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Acoustic Events</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerBassDrop}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     bassDrop ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   🔊 Trigger Stage Subwoofer Drop
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default NoiseCancelBubble;
