/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EdgeCachingCDN = () => {
  const [isEdgeEnabled, setIsEdgeEnabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [cacheStatus, setCacheStatus] = useState('MISS'); // MISS or HIT
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Global DNS routing initialized. Awaiting client requests.' }
  ]);

  const executeFetch = () => {
      setIsFetching(true);
      setFetchComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'User (Sydney, AU) requested asset: /images/festival-map.jpg');
      
      if (isEdgeEnabled) {
          setTimeout(() => {
              setActiveStep(2);
              addLog('SYS', '[DNS] Anycast routing to nearest Edge PoP: SYD (Sydney).');
              
              setTimeout(() => {
                  setActiveStep(3);
                  
                  if (cacheStatus === 'MISS') {
                      addLog('WARN', '[Cloudflare Worker] Cache MISS. Initiating cross-ocean fetch to Origin.');
                      
                      setTimeout(() => {
                          setActiveStep(4);
                          addLog('SYS', '[Origin S3] us-east-1 (Virginia) serving 4.2MB asset.');
                          
                          setTimeout(() => {
                              setActiveStep(5);
                              addLog('SYS', '[Cloudflare Worker] Writing asset to SYD Edge Cache.');
                              setCacheStatus('HIT'); // Next request will be a HIT
                              
                              setTimeout(() => {
                                  setActiveStep(6);
                                  setIsFetching(false);
                                  setFetchComplete(true);
                                  addLog('SUCCESS', 'Asset delivered. TTFB: 825ms (First Load Penalty).');
                              }, 500);
                          }, 1200); // Simulate long ocean transit
                      }, 500);
                      
                  } else {
                      // HIT
                      addLog('SUCCESS', '[Cloudflare Worker] Cache HIT. Reading from local RAM/NVMe.');
                      
                      setTimeout(() => {
                          setActiveStep(6);
                          setIsFetching(false);
                          setFetchComplete(true);
                          addLog('SUCCESS', 'Asset delivered. TTFB: 15ms. Origin bypassed entirely.');
                      }, 600); // Super fast local delivery
                  }
              }, 400);
          }, 300);
          
      } else {
          // Legacy direct to origin
          setTimeout(() => {
              setActiveStep(3); // Skip straight to cross-ocean
              addLog('WARN', '[DNS] Direct routing to Origin Server: us-east-1 (Virginia, USA).');
              
              setTimeout(() => {
                  setActiveStep(4);
                  addLog('SYS', '[Origin S3] us-east-1 serving 4.2MB asset.');
                  
                  setTimeout(() => {
                      setActiveStep(6);
                      setIsFetching(false);
                      setFetchComplete(true);
                      addLog('CRIT', 'Asset delivered. TTFB: 810ms. High latency degraded user experience.');
                  }, 1500); // Simulate long ocean transit back
              }, 1500); // Simulate long ocean transit forward
          }, 400);
      }
  };

  const toggleEdge = () => {
      const newState = !isEdgeEnabled;
      setIsEdgeEnabled(newState);
      setFetchComplete(false);
      setActiveStep(0);
      setCacheStatus('MISS'); // Reset cache when toggling
      
      if (newState) {
          addLog('SUCCESS', 'Cloudflare Workers deployed globally. Edge caching active in 275+ cities.');
      } else {
          addLog('CRIT', 'CDN disabled. All global traffic falling back to single AWS us-east-1 origin.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060401] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌍</span> Global Network Performance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Edge Caching CDN <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500">Cloudflare Workers Integration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Currently, all of Eventra's static assets (like the 4.2MB high-res festival map image) are served directly from a single AWS S3 bucket located in Virginia (us-east-1). When a user in Sydney, Australia loads the app, their request must physically travel across the Pacific Ocean and back, resulting in a laggy 800ms+ load time. Manually replicating S3 buckets globally is expensive and complex. Eventra solves this by deploying a Cloudflare CDN. The Edge Worker intercepts the Australian user's request. If the asset isn't cached locally (MISS), it fetches it from Virginia once, caches it at the Sydney PoP, and serves all subsequent Australian users from local SSDs with a blazing fast 15ms latency (HIT).
          </p>

          <div className="bg-[#120702] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Edge Computing Engine
               </h3>
               {fetchComplete && (
                   <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                       {isEdgeEnabled ? (cacheStatus === 'HIT' ? 'LOCAL CACHE WARM' : 'CACHE NOW WARMED') : 'NO CACHE CONFIGURED'}
                   </span>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Edge Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Global Routing Strategy</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isEdgeEnabled ? 'Active: Cloudflare CDN (Anycast to Edge PoP)' : 'Inactive: Direct Unicast (us-east-1 Origin)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleEdge}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isEdgeEnabled ? 'bg-orange-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isEdgeEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeFetch}
                     disabled={isFetching}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         isFetching ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         isEdgeEnabled && cacheStatus === 'HIT' ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-400 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
                         'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                     }`}
                 >
                     {isFetching ? 'Routing Request Packet...' : isEdgeEnabled && cacheStatus === 'HIT' ? "User #2: Request Map (Expect Cache Hit)" : "User #1: Request Festival Map from Sydney"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Global Network Traces</span>
                 {isFetching && <span className="text-orange-400 font-black animate-pulse">TRACING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-orange-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Latency Map Visualizer</span>
                      <span className="text-xs text-white font-bold">Physical Packet Routing</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Abstract Map Background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                      {/* Very crude abstract continents to give a geographic feel */}
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M10,20 Q30,10 40,30 T20,60 Z" fill="#fff" /> {/* America-ish */}
                          <path d="M60,60 Q80,50 90,70 T70,90 Z" fill="#fff" /> {/* Australia-ish */}
                      </svg>
                  </div>

                  {/* Nodes on Map */}

                  {/* Sydney User (Bottom Right) */}
                  <div className="absolute bottom-16 right-10 flex flex-col items-center z-20">
                      <div className="bg-blue-950/80 border border-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-sm mb-2">
                          📱
                      </div>
                      <div className="bg-black/80 px-2 py-0.5 rounded border border-slate-800 text-[8px] font-bold uppercase text-slate-300">
                          Client (SYD)
                      </div>
                  </div>

                  {/* Cloudflare Edge PoP (Sydney) - Only visible if Edge enabled */}
                  <div className={`absolute bottom-32 right-24 flex flex-col items-center z-20 transition-all duration-500 ${isEdgeEnabled ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <div className={`rounded-xl w-16 h-16 flex items-center justify-center text-2xl border-2 backdrop-blur-sm mb-2 transition-colors ${
                          activeStep >= 2 && cacheStatus === 'HIT' ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' :
                          activeStep >= 2 ? 'bg-orange-950 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.5)]' :
                          'bg-slate-900 border-slate-700'
                      }`}>
                          ☁️
                      </div>
                      <div className="bg-black/80 p-1.5 rounded border border-slate-800 text-[7px] font-bold text-center leading-tight">
                          <span className="text-orange-400 block mb-0.5 uppercase">Edge PoP (SYD)</span>
                          <span className={cacheStatus === 'HIT' ? 'text-emerald-500' : 'text-slate-500 font-mono'}>
                              Cache: {cacheStatus}
                          </span>
                      </div>
                  </div>

                  {/* AWS Origin Server (Top Left) */}
                  <div className="absolute top-16 left-10 flex flex-col items-center z-20">
                      <div className={`rounded-xl w-16 h-16 flex items-center justify-center text-2xl border-2 backdrop-blur-sm mb-2 transition-colors ${
                          (!isEdgeEnabled && activeStep >= 3) || (isEdgeEnabled && cacheStatus === 'MISS' && activeStep >= 3) ? 'bg-cyan-950 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'bg-slate-900 border-slate-700'
                      }`}>
                          🗄️
                      </div>
                      <div className="bg-black/80 px-2 py-1 rounded border border-slate-800 text-[7px] font-bold text-center leading-tight">
                          <span className="text-cyan-400 block uppercase mb-0.5">Origin S3 Bucket</span>
                          <span className="text-slate-500 font-mono block">us-east-1 (IAD)</span>
                      </div>
                  </div>

                  {/* Network Routing Lines & Packets */}
                  
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }}>
                      
                      {/* Direct Line: Client -> Origin (Legacy) */}
                      {!isEdgeEnabled && (
                          <path 
                              d="M 280 390 Q 200 200 70 120" 
                              fill="none" 
                              stroke="#ef4444" 
                              strokeWidth="2" 
                              strokeDasharray="4 4"
                              className={activeStep >= 3 ? 'opacity-100' : 'opacity-20'}
                          />
                      )}
                      
                      {/* Edge Line 1: Client -> PoP (Edge Enabled) */}
                      {isEdgeEnabled && (
                          <path 
                              d="M 280 390 L 250 320" 
                              fill="none" 
                              stroke="#10b981" 
                              strokeWidth="2" 
                              className={activeStep >= 2 ? 'opacity-100' : 'opacity-20'}
                          />
                      )}

                      {/* Edge Line 2: PoP -> Origin (Edge Enabled, MISS) */}
                      {isEdgeEnabled && (
                          <path 
                              d="M 230 280 Q 180 150 80 120" 
                              fill="none" 
                              stroke="#f59e0b" 
                              strokeWidth="2" 
                              strokeDasharray="4 4"
                              className={activeStep >= 3 && cacheStatus === 'MISS' ? 'opacity-100' : 'opacity-20'}
                          />
                      )}
                  </svg>

                  {/* Packets */}
                  
                  {/* Direct Packet (Client -> Origin) */}
                  {!isEdgeEnabled && activeStep >= 3 && activeStep < 4 && (
                      <div className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] z-30 animate-[moveDirect_1.5s_linear_forwards]"></div>
                  )}
                  {/* Direct Packet (Origin -> Client) */}
                  {!isEdgeEnabled && activeStep >= 4 && activeStep < 6 && (
                      <div className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] z-30 animate-[moveDirectBack_1.5s_linear_forwards]"></div>
                  )}

                  {/* Edge Packet (Client -> PoP) */}
                  {isEdgeEnabled && activeStep >= 2 && activeStep < 3 && (
                      <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)] z-30 animate-[moveLocal_0.4s_linear_forwards]"></div>
                  )}
                  {/* Edge Packet (PoP -> Origin -> PoP) for MISS */}
                  {isEdgeEnabled && cacheStatus === 'MISS' && activeStep >= 3 && activeStep < 4 && (
                      <div className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)] z-30 animate-[moveOcean_1s_linear_forwards]"></div>
                  )}
                  {isEdgeEnabled && cacheStatus === 'MISS' && activeStep >= 4 && activeStep < 6 && (
                      <div className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)] z-30 animate-[moveOceanBack_1s_linear_forwards]"></div>
                  )}
                  {/* Edge Packet (PoP -> Client) */}
                  {isEdgeEnabled && activeStep >= 5 && activeStep < 6 && cacheStatus === 'MISS' && (
                      <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)] z-30 animate-[moveLocalBack_0.4s_linear_forwards]"></div>
                  )}
                  {isEdgeEnabled && activeStep >= 3 && cacheStatus === 'HIT' && (
                      <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)] z-30 animate-[moveLocalBack_0.6s_linear_forwards]"></div>
                  )}


                  {/* Metrics Overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/80 p-3 rounded-xl border border-slate-700 font-mono text-[9px] backdrop-blur-sm z-40 w-48">
                      <span className="text-white font-bold block border-b border-slate-700 pb-1 mb-2">Performance Metrics</span>
                      
                      <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Time To First Byte:</span>
                          <span className={`font-bold ${fetchComplete ? (!isEdgeEnabled || cacheStatus === 'MISS' ? 'text-red-500' : 'text-emerald-400') : 'text-slate-600'}`}>
                              {fetchComplete ? (!isEdgeEnabled ? '810ms' : cacheStatus === 'MISS' ? '825ms' : '15ms') : '--ms'}
                          </span>
                      </div>
                      
                      <div className="flex justify-between">
                          <span className="text-slate-400">Distance Traveled:</span>
                          <span className="text-white font-bold">
                              {fetchComplete ? (!isEdgeEnabled || cacheStatus === 'MISS' ? '15,000 km' : '20 km') : '-- km'}
                          </span>
                      </div>
                  </div>

                  {/* Custom Keyframes */}
                  <style>{`
                      /* Approximation coordinates for the SVG paths */
                      @keyframes moveDirect {
                          0% { transform: translate(280px, 390px); }
                          100% { transform: translate(70px, 120px); }
                      }
                      @keyframes moveDirectBack {
                          0% { transform: translate(70px, 120px); }
                          100% { transform: translate(280px, 390px); }
                      }
                      @keyframes moveLocal {
                          0% { transform: translate(280px, 390px); }
                          100% { transform: translate(250px, 320px); }
                      }
                      @keyframes moveLocalBack {
                          0% { transform: translate(250px, 320px); }
                          100% { transform: translate(280px, 390px); }
                      }
                      @keyframes moveOcean {
                          0% { transform: translate(230px, 280px); }
                          100% { transform: translate(80px, 120px); }
                      }
                      @keyframes moveOceanBack {
                          0% { transform: translate(80px, 120px); }
                          100% { transform: translate(230px, 280px); }
                      }
                  `}</style>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120702] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">Content Delivery & Anycast Routing:</span>
               With the Edge CDN OFF, Australian users must retrieve large images directly from the Virginia AWS servers. Physics limits the speed of light through fiber optic cables under the ocean, strictly enforcing a laggy 800ms load time (High Latency).<br/><br/>Toggle <span className="text-orange-400 font-bold bg-slate-800 px-1 rounded">Routing Strategy</span> ON. The first request takes 825ms because the Sydney Cloudflare Worker must fetch it from Virginia (Cache MISS). But the Worker intelligently saves a copy locally. Now, click <span className="text-emerald-400 font-bold bg-slate-800 px-1 rounded">User #2 Request</span>. The asset is delivered instantly from the Sydney data center in 15ms (Cache HIT), completely bypassing the trans-pacific origin trip.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EdgeCachingCDN;
