/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GraphQLFederationArchitecture = () => {
  const [activeMode, setActiveMode] = useState('GRAPHQL'); // 'REST' or 'GRAPHQL'
  const [isFetching, setIsFetching] = useState(false);
  const [dataReceived, setDataReceived] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Apollo Federation Gateway standing by on port 4000.' }
  ]);

  const executeQuery = () => {
      setIsFetching(true);
      setDataReceived(false);
      
      if (activeMode === 'REST') {
          addLog('ACTION', 'Mobile Client: Firing 15 sequential REST API calls...');
          
          setTimeout(() => {
              addLog('WARN', 'GET /api/v1/artists - 200 OK (215ms)');
              addLog('WARN', 'GET /api/v1/stages - 200 OK (180ms)');
              
              setTimeout(() => {
                  addLog('WARN', 'GET /api/v1/schedule?artistId=... (x13 requests)');
                  
                  setTimeout(() => {
                      setIsFetching(false);
                      setDataReceived(true);
                      addLog('CRIT', 'REST Waterfall complete. Total Latency: 2450ms. Battery drain high.');
                  }, 1500);
              }, 800);
          }, 800);
          
      } else {
          // GraphQL Mode
          addLog('ACTION', 'Mobile Client: Firing 1 unified GraphQL Query...');
          
          setTimeout(() => {
              addLog('SYS', 'Apollo Gateway: Query received. Generating Query Plan.');
              addLog('SYS', 'Apollo Gateway: Dispatching parallel sub-queries to Microservices...');
              
              setTimeout(() => {
                  setIsFetching(false);
                  setDataReceived(true);
                  addLog('SUCCESS', 'GraphQL Federation complete. Subgraphs resolved. Total Latency: 185ms.');
              }, 1200);
          }, 600);
      }
  };

  const toggleMode = (mode) => {
      if (mode === activeMode || isFetching) return;
      setActiveMode(mode);
      setDataReceived(false);
      if (mode === 'REST') {
          addLog('CRIT', 'Architecture switched to Legacy REST. Waterfall fetching enabled.');
      } else {
          addLog('SUCCESS', 'Architecture switched to GraphQL Federation. Subgraph routing enabled.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕸️</span> Backend Architecture & APIs
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            GraphQL Federation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500">API Gateway</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When loading the festival schedule, the mobile app traditionally makes 15 separate REST API calls to fetch artist bios, stage locations, and set times. This waterfall of network requests causes severe load times and drains user batteries. Eventra solves this by implementing an Apollo GraphQL Federation gateway. It seamlessly aggregates data from the independent Artists, Stages, and Scheduling microservices into a single, unified graph, allowing the frontend to fetch the exact data it needs in a single, highly optimized request.
          </p>

          <div className="bg-[#100312] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> Network Dispatcher
               </h3>
               {dataReceived && (
                   <button onClick={() => setDataReceived(false)} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Network</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Architecture Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 grid grid-cols-2 gap-2 mb-6">
                     <button 
                         onClick={() => toggleMode('REST')}
                         className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                             activeMode === 'REST' ? 'bg-rose-900/40 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'text-slate-500 hover:text-slate-300'
                         }`}
                     >
                         Legacy REST APIs
                     </button>
                     <button 
                         onClick={() => toggleMode('GRAPHQL')}
                         className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                             activeMode === 'GRAPHQL' ? 'bg-pink-900/40 text-pink-400 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'text-slate-500 hover:text-slate-300'
                         }`}
                     >
                         GraphQL Federation
                     </button>
                 </div>

                 <div className="flex-1 bg-black/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-center mb-6 font-mono text-[10px]">
                     {activeMode === 'REST' ? (
                         <div className="text-slate-400 space-y-1">
                             <div className="text-rose-400 font-bold mb-2">// Multiple Waterfall Requests</div>
                             <div>fetch('/api/artists');</div>
                             <div>fetch('/api/stages');</div>
                             <div>fetch('/api/schedule?artist=1');</div>
                             <div>fetch('/api/schedule?artist=2');</div>
                             <div className="text-slate-600">... (11 more calls)</div>
                         </div>
                     ) : (
                         <div className="text-slate-400 space-y-1">
                             <div className="text-pink-400 font-bold mb-2"># Single Unified Query</div>
                             <div className="text-purple-300">query GetFestivalSchedule {'{'}</div>
                             <div className="pl-4 text-cyan-200">stages {'{'}</div>
                             <div className="pl-8 text-slate-300">name</div>
                             <div className="pl-8 text-emerald-200">schedule {'{'}</div>
                             <div className="pl-12 text-slate-300">time</div>
                             <div className="pl-12 text-pink-200">artist {'{'} name genre {'}'}</div>
                             <div className="pl-8 text-emerald-200">{'}'}</div>
                             <div className="pl-4 text-cyan-200">{'}'}</div>
                             <div className="text-purple-300">{'}'}</div>
                         </div>
                     )}
                 </div>

                 <button 
                     onClick={executeQuery}
                     disabled={isFetching || dataReceived}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         dataReceived ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isFetching ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         activeMode === 'REST' ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500' :
                         'bg-pink-600 hover:bg-pink-500 text-white border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                     }`}
                 >
                     {isFetching ? 'Executing Network Request...' : dataReceived ? 'Data Loaded' : 'Fetch Schedule Data'}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040106] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Network Telemetry Logs</span>
                 {isFetching && <span className="text-pink-400 font-black animate-pulse">FETCHING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Backend Architecture</span>
                      <span className="text-xs text-white font-bold">Topology Map</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-between">
                  
                  {/* Client */}
                  <div className="w-full flex justify-center z-20">
                      <div className="bg-slate-800 border border-slate-600 rounded-xl px-6 py-3 flex flex-col items-center shadow-lg">
                          <span className="text-2xl mb-1">📱</span>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Mobile Client</span>
                      </div>
                  </div>

                  {/* Gateway (Only visible in GraphQL mode) */}
                  <div className={`w-full flex justify-center z-20 transition-all duration-500 ${activeMode === 'GRAPHQL' ? 'opacity-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                      <div className="bg-pink-900/30 border border-pink-500 rounded-xl px-12 py-3 flex flex-col items-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                          <span className="text-xl mb-1">🕸️</span>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Apollo Federation Gateway</span>
                      </div>
                  </div>

                  {/* Microservices */}
                  <div className="w-full flex justify-between z-20 px-2">
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col items-center w-24">
                          <span className="text-lg mb-1">🎸</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Artists API</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col items-center w-24">
                          <span className="text-lg mb-1">🏟️</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Stages API</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col items-center w-24">
                          <span className="text-lg mb-1">📅</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Schedule API</span>
                      </div>
                  </div>

                  {/* Animated Network Lines */}
                  {/* SVG Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' }}>
                      
                      {activeMode === 'REST' && isFetching && (
                          <>
                              {/* Multiple cascading lines from Mobile to Microservices */}
                              <path d="M 210 80 Q 210 200 80 400" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_0.5s_linear_infinite]" />
                              <path d="M 210 80 Q 210 200 210 400" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_0.5s_linear_infinite] [animation-delay:0.2s]" />
                              <path d="M 210 80 Q 210 200 340 400" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_0.5s_linear_infinite] [animation-delay:0.4s]" />
                              
                              {/* Simulating 12 more waterfall calls */}
                              <path d="M 210 80 Q 150 200 80 400" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" className="animate-[dash_0.5s_linear_infinite] [animation-delay:0.6s]" />
                              <path d="M 210 80 Q 250 200 340 400" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" className="animate-[dash_0.5s_linear_infinite] [animation-delay:0.8s]" />
                          </>
                      )}

                      {activeMode === 'GRAPHQL' && isFetching && (
                          <>
                              {/* 1 Line from Mobile to Gateway */}
                              <path d="M 210 80 L 210 230" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray="10,5" className="animate-[dash_0.3s_linear_infinite]" />
                              
                              {/* 3 Parallel Lines from Gateway to Microservices */}
                              <path d="M 210 280 Q 210 320 80 400" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_0.4s_linear_infinite] [animation-delay:0.3s]" opacity="0" style={{ animationFillMode: 'forwards' }} />
                              <path d="M 210 280 L 210 400" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_0.4s_linear_infinite] [animation-delay:0.3s]" opacity="0" style={{ animationFillMode: 'forwards' }} />
                              <path d="M 210 280 Q 210 320 340 400" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_0.4s_linear_infinite] [animation-delay:0.3s]" opacity="0" style={{ animationFillMode: 'forwards' }} />
                          </>
                      )}
                  </svg>

                  {/* Results Overlay */}
                  {dataReceived && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 ${
                              activeMode === 'REST' ? 'bg-rose-900/50 border border-rose-500 text-rose-500' : 'bg-emerald-900/50 border border-emerald-500 text-emerald-500'
                          }`}>
                              {activeMode === 'REST' ? '🐢' : '⚡'}
                          </div>
                          <span className={`text-sm font-black uppercase tracking-widest mb-2 ${
                              activeMode === 'REST' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                              {activeMode === 'REST' ? 'Waterfall Complete' : 'Federation Complete'}
                          </span>
                          <span className="text-[10px] text-slate-300">
                              {activeMode === 'REST' ? 
                                  'The client executed 15 sequential HTTP requests, resulting in severe latency and blocking UI rendering.' : 
                                  'The client executed 1 GraphQL query. The Gateway aggregated the 3 microservices perfectly, delivering exact data with zero overfetching.'
                              }
                          </span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#100312] p-4 rounded-xl border border-pink-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-pink-400 uppercase block mb-1">Architecture Comparison:</span>
               Select <span className="text-rose-400 font-bold">Legacy REST APIs</span> and click Fetch. Notice how the Mobile Client must manually coordinate 15 individual, chaotic network requests directly to the microservices, causing a slow waterfall effect.<br/><br/>Now, select <span className="text-pink-400 font-bold">GraphQL Federation</span>. The Mobile Client sends exactly ONE query. The Apollo Gateway acts as a smart router, generating a query plan, firing parallel requests to the subgraphs, and compiling the unified JSON payload before sending it back.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -15; opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default GraphQLFederationArchitecture;
