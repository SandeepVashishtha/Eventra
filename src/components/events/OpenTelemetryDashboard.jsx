/* eslint-disable */
import React, { useState, useEffect } from 'react';

const OpenTelemetryDashboard = () => {
  const [tracingActive, setTracingActive] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);
  
  // OTel Metrics
  const [totalSpans, setTotalSpans] = useState(84302); 
  const [p99Latency, setP99Latency] = useState(342); // ms
  const [errorRate, setErrorRate] = useState(0.01); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'OpenTelemetry Collector (OTLP) receiving span data.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Waiting for manual trace trigger.' }
  ]);

  // Waterfall Trace State
  const [traceState, setTraceState] = useState('IDLE'); // IDLE, RUNNING, SUCCESS, ERROR
  const [spans, setSpans] = useState([]);

  // Pre-defined trace scenarios
  const generateTrace = (scenario) => {
      setTracingActive(true);
      setTraceState('RUNNING');
      setSpans([]);
      addLog('ACTION', `Initiating distributed trace. Scenario: [${scenario.toUpperCase()}]`);
      
      const traceId = `tr-${Math.random().toString(36).substr(2, 9)}`;
      
      const timeline = scenario === 'success' ? [
          { name: 'API_Gateway', svc: 'Envoy', duration: 120, offset: 0, status: 'ok' },
          { name: 'Auth_Service', svc: 'Node.js', duration: 30, offset: 10, status: 'ok' },
          { name: 'User_DB_Query', svc: 'PostgreSQL', duration: 15, offset: 20, status: 'ok' },
          { name: 'Schedule_BFF', svc: 'GraphQL', duration: 80, offset: 40, status: 'ok' },
          { name: 'Redis_Cache_Hit', svc: 'Redis', duration: 5, offset: 50, status: 'ok' }
      ] : [
          { name: 'API_Gateway', svc: 'Envoy', duration: 2500, offset: 0, status: 'error' },
          { name: 'Auth_Service', svc: 'Node.js', duration: 40, offset: 10, status: 'ok' },
          { name: 'Schedule_BFF', svc: 'GraphQL', duration: 2450, offset: 50, status: 'error' },
          { name: 'Redis_Cache_Miss', svc: 'Redis', duration: 8, offset: 60, status: 'ok' },
          { name: 'Schedule_DB_Query', svc: 'MongoDB', duration: 2430, offset: 70, status: 'error_root' }
      ];

      // Stagger the visualization of spans
      timeline.forEach((span, i) => {
          setTimeout(() => {
              setSpans(prev => [...prev, span]);
              
              if (span.status === 'error_root') {
                  addLog('CRIT', `Trace [${traceId}] Failed: Timeout in ${span.svc} (${span.name})`);
                  setErrorRate(prev => Math.min(100, prev + 0.5));
              } else if (span.name === 'API_Gateway' && span.status === 'ok') {
                  addLog('SUCCESS', `Trace [${traceId}] Completed in ${span.duration}ms`);
                  setTotalSpans(prev => prev + timeline.length);
              }
              
              if (i === timeline.length - 1) {
                  setTimeout(() => {
                      setTraceState(scenario === 'success' ? 'SUCCESS' : 'ERROR');
                      setTracingActive(false);
                      if(scenario === 'error') setP99Latency(prev => prev + 120);
                  }, 500);
              }
          }, i * 300);
      });
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
            <span className="mr-2">📡</span> DevOps & Backend Observability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Distributed Tracing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">(OpenTelemetry)</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When the mobile app fails to load the schedule, engineers waste hours digging through raw text logs across 15 different microservices trying to find the bottleneck causing the 500 error. Eventra solves this by implementing OpenTelemetry across all backend Node.js microservices. This React dashboard visualizes distributed traces as a waterfall chart. When a request fails, engineers can instantly see exactly which microservice caused the latency or failure, drastically reducing Mean Time To Resolution (MTTR).
          </p>

          <div className="bg-[#0a0f1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> OTLP Collector Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={() => generateTrace('success')}
                   disabled={tracingActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     tracingActive ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-blue-900/40 border border-blue-500 text-blue-400 hover:bg-blue-800/60'
                   }`}
                 >
                   Trigger 200 OK
                 </button>
                 <button 
                   onClick={() => generateTrace('error')}
                   disabled={tracingActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     tracingActive ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-red-900/40 border border-red-500 text-red-400 hover:bg-red-800/60'
                   }`}
                 >
                   Trigger 500 Timeout
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Total Spans */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Spans Ingested
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 text-blue-400`}>
                     {(totalSpans / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>

               {/* P99 Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 p99Latency > 1000 ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   p99 Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     p99Latency > 1000 ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {p99Latency}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Error Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 errorRate > 1 ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Error Rate
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${errorRate > 1 ? 'text-red-400' : 'text-slate-300'}`}>
                         {errorRate.toFixed(2)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#03060c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Distributed Jaeger/Zipkin Log</span>
                 {tracingActive && <span className="text-indigo-400 font-black animate-pulse">TRACING REQUEST...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
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
            
            {/* Distributed Trace Waterfall Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                traceState === 'ERROR' ? 'bg-[#14080b] border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]' : 'bg-[#060a14] border-[#1e293b]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">DISTRIBUTED TRACE WATERFALL</span>
                <span className={`text-[8px] font-mono ${traceState === 'ERROR' ? 'text-red-500 animate-pulse' : traceState === 'SUCCESS' ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {traceState === 'ERROR' ? '❌ 500 INTERNAL_ERROR' : traceState === 'SUCCESS' ? '✅ 200 OK' : 'AWAITING TRACE'}
                </span>
              </div>

              <div className="flex-1 flex flex-col pt-16 px-4 pb-4">
                  
                  {traceState === 'IDLE' ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                          <span className="text-5xl mb-4 grayscale">📊</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-center">Click Trigger to generate<br/>Waterfall Trace</span>
                      </div>
                  ) : (
                      <div className="flex-1 relative">
                          {/* Time scale guide */}
                          <div className="absolute inset-y-0 left-0 w-full border-l border-r border-slate-800/50 pointer-events-none flex justify-between">
                              <div className="h-full border-r border-slate-800/30"></div>
                              <div className="h-full border-r border-slate-800/30"></div>
                              <div className="h-full border-r border-slate-800/30"></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-600 font-mono mb-2 border-b border-slate-800/50 pb-1">
                              <span>0ms</span>
                              <span>{spans[0]?.duration > 1000 ? '2500ms' : '150ms'}</span>
                          </div>

                          {/* Spans */}
                          <div className="space-y-4 relative mt-4">
                              {spans.map((span, index) => {
                                  // Calculate width based on total duration
                                  const totalTime = spans[0]?.duration || 100;
                                  const widthPercent = Math.max(5, (span.duration / totalTime) * 100);
                                  const leftOffset = (span.offset / 100) * 80; // Keep it within bounds

                                  return (
                                      <div key={index} className="relative animate-fade-in-up">
                                          <div className="flex justify-between items-baseline mb-1">
                                              <span className={`text-[9px] font-bold font-mono ${span.status === 'error_root' ? 'text-red-400' : 'text-slate-300'}`}>
                                                  {span.name}
                                              </span>
                                              <span className={`text-[8px] font-mono ${span.status === 'error_root' ? 'text-red-500 font-black' : 'text-slate-500'}`}>
                                                  {span.duration}ms
                                              </span>
                                          </div>
                                          <div className="w-full bg-slate-900 h-3 rounded overflow-hidden flex relative group">
                                              <div 
                                                  className={`h-full rounded relative transition-all duration-500 ${
                                                      span.status === 'error_root' ? 'bg-red-500' : 
                                                      span.status === 'error' ? 'bg-rose-900/50 border border-red-900/50' : 
                                                      'bg-blue-500'
                                                  }`}
                                                  style={{ width: `${widthPercent}%`, marginLeft: `${leftOffset}%` }}
                                              >
                                                  {/* Inner service label on hover or if wide enough */}
                                                  {widthPercent > 20 && (
                                                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black uppercase text-white/70">
                                                          {span.svc}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                          
                                          {/* Error Tooltip/Indicator */}
                                          {span.status === 'error_root' && (
                                              <div className="absolute top-8 left-0 w-full bg-red-950/80 border border-red-900 p-2 rounded mt-1 z-10 backdrop-blur-md">
                                                  <span className="text-[8px] text-red-300 font-mono block">FATAL EXCEPTION: Timeout waiting for MongoDB connection. Connection pool exhausted.</span>
                                              </div>
                                          )}
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}
                
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a0f1c] p-4 rounded-xl border border-slate-800 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Observability Insight:</span>
               Without OpenTelemetry, the 500 error simply shows up in the API Gateway logs. By viewing the Waterfall trace, engineers can see the exact propagation path and identify that the <span className="text-red-400 font-bold">MongoDB Database</span> is the actual root cause of the latency.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default OpenTelemetryDashboard;
