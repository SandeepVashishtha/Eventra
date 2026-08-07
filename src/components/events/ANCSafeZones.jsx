/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ANCSafeZones = () => {
  const [ancActive, setAncActive] = useState(false);
  const [stageDecibels, setStageDecibels] = useState(85);
  const [zoneDecibels, setZoneDecibels] = useState(85);
  const [phaseInversion, setPhaseInversion] = useState(false);
  
  const [dspLog, setDspLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'DSP Array booted. Geofenced ANC zones established.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting phase manipulation command.' }
  ]);

  // Audio wave visualization
  const [stageWave, setStageWave] = useState(Array(20).fill(0));
  const [ancWave, setAncWave] = useState(Array(20).fill(0));
  const [resultWave, setResultWave] = useState(Array(20).fill(0));

  useEffect(() => {
    let loop;
    loop = setInterval(() => {
      // Simulate live stage audio pumping
      const currentStageVol = Math.floor(Math.random() * 20 + 95); // 95 to 115 dB
      setStageDecibels(currentStageVol);
      
      const newStageWave = Array(20).fill(0).map(() => Math.random() * 100);
      setStageWave(newStageWave);

      if (ancActive) {
        // DSP processing delay simulation
        setPhaseInversion(true);
        
        // Generate the exact inverted wave
        const invertedWave = newStageWave.map(val => val * -1);
        setAncWave(invertedWave);

        // Resulting wave in the safe zone is flattened out
        const flattened = newStageWave.map(val => (Math.random() * 20 - 10)); // Just noise left
        setResultWave(flattened);
        
        // Final dB drops by roughly 25dB
        setZoneDecibels(currentStageVol - 26);
      } else {
        setPhaseInversion(false);
        setAncWave(Array(20).fill(0));
        setResultWave(newStageWave); // Without ANC, zone hears full volume
        setZoneDecibels(currentStageVol);
      }
    }, 400);

    return () => clearInterval(loop);
  }, [ancActive]);

  const toggleANC = () => {
    if (!ancActive) {
      setAncActive(true);
      addLog('ACTION', 'Engaging Active Noise Cancellation Arrays.');
      addLog('SUCCESS', 'Phase inversion achieved. Projecting destructive interference.');
    } else {
      setAncActive(false);
      addLog('WARN', 'ANC Arrays offline. Safe zones exposed to full stage volume.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setDspLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper for rendering waves
  const renderWave = (data, color, inverted = false) => (
    <div className="flex items-center h-20 w-full justify-between px-2">
      {data.map((val, i) => (
        <div 
          key={i}
          className="w-2 rounded-full transition-all duration-300"
          style={{ 
            height: `${Math.max(4, Math.abs(val) * 0.8)}%`, 
            backgroundColor: color,
            transform: inverted ? (val < 0 ? 'rotate(180deg) translateY(100%)' : 'none') : 'none',
            boxShadow: `0 0 8px ${color}`
          }}
        ></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Acoustic Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔈</span> Acoustic DSP Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Noise-Cancellation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Safe Zones</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Neurodivergent attendees often suffer sensory overload from extreme volume at festivals. Physical "quiet rooms" exist, but they are usually far away from the stage, ruining the concert experience. Eventra solves this by creating designated VIP zones integrated with advanced Active Noise Cancellation (ANC) speaker arrays. The DSP engine monitors the live PA output and projects mathematically inverted soundwaves specifically into these geometrical zones. This destructive interference drops the perceived decibel level by ~25dB, creating a comfortable "bubble" without requiring physical walls.
          </p>

          <div className="bg-[#0b1219] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> DSP Phase Manipulator
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleANC}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     ancActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-slate-900 shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {ancActive ? 'Disable ANC Arrays' : 'Engage ANC Bubble'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Stage Volume */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Stage PA Output</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono leading-none text-rose-500">
                     {stageDecibels}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">dB</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full transition-all duration-300 bg-rose-500"
                     style={{ width: `${Math.min(100, (stageDecibels / 120) * 100)}%` }}
                   ></div>
                 </div>
               </div>

               {/* Safe Zone Volume */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ancActive ? 'bg-teal-950/40 border-teal-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Sensory Safe Zone</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${ancActive ? 'text-teal-400' : 'text-rose-500'}`}>
                     {zoneDecibels}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">dB</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-300 ${ancActive ? 'bg-teal-400' : 'bg-rose-500'}`}
                     style={{ width: `${Math.min(100, (zoneDecibels / 120) * 100)}%` }}
                   ></div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Engineering Log</span>
                 {ancActive && <span className="text-teal-400 animate-pulse">Inverting Phase...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {dspLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-cyan-400' : 
                       log.type === 'WARN' ? 'text-rose-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Oscilloscope Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* Oscilloscope Panel */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#111] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 bg-slate-950 transition-all duration-300 ${
              ancActive ? 'shadow-[0_0_80px_rgba(20,184,166,0.2)] border-slate-800' : ''
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none border-b border-slate-800 bg-black/60">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  Real-Time Oscilloscope
                </span>
              </div>

              <div className="flex-1 relative flex flex-col bg-[#05090f] overflow-hidden pt-8 divide-y divide-slate-800/50">
                
                {/* 1. Source Audio */}
                <div className="flex-1 relative flex items-center justify-center p-2">
                   <div className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest text-rose-500/50">1. Source (Stage)</div>
                   {renderWave(stageWave, '#f43f5e')}
                </div>

                {/* 2. Destructive Interference Generation */}
                <div className="flex-1 relative flex items-center justify-center p-2 bg-slate-900/20">
                   <div className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest text-teal-500/50">2. ANC DSP Engine (Inverted)</div>
                   {ancActive ? (
                     renderWave(ancWave, '#14b8a6', true)
                   ) : (
                     <div className="text-slate-700 font-mono text-xs opacity-50">BYPASS (OFF)</div>
                   )}
                </div>

                {/* 3. Result in Zone */}
                <div className="flex-1 relative flex items-center justify-center p-2">
                   <div className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest text-white/50">3. Safe Zone Result</div>
                   {renderWave(resultWave, ancActive ? '#64748b' : '#f43f5e')}
                </div>

              </div>
            </div>

            {/* Hardware Information */}
            <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Acoustic Status</span>
              {ancActive ? (
                <p className="text-xs font-bold text-teal-400">✅ Destructive Interference Locked. Safe Zone at ~{zoneDecibels}dB.</p>
              ) : (
                <p className="text-xs font-bold text-rose-400">⚠️ ANC Offline. Zone exposed to {stageDecibels}dB.</p>
              )}
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ANCSafeZones;
