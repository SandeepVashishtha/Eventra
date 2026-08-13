/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MicroFrontendOrchestrator = () => {
  const [activeModule, setActiveModule] = useState('DASHBOARD'); // DASHBOARD, FOOD_POS, MEDICAL, SECURITY
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  
  // DevOps/Architecture Metrics
  const [activeContainers, setActiveContainers] = useState(4); 
  const [bundleSize, setBundleSize] = useState(84.2); // KB (Host shell)
  const [ciCdDeployTime, setCiCdDeployTime] = useState(1.2); // Minutes
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Webpack Module Federation Host (Shell) mounted.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Awaiting dynamic imports for remote entry points.' }
  ]);

  // Visualizer State
  const [remoteVersions, setRemoteVersions] = useState({
      FOOD_POS: 'v2.1.0',
      MEDICAL: 'v1.4.2',
      SECURITY: 'v3.0.1'
  });

  const loadMicroFrontend = (moduleName) => {
      if (activeModule === moduleName || isModuleLoading) return;
      
      setIsModuleLoading(true);
      addLog('ACTION', `Fetching remote entry for @eventra/${moduleName.toLowerCase()}...`);
      
      setTimeout(() => {
          setActiveModule(moduleName);
          setIsModuleLoading(false);
          
          if (moduleName === 'FOOD_POS') {
              setBundleSize(142.5); // Host + Remote
              addLog('SUCCESS', `Successfully stitched Food POS Micro-Frontend (${remoteVersions.FOOD_POS}) into DOM.`);
          } else if (moduleName === 'MEDICAL') {
              setBundleSize(110.8);
              addLog('SUCCESS', `Successfully stitched Medical Triage Micro-Frontend (${remoteVersions.MEDICAL}) into DOM.`);
          } else if (moduleName === 'SECURITY') {
              setBundleSize(185.3);
              addLog('SUCCESS', `Successfully stitched Security Dispatch Micro-Frontend (${remoteVersions.SECURITY}) into DOM.`);
          } else {
              setBundleSize(84.2);
              addLog('SYS', 'Returned to Host Shell Dashboard.');
          }
      }, 800);
  };

  const simulateRemoteDeploy = (targetModule) => {
      addLog('ACTION', `CI/CD triggered for decoupled @eventra/${targetModule.toLowerCase()} micro-frontend.`);
      
      setTimeout(() => {
          setRemoteVersions(prev => {
              const current = prev[targetModule];
              const parts = current.split('.');
              const newMinor = parseInt(parts[1]) + 1;
              return { ...prev, [targetModule]: `v${parts[0]}.${newMinor}.0` };
          });
          
          addLog('SUCCESS', `Zero-downtime deployment complete. New ${targetModule} chunk available at edge cache.`);
          
          if (activeModule === targetModule) {
              addLog('WARN', 'Hot Module Replacement (HMR) synced new remote version to active client.');
          }
      }, 1500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧩</span> Frontend Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Micro-Frontend Architecture <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-sky-500">via Module Federation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The monolithic Eventra Admin React dashboard has become bloated and fragile. Pushing a minor update to the "Food Vendor POS" UI previously risked breaking the critical "Medical Triage" UI, slowing down deployment velocity to a crawl. Eventra solves this by refactoring the portal into a Micro-Frontend architecture using Webpack Module Federation. The Food, Medical, Security, and Core Host portals are decoupled into independently deployable React applications. They stitch together dynamically at runtime in the browser, reducing CI/CD build times from 25 minutes down to 90 seconds.
          </p>

          <div className="bg-[#0a0f1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Webpack Orchestration Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={() => loadMicroFrontend('DASHBOARD')}
                   disabled={activeModule === 'DASHBOARD' || isModuleLoading}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     activeModule === 'DASHBOARD' || isModuleLoading ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   Reset to Host Shell
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Remote */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isModuleLoading ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse' : 
                 activeModule !== 'DASHBOARD' ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Federated Module
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     isModuleLoading ? 'text-indigo-400' : 
                     activeModule !== 'DASHBOARD' ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {isModuleLoading ? 'FETCHING CHUNK...' : `@eventra/${activeModule.toLowerCase()}`}
                   </span>
                 </div>
               </div>

               {/* Payload Size */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeModule !== 'DASHBOARD' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DOM Payload
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     activeModule !== 'DASHBOARD' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {bundleSize.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">KB</span>
                 </div>
               </div>
               
               {/* CI/CD Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Avg Deploy
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {ciCdDeployTime.toFixed(1)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mins</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Container Output Ledger</span>
                 {isModuleLoading && <span className="text-indigo-400 font-black animate-pulse">RESOLVING IMPORTS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Host App Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6 bg-[#0a0f1c]`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">APP SHELL (HOST CONTAINER)</span>
                <span className="text-[8px] font-mono text-emerald-500">v1.0.0</span>
              </div>

              {/* Sidebar and Main Content Layout */}
              <div className="flex-1 flex pt-10">
                  
                  {/* Host Sidebar */}
                  <div className="w-20 bg-[#050811] border-r border-slate-800 flex flex-col items-center py-4 space-y-4">
                      
                      <button 
                          onClick={() => loadMicroFrontend('DASHBOARD')}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition ${activeModule === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                      >
                          🏠
                      </button>

                      <button 
                          onClick={() => loadMicroFrontend('FOOD_POS')}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition relative ${activeModule === 'FOOD_POS' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                      >
                          🍔
                          <span className="absolute -bottom-1 -right-1 text-[6px] font-mono bg-black text-orange-400 px-1 rounded">{remoteVersions.FOOD_POS}</span>
                      </button>

                      <button 
                          onClick={() => loadMicroFrontend('MEDICAL')}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition relative ${activeModule === 'MEDICAL' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                      >
                          🏥
                          <span className="absolute -bottom-1 -right-1 text-[6px] font-mono bg-black text-red-400 px-1 rounded">{remoteVersions.MEDICAL}</span>
                      </button>

                      <button 
                          onClick={() => loadMicroFrontend('SECURITY')}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition relative ${activeModule === 'SECURITY' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                      >
                          🛡️
                          <span className="absolute -bottom-1 -right-1 text-[6px] font-mono bg-black text-indigo-400 px-1 rounded">{remoteVersions.SECURITY}</span>
                      </button>
                      
                  </div>

                  {/* Remote Content Injection Area */}
                  <div className="flex-1 p-4 relative overflow-hidden bg-slate-950">
                      
                      {isModuleLoading ? (
                          <div className="w-full h-full flex flex-col justify-center items-center">
                              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                              <span className="text-[10px] font-mono text-slate-500">Injecting Remote Container...</span>
                          </div>
                      ) : activeModule === 'DASHBOARD' ? (
                          <div className="w-full h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col justify-center items-center p-4 text-center animate-fade-in-up">
                              <span className="text-3xl mb-4 opacity-50">📦</span>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Host Dashboard</span>
                              <span className="text-[10px] text-slate-600">Select a micro-frontend from the sidebar to dynamically load it into this DOM node.</span>
                          </div>
                      ) : activeModule === 'FOOD_POS' ? (
                          <div className="w-full h-full bg-orange-950/20 border border-orange-900/50 rounded-xl p-4 flex flex-col animate-fade-in-up">
                              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-900/50 pb-2">@eventra/food_pos</span>
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="bg-orange-900/30 h-16 rounded border border-orange-800/50 flex flex-col items-center justify-center text-[10px] text-orange-400 font-mono">
                                      <span>TACOS</span>
                                      <span>$12</span>
                                  </div>
                                  <div className="bg-orange-900/30 h-16 rounded border border-orange-800/50 flex flex-col items-center justify-center text-[10px] text-orange-400 font-mono">
                                      <span>BEER</span>
                                      <span>$8</span>
                                  </div>
                              </div>
                              <button onClick={() => simulateRemoteDeploy('FOOD_POS')} className="mt-auto w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase rounded shadow-lg">Deploy Update (CI/CD)</button>
                          </div>
                      ) : activeModule === 'MEDICAL' ? (
                          <div className="w-full h-full bg-red-950/20 border border-red-900/50 rounded-xl p-4 flex flex-col animate-fade-in-up">
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 border-b border-red-900/50 pb-2">@eventra/medical</span>
                              <div className="space-y-2 mb-4">
                                  <div className="bg-red-900/30 p-2 rounded border border-red-800/50 flex justify-between text-[10px] font-mono text-red-300">
                                      <span>PATIENT_ID: 1042</span>
                                      <span>DEHYDRATION</span>
                                  </div>
                                  <div className="bg-red-900/30 p-2 rounded border border-red-800/50 flex justify-between text-[10px] font-mono text-red-300">
                                      <span>PATIENT_ID: 1043</span>
                                      <span>MINOR_BURN</span>
                                  </div>
                              </div>
                              <button onClick={() => simulateRemoteDeploy('MEDICAL')} className="mt-auto w-full py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded shadow-lg">Deploy Update (CI/CD)</button>
                          </div>
                      ) : activeModule === 'SECURITY' ? (
                          <div className="w-full h-full bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-4 flex flex-col animate-fade-in-up">
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-900/50 pb-2">@eventra/security</span>
                              <div className="flex-1 bg-slate-900 border border-indigo-800/50 rounded relative mb-4 overflow-hidden flex items-center justify-center">
                                  <span className="text-[10px] font-mono text-indigo-400">CAMERA_FEED_NODE</span>
                                  <div className="absolute inset-0 border-2 border-indigo-500/30 animate-pulse"></div>
                              </div>
                              <button onClick={() => simulateRemoteDeploy('SECURITY')} className="mt-auto w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded shadow-lg">Deploy Update (CI/CD)</button>
                          </div>
                      ) : null}

                  </div>
                  
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MicroFrontendOrchestrator;
