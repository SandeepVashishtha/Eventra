/* eslint-disable */
import React, { useState, useEffect } from 'react';

const IstioServiceMesh = () => {
  const [isMeshEnabled, setIsMeshEnabled] = useState(false);
  const [isSpike, setIsSpike] = useState(false);
  const [spikeComplete, setSpikeComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Kubernetes cluster running. Awaiting high-traffic event.' }
  ]);

  const executeSpike = () => {
      setIsSpike(true);
      setSpikeComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'TICKET DROP: 100,000 users concurrently hitting /checkout endpoint.');
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isMeshEnabled) {
              addLog('SYS', '[Envoy Proxy] Inbound traffic: 100,000 req/sec.');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('WARN', '[Istio Sidecar] Threshold exceeded (500 connections). Circuit Breaker tripped!');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', 'Traffic Shaping: Routing 99,500 overflow requests to Static Queue Pod.');
                      addLog('SYS', 'Checkout Pod processing 500 requests successfully.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsSpike(false);
                          setSpikeComplete(true);
                          addLog('SUCCESS', 'Cluster survived ticket drop. Database remained under 30% load.');
                      }, 1500);
                  }, 1200);
              }, 1000);
              
          } else {
              // Legacy Node.js
              addLog('WARN', '[K8s Ingress] Routing 100,000 req/sec directly to Checkout Pod.');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('CRIT', '[Checkout Pod] V8 Heap Out of Memory. Node.js process crashed (OOMKilled).');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('CRIT', '[Database] Too many connections (Error 1040). PostgreSQL crashed.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsSpike(false);
                          setSpikeComplete(true);
                          addLog('CRIT', 'CASCADING FAILURE: Entire Kubernetes cluster offline. Revenue lost.');
                      }, 1500);
                  }, 1200);
              }, 1200);
          }
      }, 1000);
  };

  const toggleMesh = () => {
      const newState = !isMeshEnabled;
      setIsMeshEnabled(newState);
      setSpikeComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'Istio Service Mesh deployed. Envoy sidecars injected into all pods.');
      } else {
          addLog('CRIT', 'Istio removed. Services exposed directly to raw ingress traffic.');
      }
  };

  const resetDemo = () => {
      setIsSpike(false);
      setSpikeComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Kubernetes cluster scaled up and reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚢</span> DevOps & Kubernetes Resilience
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Istio Service Mesh <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500">Intelligent Traffic Shaping</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During major festival ticket drops, 100,000+ users hit the checkout microservice concurrently. Without architectural protections, this immediately exhausts Node.js threads and database connection pools, causing a cascading failure that takes the entire cluster offline. Writing custom queuing logic into the application adds messy technical debt. Eventra solves this by deploying Istio as a Service Mesh. Envoy proxies (Sidecars) handle all network routing transparently. If the checkout service exceeds 500 connections, Istio automatically trips a Circuit Breaker and shapes the overflow traffic to a static "Queue" waiting room, protecting the database without altering a single line of application code.
          </p>

          <div className="bg-[#060c14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Cluster Configuration
               </h3>
               {spikeComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Cluster State</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Istio Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Network Routing Architecture</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isMeshEnabled ? 'Active: Istio Envoy Proxies & Circuit Breakers' : 'Inactive: Direct K8s Ingress (No Limits)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleMesh}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isMeshEnabled ? 'bg-blue-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isMeshEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeSpike}
                     disabled={isSpike || spikeComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         spikeComplete ? 'bg-slate-800 text-blue-500 border-blue-900 cursor-not-allowed' :
                         isSpike ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                     }`}
                 >
                     {isSpike ? 'Simulating 100k Concurrent Users...' : spikeComplete ? 'Simulation Completed' : "Simulate Ticket Drop Spike"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Kubernetes Event Log</span>
                 {isSpike && <span className="text-blue-400 font-black animate-pulse">MONITORING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Service Mesh Topology</span>
                      <span className="text-xs text-white font-bold">K8s Cluster Real-Time View</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-between">
                  
                  {/* Incoming Traffic */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 flex flex-col items-center justify-end z-20 pb-2">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Public Internet</span>
                      {activeStep >= 1 && (
                          <div className="bg-rose-950/80 text-rose-400 font-mono text-[8px] font-bold px-2 py-0.5 rounded border border-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                              +100,000 REQ/SEC
                          </div>
                      )}
                  </div>

                  {/* K8s Ingress / Gateway Node */}
                  <div className={`w-64 border-2 rounded-xl p-3 mt-14 relative z-20 transition-all duration-300 bg-slate-900 ${
                      isMeshEnabled ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-700'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">🚪</span> {isMeshEnabled ? 'Istio IngressGateway' : 'Nginx Ingress'}</span>
                      </span>
                  </div>

                  {/* Routing Lines */}
                  {/* Line to Checkout Service */}
                  <div className={`absolute top-28 bottom-[45%] left-1/2 -translate-x-1/2 w-1 transition-colors duration-300 z-0 ${
                      activeStep >= 2 && !isMeshEnabled ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-slate-800'
                  }`}>
                      {activeStep >= 2 && (
                          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                      )}
                  </div>

                  {/* Istio Shape Line to Queue */}
                  {isMeshEnabled && (
                      <div className="absolute top-[30%] left-[20%] right-1/2 h-20 border-t-2 border-l-2 border-cyan-500 rounded-tl-2xl z-0 shadow-[-5px_-5px_15px_rgba(6,182,212,0.1)]">
                          {activeStep >= 4 && (
                              <div className="absolute top-1/2 left-0 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                          )}
                      </div>
                  )}

                  <div className="w-full flex justify-between px-2 mt-auto mb-auto relative z-10 h-32">
                      
                      {/* Waiting Room Pod (Only used in Istio) */}
                      <div className={`w-[45%] border-2 rounded-xl p-3 flex flex-col transition-all duration-500 ${
                          isMeshEnabled ? (activeStep >= 4 ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-700 bg-slate-900') : 'opacity-20 border-slate-800 grayscale'
                      }`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center">
                              <span className="mr-1 text-base">⏳</span> Queue Service
                          </span>
                          <div className="bg-black/50 p-2 rounded border border-slate-800 flex-1 flex flex-col justify-center items-center font-mono text-[8px]">
                              {activeStep >= 4 && isMeshEnabled ? (
                                  <div className="text-cyan-400 text-center animate-fade-in-up">
                                      <div className="text-[10px] font-bold mb-1">99,500 Users</div>
                                      <div>Static HTML View</div>
                                      <div>No DB connection.</div>
                                  </div>
                              ) : (
                                  <span className="text-slate-600">Idle (0 Users)</span>
                              )}
                          </div>
                      </div>

                      {/* Checkout Service Pod */}
                      <div className={`w-[45%] border-2 rounded-xl p-2 flex flex-col transition-all duration-500 ${
                          !isMeshEnabled && activeStep >= 3 ? 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-slate-700 bg-slate-900'
                      }`}>
                          {/* Envoy Sidecar Overlay */}
                          {isMeshEnabled && (
                              <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 bg-slate-900 flex items-center justify-center text-[10px] z-30 transition-colors ${
                                  activeStep >= 3 ? 'border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse' : 'border-slate-600 text-slate-500'
                              }`}>
                                  Envoy
                              </div>
                          )}

                          <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-1 flex items-center justify-between">
                              <span className="flex items-center"><span className="mr-1 text-base">🛒</span> Checkout API</span>
                          </span>
                          
                          <div className="bg-black/50 p-1.5 rounded border border-slate-800 flex-1 flex flex-col relative font-mono text-[8px] overflow-hidden">
                              {/* CPU Bar */}
                              <div className="w-full h-1 bg-slate-800 rounded mb-1 overflow-hidden">
                                  <div className={`h-full transition-all duration-500 ${
                                      !isMeshEnabled && activeStep >= 2 ? 'bg-red-500 w-[100%]' : 
                                      isMeshEnabled && activeStep >= 2 ? 'bg-amber-500 w-[85%]' : 'bg-emerald-500 w-[10%]'
                                  }`}></div>
                              </div>
                              
                              <div className="flex justify-between mb-1">
                                  <span className="text-slate-500">Conn:</span>
                                  <span className={!isMeshEnabled && activeStep >= 2 ? 'text-red-500 font-bold' : isMeshEnabled && activeStep >= 2 ? 'text-amber-500' : 'text-emerald-500'}>
                                      {!isMeshEnabled && activeStep >= 2 ? '100,000' : isMeshEnabled && activeStep >= 2 ? '500 (Max)' : '12'}
                                  </span>
                              </div>

                              {activeStep >= 3 && !isMeshEnabled && (
                                  <div className="absolute inset-0 bg-red-950 flex items-center justify-center border border-red-500 z-10">
                                      <span className="text-red-400 font-bold text-[7px] text-center">OOMKilled<br/>(CrashLoopBackOff)</span>
                                  </div>
                              )}
                              
                              {activeStep >= 3 && isMeshEnabled && (
                                  <div className="absolute top-0 right-0 bg-cyan-950/80 border-b border-l border-cyan-500 text-cyan-400 text-[6px] font-bold px-1 rounded-bl z-20">
                                      BREAKER TRIPPED
                                  </div>
                              )}
                          </div>
                      </div>

                  </div>

                  {/* Line to Database */}
                  <div className={`absolute bottom-28 top-[75%] right-[22%] w-1 transition-colors duration-300 z-0 ${
                      activeStep >= 4 && !isMeshEnabled ? 'bg-red-500' : 'bg-slate-800'
                  }`}></div>

                  {/* Database Node */}
                  <div className={`w-48 border-2 rounded-xl p-3 mt-auto relative z-10 transition-all duration-500 ml-auto mr-4 ${
                      !isMeshEnabled && activeStep >= 4 ? 'border-red-500 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-slate-700 bg-slate-900'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">🗄️</span> PostgreSQL Master</span>
                      </span>
                      
                      <div className="bg-black/50 p-2 rounded border border-slate-800 flex items-center justify-center font-mono text-[8px] text-slate-400">
                          {activeStep >= 4 && !isMeshEnabled ? (
                              <div className="text-red-500 font-bold text-center animate-pulse">
                                  FATAL: Error 1040<br/>Too many connections
                              </div>
                          ) : (
                              <div className="flex w-full justify-between">
                                  <span>Status:</span>
                                  <span className="text-emerald-400 font-bold">HEALTHY</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Overlays */}
                  {spikeComplete && !isMeshEnabled && (
                      <div className="absolute inset-0 bg-red-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🚨</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Cascading Failure</span>
                          <p className="text-[10px] text-red-200 leading-relaxed font-mono bg-red-900/50 p-3 rounded border border-red-500">
                              Without a Service Mesh, 100,000 concurrent users bypassed the API Gateway directly to the Checkout Pod. The Node.js Event Loop crashed, bringing down the DB. Entire platform offline.
                          </p>
                      </div>
                  )}
                  
                  {spikeComplete && isMeshEnabled && (
                      <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🛡️</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Cluster Protected</span>
                          <p className="text-[10px] text-emerald-200 leading-relaxed bg-emerald-900/50 p-3 rounded border border-emerald-500">
                              Istio Envoy Proxy intercepted the spike. When connections hit 500, the Circuit Breaker tripped instantly. 99,500 users were transparently routed to a static Waiting Room queue. DB remained perfectly stable.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#060c14] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Traffic Shaping via Envoy:</span>
               With Istio OFF, click Simulate Spike. Massive unthrottled traffic slams directly into the application pods. They run out of memory (OOMKilled), and exhaust all database connections, crashing the entire Kubernetes cluster.<br/><br/>Toggle <span className="text-blue-400 font-bold bg-slate-800 px-1 rounded">Network Architecture</span> ON. Eventra now uses Istio Envoy sidecars. During the spike, the proxy at the network layer detects the overload. Without altering any Node.js code, the proxy dynamically shapes overflow traffic to a lightweight HTML queue, saving the core infrastructure.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default IstioServiceMesh;
