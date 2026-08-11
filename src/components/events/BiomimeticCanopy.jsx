/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiomimeticCanopy = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [ancState, setAncState] = useState('PASSIVE'); // PASSIVE, CALIBRATING, ACTIVE
  
  // Acoustic Metrics
  const [internalDb, setInternalDb] = useState(65); // dB SPL
  const [externalDb, setExternalDb] = useState(65); // dB SPL outside canopy
  const [phaseInversionLoad, setPhaseInversionLoad] = useState(0); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:45:00', type: 'SYS', msg: 'Biomimetic Metamaterial Canopy deployed.' },
    { id: 2, time: '21:45:02', type: 'SYS', msg: 'ANC Nodes awaiting acoustic calibration.' }
  ]);

  // Visualizer State
  const [soundWaves, setSoundWaves] = useState([]);
  const [ancWaves, setAncWaves] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          const currentBaseVolume = 115 + (Math.random() * 10 - 5); // Very loud festival
          setInternalDb(currentBaseVolume);
          
          if (ancState === 'PASSIVE') {
              // Sound escapes
              setExternalDb(prev => (prev * 0.8) + (currentBaseVolume * 0.9 * 0.2)); 
              setPhaseInversionLoad(0);
              
              // Generate escaping waves
              if (Math.random() > 0.5) {
                  setSoundWaves(prev => [...prev.filter(w => Date.now() - w.id < 2000), {
                      id: Date.now(),
                      amplitude: currentBaseVolume
                  }]);
              }
              setAncWaves([]);
              
          } else if (ancState === 'CALIBRATING') {
              setPhaseInversionLoad(prev => Math.min(100, prev + 5));
          } else if (ancState === 'ACTIVE') {
              // Sound is trapped/cancelled
              setExternalDb(prev => {
                  const next = (prev * 0.9) + (45 * 0.1); // Drops down to ~45 dB (quiet city night)
                  return Math.max(40, next + (Math.random() * 2 - 1));
              });
              setPhaseInversionLoad(85 + Math.random() * 10);
              
              // Generate internal waves and ANC collision waves
              if (Math.random() > 0.3) {
                  const newId = Date.now();
                  setSoundWaves(prev => [...prev.filter(w => Date.now() - w.id < 1500), {
                      id: newId,
                      amplitude: currentBaseVolume
                  }]);
                  
                  // Spawn an inverted wave to match
                  setTimeout(() => {
                      if (ancState === 'ACTIVE') {
                          setAncWaves(prev => [...prev.filter(w => Date.now() - w.id < 1000), {
                              id: newId + 1,
                              amplitude: currentBaseVolume
                          }]);
                      }
                  }, 300); // Slight delay for visualization
              }
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, ancState]);

  const triggerEvent = (type) => {
    if (!systemActive) return;
    
    if (type === 'ENGAGE') {
        if (ancState === 'ACTIVE') return;
        setAncState('CALIBRATING');
        addLog('ACTION', 'Initiating Active Noise Cancellation (ANC) calibration sequence.');
        addLog('SYS', 'Analyzing outbound low-frequency subwoofer telemetry.');
        
        setTimeout(() => {
            setAncState('ACTIVE');
            addLog('SUCCESS', 'Calibration complete. Generating inverted phase waves.');
            addLog('AI', 'Acoustic boundary established. Urban noise pollution mitigated.');
        }, 2000);
    } else if (type === 'DISENGAGE') {
        if (ancState === 'PASSIVE') return;
        setAncState('PASSIVE');
        addLog('WARN', 'ANC Nodes disabled. Acoustic energy bypassing metamaterial canopy.');
        addLog('CRIT', 'WARNING: External decibel levels exceeding municipal curfew limits (85dB).');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setInternalDb(65);
      setExternalDb(65);
      setAncState('PASSIVE');
      addLog('SYS', 'Biomimetic Acoustic Canopy Telemetry Online.');
    } else {
      setSystemActive(false);
      setAncState('PASSIVE');
      setSoundWaves([]);
      setAncWaves([]);
      addLog('WARN', 'Canopy System Offline. Retracting nodes.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦉</span> Acoustic Metamaterials
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biomimetic Sound <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Insulation Canopy</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            City-based festivals face strict noise curfews because low-frequency bass travels for miles, angering local residents and resulting in massive municipal fines. Eventra solves this by deploying an overarching canopy made from biomimetic acoustic metamaterials (mimicking the silent flight of owl feathers). The system manages Active-Noise-Cancellation (ANC) nodes embedded in the canopy, generating inverted phase waves that physically trap the sound inside the festival grounds while maintaining pristine audio quality for attendees.
          </p>

          <div className="bg-[#050a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> ANC Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Retract Canopy' : 'Deploy Metamaterial Canopy'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Internal Volume */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive && internalDb > 110 ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Internal Stage SPL
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(internalDb)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

               {/* External Volume */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 externalDb > 85 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 ancState === 'ACTIVE' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   External Leakage
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-500 ${
                     externalDb > 85 ? 'text-red-500' :
                     ancState === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(externalDb)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* ANC Load */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ancState === 'ACTIVE' ? 'bg-cyan-950/30 border-cyan-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Phase Inversion
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     ancState === 'ACTIVE' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(phaseInversionLoad)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Physics Log</span>
                 {ancState === 'CALIBRATING' && <span className="text-cyan-400 animate-pulse">CALIBRATING DSP...</span>}
                 {ancState === 'ACTIVE' && <span className="text-emerald-400 font-black">ANC BOUNDARY SECURE</span>}
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
            
            {/* Canopy Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#050812]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">ACOUSTIC BOUNDARY VIZ</span>
                <span className="text-[8px] font-mono text-slate-400">CROSS-SECTION</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col justify-end">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CANOPY RETRACTED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col z-20">
                      
                      {/* The Metamaterial Canopy Arc */}
                      <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full border-t-8 border-x-8 z-30 transition-all duration-500 ${
                          ancState === 'ACTIVE' ? 'border-cyan-500/80 shadow-[inset_0_20px_50px_rgba(6,182,212,0.2),0_-10px_30px_rgba(6,182,212,0.4)]' : 
                          'border-slate-700 shadow-none'
                      }`}>
                          {/* ANC Nodes glowing */}
                          {ancState === 'ACTIVE' && (
                              <div className="absolute inset-0 rounded-full border-t border-cyan-300 animate-pulse mix-blend-screen opacity-50"></div>
                          )}
                      </div>

                      {/* External City (Outside Canopy) */}
                      <div className="absolute top-16 right-4 z-10 flex flex-col items-end">
                          <span className="text-xl">🏙️</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Local Residences</span>
                          
                          {/* Noise Complaint Indicator */}
                          {externalDb > 85 && (
                              <div className="mt-2 bg-red-900/80 border border-red-500 px-2 py-1 rounded animate-bounce">
                                  <span className="text-[8px] font-black text-white">⚠️ NOISE COMPLAINT</span>
                              </div>
                          )}
                      </div>

                      {/* Internal Stage/Crowd Area */}
                      <div className="absolute bottom-0 inset-x-0 h-32 flex justify-center items-end px-2 z-10">
                          {/* DJ/Stage */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-indigo-900 border border-indigo-500 rounded-t flex items-center justify-center z-20">
                              <span className="text-xs">🔊</span>
                          </div>
                          {/* Crowd */}
                          <div className="w-48 h-full bg-slate-900/50 rounded-t-full flex justify-center items-end pb-2">
                              <span className="text-2xl filter brightness-50">👥👥👥</span>
                          </div>
                      </div>

                      {/* Acoustic Waves Visualization */}
                      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                          
                          {/* Outbound Stage Audio Waves */}
                          {soundWaves.map(w => (
                              <div 
                                  key={w.id}
                                  className="absolute bottom-12 left-1/2 transform -translate-x-1/2 rounded-full border-2 border-indigo-500/60 animate-[expand_2s_ease-out_forwards]"
                              ></div>
                          ))}

                          {/* Inverted Phase ANC Waves (Coming DOWN from Canopy) */}
                          {ancWaves.map(w => (
                              <div 
                                  key={w.id}
                                  className="absolute top-[80px] left-1/2 transform -translate-x-1/2 rounded-full border-2 border-cyan-400/80 border-dashed animate-[collapse_1.5s_ease-in_forwards]"
                              ></div>
                          ))}
                          
                      </div>

                      {/* Status Indicators */}
                      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/60 rounded px-2 py-1 backdrop-blur border border-slate-800 z-30">
                          <span className="text-[8px] font-mono text-slate-400 block uppercase">Internal SPL</span>
                          <span className="text-[14px] font-black text-indigo-400">{Math.floor(internalDb)} dB</span>
                      </div>
                      
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/60 rounded px-2 py-1 backdrop-blur border border-slate-800 z-30 text-right transition-colors duration-300">
                          <span className="text-[8px] font-mono text-slate-400 block uppercase">External Leak</span>
                          <span className={`text-[14px] font-black ${externalDb > 85 ? 'text-red-500' : 'text-emerald-400'}`}>
                              {Math.floor(externalDb)} dB
                          </span>
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes expand {
                        0% { width: 40px; height: 40px; opacity: 1; }
                        100% { width: 350px; height: 350px; opacity: 0; }
                    }
                    @keyframes collapse {
                        0% { width: 320px; height: 320px; opacity: 0; }
                        20% { opacity: 1; }
                        100% { width: 50px; height: 50px; opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#050a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Manage Phase Inverters</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('ENGAGE')}
                   disabled={!systemActive || ancState === 'ACTIVE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || ancState === 'ACTIVE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   Engage ANC (Trap Sound)
                 </button>

                 <button 
                   onClick={() => triggerEvent('DISENGAGE')}
                   disabled={!systemActive || ancState === 'PASSIVE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || ancState === 'PASSIVE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   Disable ANC (Allow Leakage)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiomimeticCanopy;
