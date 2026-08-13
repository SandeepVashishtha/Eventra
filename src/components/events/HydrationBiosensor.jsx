/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HydrationBiosensor = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Biometric Metrics
  const [sweatRate, setSweatRate] = useState(12); // oz/hr
  const [sodiumLoss, setSodiumLoss] = useState(250); // mg/hr
  const [hydrationLevel, setHydrationLevel] = useState(98); // %
  const [coreTemp, setCoreTemp] = useState(98.6); // Fahrenheit
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'BLE Biosensor Patch API Integration active.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting biometric telemetry from paired devices...' }
  ]);

  // Visualizer State
  const [appState, setAppState] = useState('NOMINAL'); // NOMINAL, WARNING, CRITICAL
  const [ambientTemp, setAmbientTemp] = useState(85);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          // Hydration decreases based on sweat rate
          setHydrationLevel(prev => {
              const drop = (sweatRate / 100) * (ambientTemp > 95 ? 1.5 : 1.0);
              const next = Math.max(0, prev - drop);
              
              if (next < 65 && appState !== 'CRITICAL') {
                  setAppState('CRITICAL');
                  addLog('CRIT', 'Dehydration Threshold Exceeded! Hydration < 65%.');
                  addLog('ACTION', 'Overriding user app UI. Routing to nearest Water Station (120m).');
              } else if (next < 80 && appState === 'NOMINAL') {
                  setAppState('WARNING');
                  addLog('WARN', 'Hydration dropping. Core temp rising. Triggering soft reminder.');
              }
              
              return next;
          });

          // Core temp rises if dehydrated
          if (hydrationLevel < 80) {
              setCoreTemp(prev => Math.min(103.5, prev + 0.05));
          } else {
              setCoreTemp(prev => Math.max(98.6, prev - 0.1));
          }
          
          // Sodium correlates with sweat
          setSodiumLoss(Math.floor(sweatRate * 35));

      }, 300); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, sweatRate, ambientTemp, hydrationLevel, appState]);

  const simulateHeatWave = () => {
      if (!systemActive) return;
      
      setAmbientTemp(102);
      setSweatRate(45); // Huge spike in sweating
      addLog('WARN', 'Weather API: Heatwave detected (102°F). Sun exposure high.');
      addLog('SYS', 'Biosensor detects massive spike in sweat rate (45 oz/hr).');
  };

  const simulateWaterIntake = () => {
      if (!systemActive) return;
      
      setHydrationLevel(99);
      setCoreTemp(98.6);
      setSweatRate(15);
      setAmbientTemp(85);
      setAppState('NOMINAL');
      
      addLog('SUCCESS', 'User checked in at Water Station 4. Hydration replenished.');
      addLog('SYS', 'Biometrics normalizing. Releasing App UI lock.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setHydrationLevel(98);
      setCoreTemp(98.6);
      setSweatRate(12);
      setAmbientTemp(85);
      setAppState('NOMINAL');
      addLog('SYS', 'User paired Bluetooth Sweat Patch successfully.');
    } else {
      setSystemActive(false);
      setAppState('NOMINAL');
      addLog('WARN', 'Biosensor unlinked. Unable to monitor user biometrics.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020609] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💧</span> Biometric IoT Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Hydration Biosensors</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Heatstroke and severe dehydration are the leading causes of medical emergencies at summer music festivals, often hitting attendees suddenly before they even realize they are thirsty. Eventra solves this by partnering with smart-wearable biosensor patches (e.g., Gatorade Gx). The Eventra app connects via Bluetooth to the patch to continuously ingest the user's sweat rate and sodium loss. If the user hits a dangerous dehydration threshold based on their unique biometrics, the app preemptively overrides their UI with a critical alert and routes them directly to the nearest free water station.
          </p>

          <div className="bg-[#050a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Sweat Patch Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disconnect BLE Patch' : 'Pair Biosensor Patch'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Hydration Level */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 appState === 'CRITICAL' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' : 
                 appState === 'WARNING' ? 'bg-orange-950/40 border-orange-500/50' : 
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   H2O Saturation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     appState === 'CRITICAL' ? 'text-red-400' : 
                     appState === 'WARNING' ? 'text-orange-400' : 'text-cyan-400'
                   }`}>
                     {hydrationLevel.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Sweat Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sweatRate > 30 ? 'bg-blue-950/40 border-blue-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Sweat Rate
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     sweatRate > 30 ? 'text-blue-400' : 'text-slate-300'
                   }`}>
                     {sweatRate.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">oz/hr</span>
                 </div>
               </div>
               
               {/* Sodium Loss */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Na+ Loss
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {sodiumLoss}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mg/hr</span>
                 </div>
               </div>
               
               {/* Core Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 coreTemp > 101 ? 'bg-rose-950/40 border-rose-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Core Temp
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     coreTemp > 101 ? 'text-rose-400' : 'text-slate-300'
                   }`}>
                     {coreTemp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°F</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010305] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Health API Ledger</span>
                 {appState === 'CRITICAL' && <span className="text-red-400 font-black animate-pulse">EMERGENCY OVERRIDE ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* App UI Visualizer */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[500px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-40 pointer-events-none flex justify-between bg-black/60 backdrop-blur-md">
                <span className="text-[10px] font-black text-white">9:41</span>
                <span className="text-[10px] font-black text-white flex space-x-1">
                    <span>📶</span><span>🔋</span>
                </span>
              </div>

              <div className="flex-1 relative flex flex-col overflow-hidden pt-8 bg-slate-950">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                         <span className="text-4xl mb-4">🩹</span>
                         <span className="text-sm font-bold text-slate-300 mb-2">No Biosensor Paired</span>
                         <p className="text-[10px] text-slate-500">Connect a compatible sweat patch via Bluetooth to enable health monitoring.</p>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col transition-all duration-500">
                        
                        {/* Normal App UI (Map/Schedule) */}
                        <div className={`flex-1 p-4 flex flex-col transition-opacity duration-500 ${appState === 'CRITICAL' ? 'opacity-10 blur-sm pointer-events-none' : 'opacity-100'}`}>
                            
                            <h2 className="text-2xl font-black text-white mb-4">Eventra Festival</h2>
                            
                            {/* Fake Map */}
                            <div className="w-full h-40 bg-slate-800 rounded-xl mb-4 border border-slate-700 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                            </div>
                            
                            {/* Health Widget */}
                            <div className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                                appState === 'WARNING' ? 'bg-orange-950/80 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-slate-900 border-slate-700'
                            }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-white flex items-center">
                                        <span className="mr-2">🩹</span> Patch Connected
                                    </span>
                                    <span className={`text-xs font-black ${appState === 'WARNING' ? 'text-orange-400 animate-pulse' : 'text-cyan-400'}`}>
                                        {hydrationLevel.toFixed(0)}% Hydrated
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${appState === 'WARNING' ? 'bg-orange-500' : 'bg-cyan-500'}`}
                                        style={{ width: `${hydrationLevel}%` }}
                                    ></div>
                                </div>
                                {appState === 'WARNING' && (
                                    <p className="text-[10px] text-orange-300 mt-2">
                                        Your hydration is dropping. Drink water soon to avoid heatstroke.
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* CRITICAL OVERRIDE UI */}
                        {appState === 'CRITICAL' && (
                            <div className="absolute inset-0 z-50 bg-red-600 flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
                                
                                <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
                                    <span className="text-6xl mb-4 animate-bounce">⚠️</span>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md">
                                        Critical Alert
                                    </h1>
                                    <p className="text-red-100 font-bold mb-6 text-sm">
                                        Biosensor indicates severe dehydration and elevated core temperature. Risk of heatstroke is HIGH.
                                    </p>

                                    <div className="bg-black/40 rounded-2xl p-4 w-full border border-red-400/30 backdrop-blur-sm mb-6">
                                        <h3 className="text-white font-black uppercase text-xs mb-1">Navigation Override</h3>
                                        <p className="text-red-200 text-sm font-bold mb-3">Routing to Nearest Water Station</p>
                                        
                                        <div className="flex items-center justify-between text-white">
                                            <span className="text-4xl">↑</span>
                                            <div className="text-right">
                                                <span className="block text-3xl font-black">120m</span>
                                                <span className="block text-[10px] uppercase text-red-200 tracking-widest">Straight Ahead</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-red-200 opacity-70">
                                        Normal app functions locked until hydration levels are restored to safe parameters.
                                    </p>
                                </div>
                                
                                <div className="absolute inset-0 pointer-events-none border-[12px] border-red-500 animate-pulse mix-blend-overlay"></div>
                            </div>
                        )}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Environmental Factors</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={simulateHeatWave}
                   disabled={!systemActive || appState === 'CRITICAL'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || appState === 'CRITICAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   ☀️ Simulate 102°F Heatwave (Spike Sweat)
                 </button>
               </div>

               <button 
                   onClick={simulateWaterIntake}
                   disabled={!systemActive || appState === 'NOMINAL'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !systemActive || appState === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-500 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   🚰 Check-in at Water Station
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HydrationBiosensor;
