/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DistributedTracingTelemetry = () => {
  const [isTracingEnabled, setIsTracingEnabled] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Microservice mesh active. 12 services running.' }
  ]);

  const executeRequest = () => {
      setIsExecuting(true);
      setExecutionComplete(false);
      setActiveStep(1);
      
      const traceId = isTracingEnabled ? 'trace-8f92a3b1' : 'none';
      
      addLog('ACTION', `Client initiated /checkout POST. (Trace-ID: ${traceId})`);
      
      setTimeout(() => {
          setActiveStep(2); // Auth
          if (!isTracingEnabled) addLog('SYS', '[auth-service] Validating token...');
          
          setTimeout(() => {
              setActiveStep(3); // Inventory (Bottleneck)
              if (!isTracingEnabled) addLog('SYS', '[inventory-service] Querying stock... [WARN: Slow query]');
              
              setTimeout(() => {
                  setActiveStep(4); // Payment
                  if (!isTracingEnabled) addLog('SYS', '[payment-service] Processing charge...');
                  
                  setTimeout(() => {
                      setActiveStep(5); // Complete
                      setIsExecuting(false);
                      setExecutionComplete(true);
                      
                      if (isTracingEnabled) {
                          addLog('SUCCESS', `OpenTelemetry Span exported to Jaeger. Trace ID: ${traceId}.`);
                          addLog('CRIT', 'Bottleneck identified: [inventory-service] took 7.5s.');
                      } else {
                          addLog('CRIT', 'API Gateway returned 504 Timeout after 8 seconds. Cause unknown.');
                      }
                  }, 800); // Simulated 0.4s
              }, 2500); // Simulated 7.5s (Visual compressed for demo)
          }, 600); // Simulated 0.1s
      }, 500);
  };

  const toggleTracing = () => {
      const newState = !isTracingEnabled;
      setIsTracingEnabled(newState);
      setExecutionComplete(false);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'OpenTelemetry SDK initialized. Propagating W3C Trace Context headers.');
      } else {
          addLog('CRIT', 'Distributed Tracing disabled. Logs are now chaotic and unlinked.');
      }
  };

  const resetDemo = () => {
      setIsExecuting(false);
      setExecutionComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Telemetry dashboard reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040306] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔎</span> Observability & DevOps
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Distributed Tracing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">API Bottleneck Identification</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a user's checkout takes 8 seconds and crashes, debugging is a nightmare because the backend consists of 12 different microservices (Auth, Inventory, Payment, etc). It's impossible to know which specific service caused the delay just by reading chaotic logs. Eventra solves this by implementing OpenTelemetry distributed tracing. A unique Trace ID is injected at the API Gateway and propagated through every microservice via HTTP headers. Engineers can then use Jaeger to visualize the exact waterfall timeline and instantly pinpoint the bottleneck.
          </p>

          <div className="bg-[#0b0612] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Telemetry Configuration
               </h3>
               {executionComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Clear Traces</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Tracing Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">OpenTelemetry (OTel) Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isTracingEnabled ? 'Active: Injecting W3C Trace-Context Headers' : 'Inactive: Siloed Microservice Logs'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleTracing}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isTracingEnabled ? 'bg-purple-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isTracingEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeRequest}
                     disabled={isExecuting || executionComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         executionComplete ? 'bg-slate-800 text-purple-500 border-purple-900 cursor-not-allowed' :
                         isExecuting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                     }`}
                 >
                     {isExecuting ? 'Processing /checkout API...' : executionComplete ? 'Trace Exported' : "Execute 8-Second Checkout"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Centralized Log Aggregator</span>
                 {isExecuting && <span className="text-purple-400 font-black animate-pulse">INGESTING...</span>}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Jaeger Trace Dashboard</span>
                      <span className="text-xs text-white font-bold">Trace-ID: {isTracingEnabled && activeStep >= 1 ? '8f92a3b1' : '<null>'}</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {isTracingEnabled ? (
                      // OTel Waterfall View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          
                          {/* Waterfall Timeline Header */}
                          <div className="flex justify-between text-[8px] font-mono text-slate-500 border-b border-slate-800 pb-2 mb-4 uppercase tracking-widest">
                              <span className="w-1/3">Service Span</span>
                              <div className="flex-1 flex justify-between">
                                  <span>0s</span>
                                  <span>4s</span>
                                  <span>8.0s</span>
                              </div>
                          </div>

                          {/* API Gateway Span */}
                          <div className={`mb-3 flex transition-opacity duration-300 ${activeStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                              <div className="w-1/3 pr-2 flex flex-col justify-center">
                                  <span className="text-[10px] font-bold text-white">api-gateway</span>
                                  <span className="text-[8px] text-slate-500 font-mono">POST /checkout</span>
                              </div>
                              <div className="flex-1 relative h-6 bg-slate-900 rounded">
                                  <div className={`absolute top-1 left-0 h-4 bg-indigo-500 rounded transition-all ease-linear ${activeStep >= 5 ? 'w-full' : activeStep >= 1 ? 'w-[10%] duration-[10000ms]' : 'w-0'}`}>
                                      <span className="absolute -right-10 top-0 text-[8px] font-mono text-indigo-400">8.0s</span>
                                  </div>
                              </div>
                          </div>

                          {/* Auth Service Span */}
                          <div className={`mb-3 flex transition-opacity duration-300 ${activeStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                              <div className="w-1/3 pr-2 pl-4 flex flex-col justify-center relative">
                                  <div className="absolute left-1 top-0 bottom-1/2 w-3 border-l border-b border-slate-700"></div>
                                  <span className="text-[10px] font-bold text-white">auth-svc</span>
                                  <span className="text-[8px] text-slate-500 font-mono">verify_jwt()</span>
                              </div>
                              <div className="flex-1 relative h-6 bg-slate-900 rounded">
                                  <div className="absolute top-1 left-0 w-[5%] h-4 bg-blue-500 rounded transition-all">
                                      <span className="absolute -right-10 top-0 text-[8px] font-mono text-blue-400">0.1s</span>
                                  </div>
                              </div>
                          </div>

                          {/* Inventory Service Span (Bottleneck) */}
                          <div className={`mb-3 flex transition-opacity duration-300 ${activeStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                              <div className="w-1/3 pr-2 pl-4 flex flex-col justify-center relative">
                                  <div className="absolute left-1 top-0 bottom-1/2 w-3 border-l border-b border-slate-700"></div>
                                  <span className="text-[10px] font-bold text-rose-400">inventory-svc</span>
                                  <span className="text-[8px] text-rose-500/70 font-mono">lock_ticket()</span>
                              </div>
                              <div className="flex-1 relative h-6 bg-slate-900 rounded">
                                  <div className={`absolute top-1 left-[5%] h-4 bg-rose-500 rounded shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all ease-linear ${activeStep >= 4 ? 'w-[90%]' : 'w-[10%] duration-[8000ms]'}`}>
                                      {activeStep >= 4 && <span className="absolute -right-10 top-0 text-[8px] font-mono text-rose-400 font-bold">7.5s</span>}
                                  </div>
                              </div>
                          </div>

                          {/* Payment Service Span */}
                          <div className={`mb-3 flex transition-opacity duration-300 ${activeStep >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                              <div className="w-1/3 pr-2 pl-4 flex flex-col justify-center relative">
                                  <div className="absolute left-1 top-0 bottom-1/2 w-3 border-l border-b border-slate-700"></div>
                                  <span className="text-[10px] font-bold text-white">payment-svc</span>
                                  <span className="text-[8px] text-slate-500 font-mono">stripe_charge()</span>
                              </div>
                              <div className="flex-1 relative h-6 bg-slate-900 rounded">
                                  <div className="absolute top-1 left-[95%] w-[5%] h-4 bg-emerald-500 rounded transition-all">
                                      <span className="absolute -right-10 top-0 text-[8px] font-mono text-emerald-400">0.4s</span>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Root Cause Analysis Banner */}
                          {activeStep >= 5 && (
                              <div className="mt-auto bg-rose-950/40 border border-rose-900 p-4 rounded-xl animate-fade-in-up">
                                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest block mb-2 flex items-center">
                                      <span className="mr-2">🚨</span> Root Cause Identified
                                  </span>
                                  <p className="text-[10px] text-rose-200 leading-relaxed font-mono">
                                      Trace <span className="font-bold text-white">8f92a3b1</span> reveals the <span className="font-bold text-white">inventory-svc</span> consumed 93% of the total request time (7.5s) during the `lock_ticket` database transaction.
                                  </p>
                              </div>
                          )}

                      </div>
                  ) : (
                      // Legacy Siloed Logs View
                      <div className="flex flex-col h-full items-center justify-center animate-fade-in-up p-4">
                          {activeStep >= 1 && !executionComplete ? (
                              <div className="flex flex-col items-center">
                                  <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Client Loading (8.0s)</span>
                              </div>
                          ) : executionComplete ? (
                              <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[8px] text-slate-500 flex flex-col space-y-2 opacity-60">
                                  <span className="text-white block border-b border-slate-800 pb-2 mb-2 font-sans font-bold text-[10px] uppercase tracking-widest text-center">Unlinked Log Nightmare</span>
                                  <span>[10:01:05] INFO [auth] Validating token for user 99...</span>
                                  <span>[10:01:09] INFO [billing] Stripe webhook received...</span>
                                  <span className="text-amber-500">[10:01:10] WARN [inventory] DB Lock timeout...</span>
                                  <span>[10:01:11] INFO [payment] Processing charge...</span>
                                  <span className="text-rose-500">[10:01:13] ERROR [api-gateway] 504 Gateway Timeout.</span>
                                  
                                  <div className="mt-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-400 text-center leading-relaxed font-sans text-[10px]">
                                      The client timed out. We have 5,000 logs from 12 services in this 8-second window. We have absolutely no idea which specific request caused the timeout because the logs share no common ID.
                                  </div>
                              </div>
                          ) : (
                              <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Awaiting Request...</span>
                          )}
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0612] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">Microservice Observability:</span>
               With OTel OFF, click Execute. The client spins for 8 seconds and crashes. You look at the chaotic, unlinked backend logs, and it is completely impossible to correlate which of the 12 microservices caused the timeout.<br/><br/>Toggle <span className="text-purple-400 font-bold bg-slate-800 px-1 rounded">OpenTelemetry Engine</span> ON. The API Gateway injects a `Trace-ID` header. The visualizer builds a Jaeger-style waterfall chart in real-time, instantly isolating the exact method (`lock_ticket` in `inventory-svc`) that blocked the 8-second request.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DistributedTracingTelemetry;
