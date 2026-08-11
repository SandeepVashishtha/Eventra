/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HolographicSignage = () => {
  const [projectorsActive, setProjectorsActive] = useState(false);
  const [crowdDemographic, setCrowdDemographic] = useState('DEFAULT'); // DEFAULT, SPANISH_HEAVY, JAPANESE_HEAVY, MIXED
  
  // Hardware Metrics
  const [activeNodes, setActiveNodes] = useState(0);
  const [rpmSpeed, setRpmSpeed] = useState(0);
  const [blePingRate, setBlePingRate] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'Holographic LED fan matrix powered on.' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Awaiting BLE proximity telemetry for translation.' }
  ]);

  // Display State
  const [displayLanguage, setDisplayLanguage] = useState('EN');
  const [displayText, setDisplayText] = useState('MAIN STAGE / EXITS');

  const translations = {
      'EN': 'MAIN STAGE / EXITS',
      'ES': 'ESCENARIO PRINCIPAL / SALIDAS',
      'JA': 'メインステージ / 出口',
      'FR': 'SCÈNE PRINCIPALE / SORTIES',
      'DE': 'HAUPTBÜHNE / AUSGÄNGE'
  };

  useEffect(() => {
    let loop;
    
    if (projectorsActive) {
      loop = setInterval(() => {
          // Hardware simulation
          setRpmSpeed(prev => {
              const target = 1800; // RPM for hologram persistence of vision
              return prev + (target - prev) * 0.1;
          });
          setBlePingRate(Math.floor(Math.random() * 50) + 120);

          // Language cycling logic based on crowd state
          if (crowdDemographic === 'DEFAULT') {
              setDisplayLanguage('EN');
          } else if (crowdDemographic === 'SPANISH_HEAVY') {
              // Toggle between English and Spanish
              setDisplayLanguage(prev => prev === 'ES' ? 'EN' : 'ES');
          } else if (crowdDemographic === 'JAPANESE_HEAVY') {
              // Toggle between English and Japanese
              setDisplayLanguage(prev => prev === 'JA' ? 'EN' : 'JA');
          } else if (crowdDemographic === 'MIXED') {
              // Cycle through multiple languages rapidly
              const langs = ['EN', 'ES', 'FR', 'DE', 'JA'];
              setDisplayLanguage(prev => {
                  const idx = langs.indexOf(prev);
                  return langs[(idx + 1) % langs.length];
              });
          }

      }, 1500); // Slower interval for readable cycling
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [projectorsActive, crowdDemographic]);

  // Immediately update text when language state changes
  useEffect(() => {
      setDisplayText(translations[displayLanguage]);
  }, [displayLanguage]);

  const simulateCrowd = (state, logMsg) => {
    if (!projectorsActive) return;
    setCrowdDemographic(state);
    addLog('ACTION', logMsg);
    
    if (state === 'SPANISH_HEAVY') {
        addLog('AI', 'BLE proximity detects 68% ES device locales. Re-rendering hologram.');
    } else if (state === 'JAPANESE_HEAVY') {
        addLog('AI', 'BLE proximity detects 55% JA device locales. Re-rendering hologram.');
    } else if (state === 'MIXED') {
        addLog('WARN', 'High demographic variance detected. Engaging multi-lingual rapid cycle.');
    }
  };

  const toggleProjectors = () => {
    if (!projectorsActive) {
      setProjectorsActive(true);
      setActiveNodes(85);
      addLog('SYS', '85 LED Fan Projectors spun up to 1800 RPM. Persistence of vision achieved.');
    } else {
      setProjectorsActive(false);
      setActiveNodes(0);
      setRpmSpeed(0);
      setBlePingRate(0);
      setCrowdDemographic('DEFAULT');
      setDisplayLanguage('EN');
      addLog('WARN', 'Holographic signage offline. Blades spinning down.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌐</span> Dynamic Localization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Multi-Lingual <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Holographic Signage</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            International festivals attract attendees from dozens of countries, but physical emergency exit and stage schedule signs are typically only printed in English and the local language, causing massive confusion. Eventra solves this by deploying LED fan holographic projectors at major intersections. The system interfaces with attendees' mobile app BLE signals to instantly detect the most common languages spoken by the people currently standing near the sign, dynamically re-rendering the floating 3D text in real-time.
          </p>

          <div className="bg-[#060a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🪭</span> LED Fan Matrix Control
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleProjectors}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     projectorsActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {projectorsActive ? 'Spin Down Rotors' : 'Power On Holograms'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Rotor RPM */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 projectorsActive && rpmSpeed > 1700 ? 'bg-sky-950/30 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Rotor Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     projectorsActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(rpmSpeed)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">RPM</span>
                 </div>
               </div>

               {/* BLE Ping Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 projectorsActive ? 'bg-indigo-950/20 border-indigo-900/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   BLE Telemetry
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     projectorsActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {blePingRate}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">pings/sec</span>
                 </div>
               </div>
               
               {/* Current Lang */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 displayLanguage !== 'EN' ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Render Locale
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     displayLanguage !== 'EN' ? 'text-emerald-400' : 'text-slate-400'
                   }`}>
                     {displayLanguage}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Proximity & Localization Log</span>
                 {crowdDemographic !== 'DEFAULT' && <span className="text-sky-400 animate-pulse">RE-RENDERING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Hologram Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!projectorsActive ? 'bg-[#050914]' : 'bg-[#02040a]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">SIGNAGE PREVIEW</span>
                <span className="text-[8px] font-mono text-slate-400">NODE 42 (CROSSROADS)</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Pole Stand */}
                <div className="absolute bottom-0 w-8 h-32 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 rounded-t border-t border-slate-500 z-0"></div>

                {!projectorsActive ? (
                   <div className="relative z-10 w-64 h-64 border-4 border-slate-800 rounded-full flex items-center justify-center bg-black/50">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">ROTORS STATIONARY</span>
                       {/* Static blades */}
                       <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-64 h-2 bg-slate-800 absolute rotate-0"></div>
                           <div className="w-64 h-2 bg-slate-800 absolute rotate-90"></div>
                       </div>
                   </div>
                ) : (
                  <div className="relative z-10 w-80 h-80 flex items-center justify-center">
                      
                      {/* Spinning Fan Blur Effect */}
                      <div className="absolute inset-0 border border-slate-800/30 rounded-full animate-spin bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_60%,_rgba(15,23,42,0.5)_100%)]" style={{ animationDuration: '0.1s' }}>
                          <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.02),transparent)]"></div>
                      </div>

                      {/* 3D Holographic Text Render */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse drop-shadow-[0_0_20px_rgba(14,165,233,0.8)]">
                          
                          {/* Directional Arrow */}
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>

                          {/* Dynamic Text */}
                          <span className="text-3xl font-black text-white text-center leading-tight tracking-wider" style={{ textShadow: '0 0 10px #0ea5e9, 0 0 20px #0ea5e9' }}>
                              {displayText.split(' / ').map((line, i) => (
                                  <div key={i}>{line}</div>
                              ))}
                          </span>
                      </div>

                      {/* BLE Scan visual effect */}
                      <div className="absolute inset-0 rounded-full border border-sky-500/20 animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
                      
                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#060a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Crowd Demographics</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => simulateCrowd('DEFAULT', 'Crowd demographic: Primarily English speaking.')}
                   disabled={!projectorsActive || crowdDemographic === 'DEFAULT'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !projectorsActive || crowdDemographic === 'DEFAULT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                   }`}
                 >
                   Default (EN)
                 </button>
                 
                 <button 
                   onClick={() => simulateCrowd('MIXED', 'Crowd demographic: High international variance.')}
                   disabled={!projectorsActive || crowdDemographic === 'MIXED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !projectorsActive || crowdDemographic === 'MIXED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-900 text-indigo-400 hover:bg-indigo-900/60'
                   }`}
                 >
                   Mixed (Cycle All)
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                   <button 
                       onClick={() => simulateCrowd('SPANISH_HEAVY', 'Crowd demographic: Influx of ES locales.')}
                       disabled={!projectorsActive || crowdDemographic === 'SPANISH_HEAVY'}
                       className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                         !projectorsActive || crowdDemographic === 'SPANISH_HEAVY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                         'bg-emerald-950/40 border-emerald-900 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                       }`}
                     >
                       Spanish Surge
                   </button>
                   <button 
                       onClick={() => simulateCrowd('JAPANESE_HEAVY', 'Crowd demographic: Influx of JA locales.')}
                       disabled={!projectorsActive || crowdDemographic === 'JAPANESE_HEAVY'}
                       className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                         !projectorsActive || crowdDemographic === 'JAPANESE_HEAVY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                         'bg-rose-950/40 border-rose-900 text-rose-400 hover:bg-rose-900/60 shadow-[0_0_10px_rgba(225,29,72,0.2)]'
                       }`}
                     >
                       Japanese Surge
                   </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HolographicSignage;
