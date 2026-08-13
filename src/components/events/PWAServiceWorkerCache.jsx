/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PWAServiceWorkerCache = () => {
  const [networkStatus, setNetworkStatus] = useState('ONLINE'); // 'ONLINE' or 'OFFLINE'
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [cachingActive, setCachingActive] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Checking browser support for navigator.serviceWorker...' },
    { id: 2, time: '08:00:01', type: 'SUCCESS', msg: 'Service Worker supported. Awaiting registration.' }
  ]);

  const [cacheContents, setCacheContents] = useState({
      'index.html': false,
      'app.bundle.js': false,
      'styles.css': false,
      '/api/schedule.json': false,
      'map_tiles.webp': false
  });

  const installPwa = () => {
      addLog('ACTION', 'User clicked [Add to Home Screen]. Firing beforeinstallprompt event.');
      setPwaInstalled(true);
      
      setTimeout(() => {
          addLog('SYS', 'Registering Service Worker (sw.js)...');
          
          setTimeout(() => {
              addLog('SUCCESS', 'Service Worker Registered (Scope: /). Pre-caching static assets (App Shell).');
              setCachingActive(true);
              
              // Simulate caching items over time
              const items = Object.keys(cacheContents);
              items.forEach((item, i) => {
                  setTimeout(() => {
                      setCacheContents(prev => ({ ...prev, [item]: true }));
                  }, 400 + (i * 300));
              });
              
              setTimeout(() => {
                  addLog('SUCCESS', 'PWA Install Complete. Cache Storage API populated (4.2 MB).');
              }, 400 + (items.length * 300));
              
          }, 800);
      }, 500);
  };

  const toggleNetwork = () => {
      const newStatus = networkStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
      setNetworkStatus(newStatus);
      
      if (newStatus === 'OFFLINE') {
          addLog('CRIT', 'Network Connection Lost! Cellular data dropped.');
          if (cachingActive) {
              addLog('ACTION', 'Service Worker intercepted fetch(). Serving [index.html] from Cache Storage.');
          }
      } else {
          addLog('SUCCESS', 'Network Connection Restored.');
          if (cachingActive) {
              addLog('SYS', 'Service Worker running Stale-While-Revalidate. Fetching fresh /api/schedule.json in background.');
          }
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const allCached = Object.values(cacheContents).every(v => v);

  return (
    <div className="min-h-screen bg-[#071317] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📱</span> Progressive Web Apps
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Service Worker Caching <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500">PWA Installability</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees don't want to download a heavy 150MB native iOS/Android app just for a 3-day weekend event. However, standard websites break the moment cell service drops at a crowded festival. Eventra solves this by converting the web application into a fully installable Progressive Web App (PWA). By utilizing Service Workers and advanced Stale-While-Revalidate caching strategies, the core schedule, maps, and UI load instantly from the device cache, even completely offline.
          </p>

          <div className="bg-[#0b1c21] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> DevTools App Inspector
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNetwork}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     networkStatus === 'ONLINE' ? 'bg-rose-900/40 text-rose-400 border border-rose-500 hover:bg-rose-800/60' :
                     'bg-emerald-900/40 text-emerald-400 border border-emerald-500 hover:bg-emerald-800/60'
                   }`}
                 >
                   {networkStatus === 'ONLINE' ? 'Simulate Offline' : 'Restore Network'}
                 </button>
               </div>
             </div>

             <div className="flex space-x-6 mb-6 h-40">
                 
                 {/* Cache Storage Viewer */}
                 <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col font-mono text-[9px] relative overflow-hidden">
                     <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                         <span className="text-teal-400 font-bold uppercase block">Cache Storage API v1</span>
                         <span className="text-slate-500">ev-cache-v3</span>
                     </div>
                     
                     <div className="flex-1 space-y-1.5 overflow-y-auto">
                         {Object.entries(cacheContents).map(([key, isCached]) => (
                             <div key={key} className="flex justify-between items-center bg-[#071317] p-1.5 rounded border border-slate-800">
                                 <span className={isCached ? 'text-slate-300' : 'text-slate-600'}>{key}</span>
                                 {isCached ? (
                                     <span className="text-emerald-500 font-bold">200 OK (Cache)</span>
                                 ) : (
                                     <span className="text-slate-600">Pending...</span>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Service Worker Status */}
                 <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3">Service Worker</span>
                     
                     {cachingActive ? (
                         <div className="flex flex-col items-center">
                             <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                 ⚙️
                             </div>
                             <span className="text-[10px] font-black text-emerald-400 uppercase">Activated</span>
                             <span className="text-[8px] font-mono text-slate-500 mt-1">sw.js (Scope: /)</span>
                         </div>
                     ) : (
                         <div className="flex flex-col items-center opacity-40">
                             <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-500 mb-2">
                                 ❌
                             </div>
                             <span className="text-[10px] font-black text-slate-500 uppercase">Unregistered</span>
                         </div>
                     )}
                 </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04090b] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Browser Engine Log</span>
                 {networkStatus === 'OFFLINE' && <span className="text-rose-500 font-black animate-pulse">NO INTERNET</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-900/20 px-1' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Mobile Browser Simulator */}
            <div className={`w-full bg-[#f8fafc] rounded-[2rem] border-[10px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* Safari Top Bar (Only visible if NOT installed as PWA) */}
              {!pwaInstalled && (
                  <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-col items-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-800">eventra.io</span>
                      <div className="w-full mt-2 bg-white border border-slate-300 rounded-md py-1 px-2 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">AA</span>
                          <span className="text-slate-800 font-bold">eventra.io</span>
                          <span className="text-slate-400">↻</span>
                      </div>
                  </div>
              )}
              
              {/* iOS Status Bar (Always visible) */}
              {pwaInstalled && (
                  <div className="bg-teal-600 h-6 flex justify-between items-center px-4 text-white text-[8px] font-bold z-20">
                      <span>9:41</span>
                      <div className="flex space-x-1 items-center">
                          {networkStatus === 'ONLINE' ? <span>5G</span> : <span className="text-rose-200">No Service</span>}
                      </div>
                  </div>
              )}

              <div className="flex-1 relative bg-slate-50 flex flex-col">
                  
                  {/* Scenario 1: Standard Website, Offline */}
                  {!pwaInstalled && networkStatus === 'OFFLINE' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-white">
                          <span className="text-6xl mb-6 grayscale opacity-80">🦖</span>
                          <h2 className="text-xl font-black text-slate-800 mb-2">No Internet</h2>
                          <p className="text-xs text-slate-500">
                              Safari cannot open the page because your iPhone is not connected to the internet.
                          </p>
                      </div>
                  )}

                  {/* Scenario 2: Standard Website, Online (Shows Install Prompt) */}
                  {!pwaInstalled && networkStatus === 'ONLINE' && (
                      <div className="flex-1 flex flex-col">
                          <div className="bg-teal-600 text-white p-4 pb-12 rounded-b-3xl">
                              <h2 className="text-xl font-black mb-1">Eventra 2026</h2>
                              <p className="text-xs text-teal-100">Live Schedule</p>
                          </div>
                          
                          <div className="p-4 -mt-8 relative z-10 space-y-3">
                              {[1,2,3].map(i => (
                                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                      <div className="h-3 bg-slate-200 rounded w-1/3 mb-2"></div>
                                      <div className="h-2 bg-slate-100 rounded w-full"></div>
                                  </div>
                              ))}
                          </div>
                          
                          {/* Simulated Install Prompt */}
                          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-fade-in-up z-20">
                              <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                      <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xl mr-3 shadow-inner">🎪</div>
                                      <div>
                                          <h4 className="text-sm font-black text-slate-800">Install Eventra App</h4>
                                          <p className="text-[9px] text-slate-500">Works offline. Fast.</p>
                                      </div>
                                  </div>
                              </div>
                              <button 
                                onClick={installPwa}
                                className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold"
                              >
                                  Add to Home Screen
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Scenario 3: PWA Installed (Online or Offline) */}
                  {pwaInstalled && (
                      <div className="flex-1 flex flex-col h-full bg-slate-50">
                          <div className="bg-teal-600 text-white p-4 pb-12 rounded-b-3xl relative">
                              {networkStatus === 'OFFLINE' && (
                                  <div className="absolute top-2 right-4 bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm flex items-center">
                                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span> Offline Mode
                                  </div>
                              )}
                              <h2 className="text-xl font-black mb-1 mt-2">Eventra 2026</h2>
                              <p className="text-xs text-teal-100">Live Schedule</p>
                          </div>
                          
                          <div className="p-4 -mt-8 relative z-10 flex-1 overflow-y-auto">
                              
                              {/* If offline but not everything is cached yet */}
                              {networkStatus === 'OFFLINE' && !allCached && (
                                  <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl mb-4 text-center">
                                      <span className="text-amber-600 font-bold text-[10px] uppercase">Service Worker Warning</span>
                                      <p className="text-[9px] text-amber-700 mt-1">Caching incomplete. Some assets may be missing.</p>
                                  </div>
                              )}

                              <div className="space-y-3">
                                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                      <h4 className="text-xs font-black text-slate-800">Odesza</h4>
                                      <p className="text-[10px] text-slate-500 mt-1">Main Stage • 22:00</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                      <h4 className="text-xs font-black text-slate-800">Tame Impala</h4>
                                      <p className="text-[10px] text-slate-500 mt-1">Main Stage • 20:00</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 opacity-60">
                                      <h4 className="text-xs font-black text-slate-800">Skrillex</h4>
                                      <p className="text-[10px] text-slate-500 mt-1">Neon Tent • 18:30 (Ended)</p>
                                  </div>
                              </div>
                              
                              {networkStatus === 'OFFLINE' && (
                                  <div className="mt-6 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-200/50 py-2 rounded">
                                      Rendered seamlessly from CacheStorage
                                  </div>
                              )}
                          </div>
                          
                          {/* PWA Bottom Nav */}
                          <div className="h-16 bg-white border-t border-slate-200 flex justify-around items-center text-xl text-slate-400">
                              <span className="text-teal-600">📅</span>
                              <span>🗺️</span>
                              <span>💳</span>
                              <span>👤</span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b1c21] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">Service Worker Interception:</span>
               Without the PWA, dropping the network kills the app entirely (T-Rex). By installing the PWA, the Service Worker intercepts network requests and serves the exact same UI natively from the <span className="text-emerald-400 font-mono">CacheStorage</span>, regardless of cell connectivity.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PWAServiceWorkerCache;
