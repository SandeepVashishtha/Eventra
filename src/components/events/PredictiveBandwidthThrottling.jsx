/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveBandwidthThrottling = () => {
  const [isOptimizationEnabled, setIsOptimizationEnabled] = useState(false);
  const [networkType, setNetworkType] = useState('4G'); // '4G', '2G'
  const [isLoading, setIsLoading] = useState(false);
  const [loadComplete, setLoadComplete] = useState(false);
  const [appState, setAppState] = useState(null); // null, 'TIMEOUT', 'SUCCESS'
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '17:00:00', type: 'SYS', msg: 'App initialized. Device connected to network.' }
  ]);

  const loadApp = () => {
      setIsLoading(true);
      setLoadComplete(false);
      setAppState(null);
      setActiveStep(1);
      
      addLog('ACTION', `User opened app at entry gates. Network Type: ${networkType}`);
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isOptimizationEnabled && networkType === '2G') {
              addLog('SYS', 'NetworkInformation API detected 2G connection (Congested Cell Tower).');
              addLog('WARN', 'Dynamically downgrading assets: Video Autoplay Disabled, Images -> Low-Res WebP.');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SUCCESS', 'API routing prioritized for Critical Auth (Ticket QR Code). Payload: 60kb.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsLoading(false);
                      setLoadComplete(true);
                      setAppState('SUCCESS');
                      addLog('SUCCESS', 'App loaded successfully in 1.2s despite network congestion.');
                  }, 1200);
              }, 1200);
              
          } else if (networkType === '2G' && !isOptimizationEnabled) {
              addLog('WARN', 'Legacy Pipeline: Attempting to download 5MB Promo Video and 1MB Hero Image...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('CRIT', 'Network saturated. Critical Auth API call (Ticket QR Code) blocked in queue.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsLoading(false);
                      setLoadComplete(true);
                      setAppState('TIMEOUT');
                      addLog('CRIT', 'App timed out after 15s. White screen of death at entry gates.');
                  }, 2500);
              }, 1500);
          } else {
              // 4G Network
              addLog('SYS', 'High-speed 4G network detected. Downloading full 6MB HD asset payload.');
              
              setTimeout(() => {
                  setActiveStep(3);
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsLoading(false);
                      setLoadComplete(true);
                      setAppState('SUCCESS');
                      addLog('SUCCESS', 'App loaded successfully in 0.8s on 4G network.');
                  }, 800);
              }, 800);
          }
      }, 1000);
  };

  const toggleOptimization = () => {
      const newState = !isOptimizationEnabled;
      setIsOptimizationEnabled(newState);
      setLoadComplete(false);
      setAppState(null);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Predictive Bandwidth Throttling enabled. Asset pipelines linked to Navigator API.');
      } else {
          addLog('CRIT', 'Bandwidth Optimization disabled. App will attempt to load heavy assets blindly.');
      }
  };
  
  const toggleNetwork = () => {
      const newType = networkType === '4G' ? '2G' : '4G';
      setNetworkType(newType);
      setLoadComplete(false);
      setAppState(null);
      setActiveStep(0);
      if (newType === '2G') {
          addLog('CRIT', 'Simulating Cell Tower Congestion: 50,000 users joined local node. Network downgraded to 2G (Slow).');
      } else {
          addLog('SUCCESS', 'Network congestion cleared. Speeds returned to 4G LTE.');
      }
  };

  const resetDemo = () => {
      setLoadComplete(false);
      setAppState(null);
      setIsLoading(false);
      setActiveStep(0);
      addLog('SYS', 'App state reset. Ready for next test.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030605] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛜</span> Network Optimization & UX
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Bandwidth <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500">Asset Throttling</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            As 50,000 people enter the venue, the local cell towers become massively congested. If the app blindly tries to download a 5MB promotional video, it completely saturates the connection, failing to load the critical ticket QR code and causing a catastrophic entry queue. Eventra solves this using the Network Information API. If the connection drops to "2g", the app dynamically disables video autoplay, swaps high-res images for low-res WebP placeholders, and explicitly prioritizes the 10kb API call for the ticket QR code.
          </p>

          <div className="bg-[#060c09] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Network Emulation Rules
               </h3>
               {loadComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset App</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Optimization Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-4">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Adaptive Asset Loading</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isOptimizationEnabled ? 'Active: Listening to Navigator.connection' : 'Inactive: Static Asset Pipeline'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleOptimization}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isOptimizationEnabled ? 'bg-teal-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isOptimizationEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 {/* Network Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Local Cell Tower Status</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {networkType === '2G' ? 'Congested: 50k Users (Effective: 2G/EDGE)' : 'Clear: Low Load (Effective: 4G LTE)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleNetwork}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             networkType === '2G' ? 'bg-amber-500' : 'bg-emerald-500'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             networkType === '2G' ? 'translate-x-1' : 'translate-x-8'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={loadApp}
                     disabled={isLoading || loadComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         loadComplete ? 'bg-slate-800 text-teal-500 border-teal-900 cursor-not-allowed' :
                         isLoading ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                     }`}
                 >
                     {isLoading ? 'Downloading Assets...' : loadComplete ? 'Session Concluded' : "Open App at Entry Gates"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020403] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Browser Network Telemetry</span>
                 {isLoading && <span className="text-teal-400 font-black animate-pulse">FETCHING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Payload Architecture</span>
                      <span className="text-xs text-white font-bold">App Resource Loading</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Network Status Header */}
                  <div className="flex justify-between items-center mb-6 bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center">
                          <span className="text-2xl mr-2">📶</span>
                          <div className="flex flex-col">
                              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">navigator.connection.effectiveType</span>
                              <span className={`text-xs font-mono font-black ${networkType === '2G' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {networkType === '2G' ? '"2g" (Slow)' : '"4g" (Fast)'}
                              </span>
                          </div>
                      </div>
                      <div className="flex flex-col items-end">
                          <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Total Payload</span>
                          <span className="text-xs font-mono font-black text-white">
                              {activeStep >= 2 ? (
                                  isOptimizationEnabled && networkType === '2G' ? '60 KB' : '6.01 MB'
                              ) : '0 KB'}
                          </span>
                      </div>
                  </div>

                  {/* Asset Queue */}
                  <div className="flex-1 space-y-4">
                      
                      {/* Critical Asset: Ticket QR Code */}
                      <div className={`border rounded-xl p-3 flex flex-col relative overflow-hidden transition-all duration-500 ${
                          activeStep >= 3 ? (
                              isOptimizationEnabled && networkType === '2G' ? 'border-emerald-500 bg-emerald-950/20' :
                              appState === 'TIMEOUT' ? 'border-rose-500 bg-rose-950/20' : 'border-emerald-500 bg-emerald-950/20'
                          ) : 'border-slate-800 bg-slate-900'
                      }`}>
                          <div className="flex justify-between items-center z-10">
                              <div className="flex items-center">
                                  <span className="text-xl mr-3">🎫</span>
                                  <div className="flex flex-col">
                                      <span className="text-white font-bold text-xs">Auth API: GetTicket()</span>
                                      <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase">Critical Path Priority 1</span>
                                  </div>
                              </div>
                              <span className="text-xs font-mono text-slate-400">10 KB</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden z-10">
                              <div className={`h-full transition-all ${
                                  activeStep >= 3 ? (
                                      isOptimizationEnabled && networkType === '2G' ? 'bg-emerald-500 w-full duration-300' :
                                      appState === 'TIMEOUT' ? 'bg-rose-500 w-0' : 'bg-emerald-500 w-full duration-500 delay-500'
                                  ) : 'w-0'
                              }`}></div>
                          </div>
                          
                          {appState === 'TIMEOUT' && (
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-rose-500 uppercase tracking-widest text-[10px] bg-rose-950/80 px-2 rounded backdrop-blur-sm z-20 whitespace-nowrap">
                                  BLOCKED IN QUEUE
                              </span>
                          )}
                      </div>

                      {/* Heavy Asset: Promo Video */}
                      <div className={`border rounded-xl p-3 flex flex-col relative overflow-hidden transition-all duration-500 ${
                          activeStep >= 2 ? (
                              isOptimizationEnabled && networkType === '2G' ? 'border-slate-700 bg-slate-800 opacity-50' :
                              appState === 'TIMEOUT' ? 'border-rose-500 bg-rose-950/20' : 'border-emerald-500 bg-emerald-950/20'
                          ) : 'border-slate-800 bg-slate-900'
                      }`}>
                          <div className="flex justify-between items-center z-10">
                              <div className="flex items-center">
                                  <span className="text-xl mr-3">🎬</span>
                                  <div className="flex flex-col">
                                      <span className="text-white font-bold text-xs">hero-promo.mp4</span>
                                      <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">UI Aesthetic Priority 3</span>
                                  </div>
                              </div>
                              <span className="text-xs font-mono text-slate-400">
                                  {isOptimizationEnabled && networkType === '2G' && activeStep >= 2 ? '0 KB (Skipped)' : '5 MB'}
                              </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden z-10">
                              <div className={`h-full transition-all ${
                                  activeStep >= 2 ? (
                                      isOptimizationEnabled && networkType === '2G' ? 'w-0' :
                                      appState === 'TIMEOUT' ? 'bg-amber-500 w-[12%] duration-[10000ms] ease-linear' : 'bg-emerald-500 w-full duration-700'
                                  ) : 'w-0'
                              }`}></div>
                          </div>
                          
                          {activeStep >= 2 && isOptimizationEnabled && networkType === '2G' && (
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-slate-400 uppercase tracking-widest text-[10px] z-20">
                                  DROPPED DUE TO 2G
                              </span>
                          )}
                          {appState === 'TIMEOUT' && (
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-rose-500 uppercase tracking-widest text-[10px] bg-rose-950/80 px-2 rounded backdrop-blur-sm z-20 whitespace-nowrap">
                                  NETWORK STALLED
                              </span>
                          )}
                      </div>

                      {/* Medium Asset: Hero Image */}
                      <div className={`border rounded-xl p-3 flex flex-col relative overflow-hidden transition-all duration-500 ${
                          activeStep >= 2 ? (
                              isOptimizationEnabled && networkType === '2G' ? 'border-emerald-500 bg-emerald-950/20' :
                              appState === 'TIMEOUT' ? 'border-slate-800 bg-slate-900' : 'border-emerald-500 bg-emerald-950/20'
                          ) : 'border-slate-800 bg-slate-900'
                      }`}>
                          <div className="flex justify-between items-center z-10">
                              <div className="flex items-center">
                                  <span className="text-xl mr-3">🖼️</span>
                                  <div className="flex flex-col">
                                      <span className="text-white font-bold text-xs">
                                          {isOptimizationEnabled && networkType === '2G' && activeStep >= 2 ? 'bg-lowres.webp' : 'bg-highres.png'}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">UI Aesthetic Priority 2</span>
                                  </div>
                              </div>
                              <span className="text-xs font-mono text-slate-400">
                                  {isOptimizationEnabled && networkType === '2G' && activeStep >= 2 ? '50 KB' : '1 MB'}
                              </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden z-10">
                              <div className={`h-full transition-all ${
                                  activeStep >= 2 ? (
                                      isOptimizationEnabled && networkType === '2G' ? 'bg-emerald-500 w-full duration-500' :
                                      appState === 'TIMEOUT' ? 'w-0' : 'bg-emerald-500 w-full duration-1000'
                                  ) : 'w-0'
                              }`}></div>
                          </div>
                      </div>

                  </div>

                  {/* Overlays */}
                  {appState === 'TIMEOUT' && (
                      <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm rounded-xl border-2 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">⏳</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">App Crashed / Timed Out<br/><span className="text-[10px] font-normal text-rose-200 mt-1 block">Heavy assets choked the 2G connection<br/>Tickets inaccessible</span></span>
                      </div>
                  )}

                  {appState === 'SUCCESS' && (
                      <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-sm rounded-xl border-2 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">✅</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">App Loaded Successfully<br/><span className="text-[10px] font-normal text-emerald-200 mt-1 block">Ticket QR Code displayed</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#060c09] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">Throttling Bandwidth:</span>
               Ensure <span className="text-amber-500 font-bold bg-slate-800 px-1 rounded">Cell Tower Status</span> is Congested (2G) and Optimization is OFF. Click Open App. The app blindly attempts to download the 5MB Promo video over a 2G connection. The entire network pipe stalls, blocking the critical Ticket QR code API call behind it, causing the app to timeout at the entry gates.<br/><br/>Toggle <span className="text-teal-400 font-bold bg-slate-800 px-1 rounded">Adaptive Asset Loading</span> ON and try again. The app detects the 2G connection via `navigator.connection`, instantly drops the video, downgrades the image, and prioritizes the tiny 10KB Ticket API call, successfully loading the app in 1 second.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveBandwidthThrottling;
