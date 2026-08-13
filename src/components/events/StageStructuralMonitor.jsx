/* eslint-disable */
import React, { useState, useEffect } from 'react';

const StageStructuralMonitor = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Structural Metrics
  const [windSheer, setWindSheer] = useState(12); // mph
  const [trussStrain, setTrussStrain] = useState(45); // MPa (Megapascals)
  const [swayAmplitude, setSwayAmplitude] = useState(2.5); // cm
  const [yieldLimit, setYieldLimit] = useState(15); // % of structural failure limit
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'Fiber Optic Strain Gauges Initialized (100Hz).' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Calibrating baseline truss tension against dead weight.' }
  ]);

  // Visualizer State
  const [appState, setAppState] = useState('NOMINAL'); // NOMINAL, WARNING, KILL_SWITCH
  const [resonanceEvent, setResonanceEvent] = useState(false);
  const [windEvent, setWindEvent] = useState(false);
  
  // Truss sensor nodes
  const [sensors, setSensors] = useState([
      { id: 'S1', x: 20, y: 20, load: 10 },
      { id: 'S2', x: 50, y: 20, load: 12 },
      { id: 'S3', x: 80, y: 20, load: 15 },
      { id: 'S4', x: 20, y: 80, load: 45 },
      { id: 'S5', x: 50, y: 80, load: 50 },
      { id: 'S6', x: 80, y: 80, load: 42 }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemActive && appState !== 'KILL_SWITCH') {
      loop = setInterval(() => {
          
          let targetWind = windEvent ? 65 + Math.random() * 15 : 12 + Math.random() * 5;
          let targetStrain = 45;
          let targetSway = 2.5;

          if (windEvent) {
              targetStrain = 250 + Math.random() * 50; // High sheer stress
              targetSway = 18 + Math.random() * 8; // Heavy swaying
          } else if (resonanceEvent) {
              targetStrain = 180 + Math.random() * 80; // High kinetic stress
              // Crowd jumping in unison causes cyclic sway
              targetSway = 5 + Math.sin(Date.now() / 200) * 12; 
          }

          setWindSheer(prev => prev + (targetWind - prev) * 0.1);
          setTrussStrain(prev => prev + (targetStrain - prev) * 0.2);
          setSwayAmplitude(prev => prev + (targetSway - prev) * 0.2);
          
          // Calculate Yield Limit % (Assumes 300 MPa is structural yield point)
          const currentYield = Math.min(100, (trussStrain / 300) * 100);
          setYieldLimit(currentYield);

          // Update individual sensor visual loads
          setSensors(prev => prev.map(s => {
              let loadFactor = currentYield;
              if (s.y < 50 && windEvent) loadFactor *= 1.3; // Top sensors bear wind
              if (s.y > 50 && resonanceEvent) loadFactor *= 1.2; // Bottom sensors bear jumping
              return { ...s, load: Math.min(100, loadFactor * (0.8 + Math.random() * 0.4)) };
          }));

          // Safety Logic
          if (currentYield > 95 && appState !== 'KILL_SWITCH') {
              setAppState('KILL_SWITCH');
              addLog('CRIT', 'STRUCTURAL YIELD LIMIT EXCEEDED (95%+).');
              addLog('ACTION', 'ENGAGING AUTOMATED STAGE KILL-SWITCH. CUTTING PA POWER.');
          } else if (currentYield > 75 && appState === 'NOMINAL') {
              setAppState('WARNING');
              addLog('WARN', 'High Strain Detected. Approaching metallurgical limits.');
              addLog('SYS', 'Alerting Production Manager to prepare evacuation protocol.');
          } else if (currentYield < 60 && appState === 'WARNING') {
              setAppState('NOMINAL');
              addLog('SUCCESS', 'Structural strain returned to nominal operating parameters.');
          }

      }, 100); // 100Hz simulated telemetry
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, windEvent, resonanceEvent, trussStrain, appState]);

  const toggleEvent = (type) => {
      if (!systemActive || appState === 'KILL_SWITCH') return;
      
      if (type === 'WIND') {
          setWindEvent(true);
          addLog('WARN', 'Anemometer spike: Gale force winds detected (65+ mph).');
      } else if (type === 'RESONANCE') {
          setResonanceEvent(true);
          addLog('WARN', 'Accelerometers detect severe kinetic resonance (crowd jumping).');
      }
  };

  const resetSystem = () => {
      setAppState('NOMINAL');
      setWindEvent(false);
      setResonanceEvent(false);
      setYieldLimit(15);
      setTrussStrain(45);
      addLog('SYS', 'Kill-Switch manually reset by Chief Safety Officer.');
      addLog('SUCCESS', 'Audio/Visual systems restored. Resuming 100Hz telemetry.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Structural Health Monitoring (SHM) Active.');
    } else {
      setSystemActive(false);
      setWindEvent(false);
      setResonanceEvent(false);
      setAppState('NOMINAL');
      addLog('WARN', 'SHM Offline. Flying blind on stage structural integrity.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0702] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏗️</span> Structural Health Monitoring
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Stage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">Integrity Monitoring</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Sudden high winds or thousands of people jumping in unison can cause massive stage structures to sway dangerously or collapse, causing mass casualties. Eventra solves this by embedding fiber optic strain gauges and accelerometers directly into the metal scaffolding of the main stages. Eventra ingests this telemetry at 100Hz. If wind sheer or kinetic resonance approaches the metallurgical yield limits of the trussing, the system triggers an automatic audio/visual kill-switch, cutting power and broadcasting immediate evacuation protocols.
          </p>

          <div className="bg-[#120a04] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Fiber Optic Telemetry (100Hz)
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Sensors' : 'Engage SHM Array'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Yield Limit */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 appState === 'KILL_SWITCH' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' : 
                 appState === 'WARNING' ? 'bg-orange-950/40 border-orange-500/50' : 
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Yield Limit
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     appState === 'KILL_SWITCH' ? 'text-red-400' : 
                     appState === 'WARNING' ? 'text-orange-400' : 'text-emerald-400'
                   }`}>
                     {yieldLimit.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Truss Strain */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 trussStrain > 200 ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Sheer Strain
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     trussStrain > 200 ? 'text-orange-400' : 'text-slate-300'
                   }`}>
                     {trussStrain.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">MPa</span>
                 </div>
               </div>
               
               {/* Sway Amplitude */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 swayAmplitude > 15 ? 'bg-rose-950/40 border-rose-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Peak Sway
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     swayAmplitude > 15 ? 'text-rose-400' : 'text-slate-300'
                   }`}>
                     {Math.abs(swayAmplitude).toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">cm</span>
                 </div>
               </div>
               
               {/* Wind Sheer */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 windSheer > 40 ? 'bg-cyan-950/40 border-cyan-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Wind Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     windSheer > 40 ? 'text-cyan-400' : 'text-slate-300'
                   }`}>
                     {windSheer.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mph</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050301] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Safety Event Ledger</span>
                 {appState === 'KILL_SWITCH' && <span className="text-red-400 font-black animate-pulse">EVACUATION PROTOCOL ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
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
            
            {/* Structural UI Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#120a04]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400">STRUCTURAL WIREFRAME</span>
                <span className="text-[8px] font-mono text-slate-400">MAIN STAGE (Z-AXIS)</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col justify-center items-center">
                        
                        {/* Stage Wireframe with Dynamic Sway */}
                        <div 
                            className="relative w-48 h-56 border-2 border-slate-700 rounded-t-sm transition-transform duration-100"
                            style={{ 
                                transform: `skewX(${swayAmplitude}deg)`,
                                transformOrigin: 'bottom center'
                            }}
                        >
                            {/* Inner Trussing Grid */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1 opacity-20">
                                {Array.from({length: 9}).map((_, i) => (
                                    <div key={i} className="border border-slate-500">
                                        {/* Cross bracings */}
                                        <svg className="w-full h-full" preserveAspectRatio="none">
                                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#64748b" strokeWidth="1"/>
                                            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#64748b" strokeWidth="1"/>
                                        </svg>
                                    </div>
                                ))}
                            </div>

                            {/* Fiber Optic Sensors mapped to Trussing */}
                            {sensors.map(s => {
                                let color = '#10b981'; // Green
                                if (s.load > 70) color = '#f97316'; // Orange
                                if (s.load > 90) color = '#ef4444'; // Red

                                return (
                                    <div 
                                        key={s.id}
                                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-colors duration-200"
                                        style={{ left: `${s.x}%`, top: `${s.y}%` }}
                                    >
                                        <div className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ backgroundColor: color }}></div>
                                        <div className="w-2 h-2 rounded-full z-10" style={{ backgroundColor: color }}></div>
                                        <span className="absolute -top-3 text-[5px] font-mono text-slate-400">{s.id}</span>
                                    </div>
                                )
                            })}
                            
                            {/* Stage Floor */}
                            <div className="absolute -bottom-2 -left-8 -right-8 h-2 bg-slate-700 rounded-sm"></div>
                        </div>

                        {/* KILL SWITCH OVERRIDE UI */}
                        {appState === 'KILL_SWITCH' && (
                            <div className="absolute inset-0 z-50 bg-red-600/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm animate-in zoom-in duration-300">
                                <span className="text-6xl mb-2 animate-bounce">🚨</span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">
                                    Evacuate Stage
                                </h2>
                                <p className="text-red-100 font-bold text-[10px] mb-4 uppercase tracking-widest">
                                    Yield Limit Exceeded
                                </p>
                                <div className="bg-black/50 p-3 rounded-lg border border-red-400 w-full mb-4 text-left">
                                    <div className="flex items-center text-red-200 text-xs font-bold mb-1">
                                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span> PA Power Cut
                                    </div>
                                    <div className="flex items-center text-red-200 text-xs font-bold mb-1">
                                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span> DMX Lighting Killed
                                    </div>
                                    <div className="flex items-center text-red-200 text-xs font-bold">
                                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span> Evac Signage Active
                                    </div>
                                </div>
                                <button 
                                    onClick={resetSystem}
                                    className="px-4 py-2 bg-slate-900 border-2 border-slate-600 text-slate-300 rounded text-[10px] font-black uppercase hover:bg-slate-800"
                                >
                                    Manual Override / Reset
                                </button>
                            </div>
                        )}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#120a04] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Structural Stress</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => toggleEvent('WIND')}
                   disabled={!systemActive || appState === 'KILL_SWITCH' || windEvent}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || appState === 'KILL_SWITCH' || windEvent ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   🌪️ Microburst (65mph)
                 </button>
                 
                 <button 
                   onClick={() => toggleEvent('RESONANCE')}
                   disabled={!systemActive || appState === 'KILL_SWITCH' || resonanceEvent}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || appState === 'KILL_SWITCH' || resonanceEvent ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   🦘 Crowd Jumping
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default StageStructuralMonitor;
