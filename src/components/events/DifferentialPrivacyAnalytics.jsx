/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DifferentialPrivacyAnalytics = () => {
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [transmissionComplete, setTransmissionComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Crowd density analytics engine online. Awaiting telemetry.' }
  ]);

  const executeTelemetry = () => {
      setIsBroadcasting(true);
      setTransmissionComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'User Device polling GPS sensor (Main Stage area)...');
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isPrivacyEnabled) {
              addLog('SYS', 'Applying Differential Privacy (Laplace Mechanism)...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('WARN', 'Mathematical noise injected into coordinates (ε = 0.5).');
                  addLog('SYS', 'Transmitting obfuscated telemetry to Eventra Cloud...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', 'Aggregating noisy data into macro crowd heatmap.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsBroadcasting(false);
                          setTransmissionComplete(true);
                          addLog('SUCCESS', 'Heatmap updated. Individual user path is mathematically untraceable.');
                      }, 1200);
                  }, 1200);
              }, 1200);
              
          } else {
              // Legacy Raw GPS
              addLog('WARN', 'Transmitting EXACT raw coordinates to Eventra Cloud...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Storing raw (Lat, Lng) in backend SQL database.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsBroadcasting(false);
                      setTransmissionComplete(true);
                      addLog('SUCCESS', 'Heatmap updated.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('CRIT', 'SECURITY AUDIT: Database breach exposes exact movement of User #4912.');
                      }, 1500);
                  }, 1200);
              }, 1200);
          }
      }, 1000);
  };

  const togglePrivacy = () => {
      const newState = !isPrivacyEnabled;
      setIsPrivacyEnabled(newState);
      setTransmissionComplete(false);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Client-side Differential Privacy engine activated.');
      } else {
          addLog('CRIT', 'Privacy engine disabled. Transmitting raw PII location data.');
      }
  };

  const resetDemo = () => {
      setIsBroadcasting(false);
      setTransmissionComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Telemetry session reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030607] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗺️</span> Data Science & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Differential Privacy <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500">Crowd Density Analytics</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Eventra tracks user GPS coordinates to provide festival organizers with real-time crowd density heatmaps (e.g., to see if the Main Stage is overcrowded). However, storing exact user locations creates a massive privacy liability if the database is breached, allowing bad actors to stalk specific users. Eventra solves this by implementing Differential Privacy. The frontend injects mathematical "noise" into the GPS coordinates (using the Laplace mechanism) *before* the data leaves the phone. The backend aggregates this noisy data to create highly accurate macro heatmaps, but it is mathematically impossible to reverse-engineer any individual user's exact path.
          </p>

          <div className="bg-[#050b0f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Telemetry Configuration
               </h3>
               {transmissionComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Session</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Privacy Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Data Anonymization Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isPrivacyEnabled ? 'Active: Laplace Noise Injection (ε = 0.5)' : 'Inactive: Raw GPS Coordinates (PII)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={togglePrivacy}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isPrivacyEnabled ? 'bg-teal-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isPrivacyEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeTelemetry}
                     disabled={isBroadcasting || transmissionComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         transmissionComplete ? 'bg-slate-800 text-teal-500 border-teal-900 cursor-not-allowed' :
                         isBroadcasting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-teal-600 hover:bg-teal-500 text-black border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                     }`}
                 >
                     {isBroadcasting ? 'Broadcasting Telemetry...' : transmissionComplete ? 'Transmission Complete' : "Broadcast GPS Location"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020406] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ingestion Service Log</span>
                 {isBroadcasting && <span className="text-teal-400 font-black animate-pulse">INGESTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Data Science Visualizer</span>
                      <span className="text-xs text-white font-bold">Client-to-Cloud Data Pipeline</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Phone Node (Client) */}
                  <div className={`border-2 rounded-xl p-4 mb-4 relative transition-colors duration-500 bg-slate-900 ${
                      activeStep >= 1 ? (isPrivacyEnabled ? 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]') : 'border-slate-800'
                  }`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center">
                          <span className="mr-2 text-xl">📱</span> Client Device (Frontend)
                      </span>
                      
                      <div className="bg-black/50 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-400 flex flex-col gap-1">
                          <div className="flex justify-between"><span>True Lat:</span> <span>34.052235</span></div>
                          <div className="flex justify-between"><span>True Lng:</span> <span>-118.243683</span></div>
                          
                          {activeStep >= 2 && isPrivacyEnabled && (
                              <div className="mt-2 pt-2 border-t border-slate-800 text-teal-400 animate-fade-in-up">
                                  <div className="font-bold mb-1">Applying Laplace(0.5):</div>
                                  <div className="flex justify-between"><span>Noise Lat:</span> <span>+0.004120</span></div>
                                  <div className="flex justify-between"><span>Noise Lng:</span> <span>-0.002841</span></div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Network Transmission Line */}
                  <div className="flex-1 flex items-center justify-center relative">
                      <div className="h-full w-0.5 border-l-2 border-dashed border-slate-700 absolute"></div>
                      
                      {activeStep >= 3 && activeStep <= 4 && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg absolute animate-bounce ${
                              isPrivacyEnabled ? 'bg-teal-900 border border-teal-500' : 'bg-rose-900 border border-rose-500'
                          }`}>
                              <span className="text-xs">📡</span>
                          </div>
                      )}
                  </div>

                  {/* Database Node (Cloud) */}
                  <div className={`border-2 rounded-xl p-4 mt-4 transition-colors duration-500 bg-slate-900 ${
                      activeStep >= 4 ? (isPrivacyEnabled ? 'border-emerald-500 bg-emerald-950/20' : 'border-rose-500 bg-rose-950/20') : 'border-slate-800'
                  }`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center">
                          <span className="mr-2 text-xl">☁️</span> Eventra Database (Cloud)
                      </span>
                      
                      <div className={`bg-black/50 p-2 rounded border font-mono text-[9px] transition-colors ${
                          activeStep >= 4 ? (isPrivacyEnabled ? 'border-emerald-900 text-emerald-400' : 'border-rose-900 text-rose-400') : 'border-slate-800 text-slate-500'
                      }`}>
                          {activeStep >= 4 ? (
                              isPrivacyEnabled ? (
                                  <>
                                      <div className="mb-1 font-bold">STORED PAYLOAD (OBFUSCATED)</div>
                                      <div>Lat: 34.056355 (Fake)</div>
                                      <div>Lng: -118.246524 (Fake)</div>
                                  </>
                              ) : (
                                  <>
                                      <div className="mb-1 font-bold">STORED PAYLOAD (RAW PII)</div>
                                      <div>Lat: 34.052235 (Exact)</div>
                                      <div>Lng: -118.243683 (Exact)</div>
                                  </>
                              )
                          ) : (
                              <div className="text-center italic">Awaiting Payload...</div>
                          )}
                      </div>
                  </div>

                  {/* Overlays */}
                  {activeStep >= 5 && isPrivacyEnabled && (
                      <div className="absolute inset-0 bg-emerald-900/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🛡️</span>
                          <span className="text-lg font-black uppercase tracking-widest">Privacy Preserved</span>
                          <p className="text-[10px] text-emerald-200 mt-4 leading-relaxed">
                              The backend successfully aggregated the noisy coordinates into the macro heatmap. However, because the data stored in the database is mathematically randomized, it is completely useless for tracking individual users. True Anonymization achieved.
                          </p>
                      </div>
                  )}

                  {activeStep >= 5 && !isPrivacyEnabled && (
                      <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🚨</span>
                          <span className="text-lg font-black uppercase tracking-widest">Privacy Breach</span>
                          <p className="text-[10px] text-rose-200 mt-4 leading-relaxed font-mono bg-rose-900/50 p-3 rounded border border-rose-500">
                              DATABASE COMPROMISED.<br/><br/>
                              Hacker successfully queried raw GPS data. Exposing exact home address and daily movement patterns of User #4912.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050b0f] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">True Anonymization:</span>
               With the Privacy Engine OFF, click Broadcast. The phone sends its exact GPS coordinates to the cloud. When a database breach occurs, hackers can extract the exact path and home address of individual users.<br/><br/>Toggle <span className="text-teal-400 font-bold bg-slate-800 px-1 rounded">Data Anonymization Engine</span> ON. The client phone applies the Laplace Mechanism, mathematically obfuscating the coordinates *before* transmission. The backend receives fake coordinates that average out correctly for the macro heatmap, but physically cannot be used to track an individual, even if the entire database is leaked.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DifferentialPrivacyAnalytics;
