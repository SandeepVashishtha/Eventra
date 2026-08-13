/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const SemanticLogAnalysisAIOps = () => {
  const [aiOpsEnabled, setAiOpsEnabled] = useState(false);
  const [anomalyInjected, setAnomalyInjected] = useState(false);
  const [systemCrashed, setSystemCrashed] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false);
  
  const [logStream, setLogStream] = useState([]);
  const logCounter = useRef(0);

  // Background normal log generator
  useEffect(() => {
      if (systemCrashed) return;

      const interval = setInterval(() => {
          logCounter.current += 1;
          const isError = anomalyInjected && Math.random() > 0.5;
          
          let newLog;
          if (isError) {
              // Anomalous logs
              const errorTypes = [
                  '{"level":"WARN","service":"PaymentDB","msg":"Query timeout exceeded 5000ms"}',
                  '{"level":"ERROR","service":"TicketingAPI","msg":"Connection pool exhausted"}',
                  '{"level":"WARN","service":"AuthService","msg":"High latency on redis.get(session)"}'
              ];
              newLog = {
                  id: logCounter.current,
                  type: 'ERROR',
                  msg: errorTypes[Math.floor(Math.random() * errorTypes.length)]
              };
          } else {
              // Normal logs
              const normalTypes = [
                  '{"level":"INFO","service":"Gateway","msg":"HTTP 200 GET /api/v1/schedule"}',
                  '{"level":"INFO","service":"Auth","msg":"JWT validated successfully"}',
                  '{"level":"DEBUG","service":"Inventory","msg":"Cache hit: event_id=42"}'
              ];
              newLog = {
                  id: logCounter.current,
                  type: 'NORMAL',
                  msg: normalTypes[Math.floor(Math.random() * normalTypes.length)]
              };
          }

          setLogStream(prev => [newLog, ...prev].slice(0, 15)); // Keep last 15 visible

      }, 300); // Fast log stream

      return () => clearInterval(interval);
  }, [anomalyInjected, systemCrashed]);

  const injectAnomaly = () => {
      setAnomalyInjected(true);
      setSystemCrashed(false);
      setAlertTriggered(false);
      
      // If AIOps is enabled, catch it early (e.g. after 3 seconds)
      if (aiOpsEnabled) {
          setTimeout(() => {
              setAlertTriggered(true);
              setAnomalyInjected(false); // Stop the anomaly because we caught it
          }, 2500);
      } else {
          // If AIOps is disabled, let it run until full crash (e.g. 6 seconds)
          setTimeout(() => {
              setSystemCrashed(true);
              setAnomalyInjected(false);
          }, 5000);
      }
  };

  const toggleAIOps = () => {
      const newState = !aiOpsEnabled;
      setAiOpsEnabled(newState);
      setAnomalyInjected(false);
      setSystemCrashed(false);
      setAlertTriggered(false);
      setLogStream([]);
  };
  
  const resetDemo = () => {
      setAnomalyInjected(false);
      setSystemCrashed(false);
      setAlertTriggered(false);
      setLogStream([]);
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> AIOps & Observability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Semantic Log Analysis <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Outage Prediction</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            DevOps engineers are overwhelmed by millions of raw log lines and often only discover a microservice is failing <i>after</i> users report that the app has crashed. Setting static threshold alerts produces too much noise and false positives. Eventra solves this by integrating an AIOps Machine Learning model (Isolation Forest) directly into the logging pipeline. It learns normal semantic patterns and preemptively clusters anomalous stack traces, alerting the SRE team before a minor latency issue cascades into a full system outage.
          </p>

          <div className="bg-[#070b12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Datadog / Splunk Simulator
               </h3>
               {(systemCrashed || alertTriggered) && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Cluster</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* AIOps Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">AIOps Machine Learning Model</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {aiOpsEnabled ? 'Active: Isolation Forest Semantic Clustering' : 'Inactive: Legacy Static Thresholds'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleAIOps}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             aiOpsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             aiOpsEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={injectAnomaly}
                     disabled={anomalyInjected || systemCrashed || alertTriggered}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         systemCrashed ? 'bg-rose-900/40 text-rose-500 border-rose-900 cursor-not-allowed' :
                         alertTriggered ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         anomalyInjected ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                     }`}
                 >
                     {anomalyInjected ? 'Anomaly Injected. Monitoring...' : 
                      systemCrashed ? 'Outage Occurred' : 
                      alertTriggered ? 'Preemptive Alert Fired' : 
                      'Inject DB Latency Anomaly'}
                 </button>

             </div>
             
             {/* SRE Status */}
             <div className={`h-28 rounded-xl border p-4 font-mono text-[10px] flex flex-col justify-center items-center transition-colors duration-500 ${
                 systemCrashed ? 'bg-rose-950/50 border-rose-500' :
                 alertTriggered ? 'bg-emerald-950/50 border-emerald-500' :
                 'bg-[#020305] border-slate-800 shadow-inner'
             }`}>
                 {systemCrashed ? (
                     <>
                        <span className="text-4xl mb-2">💥</span>
                        <span className="text-rose-400 font-bold uppercase tracking-widest text-center">Catastrophic System Outage<br/>(Detected too late)</span>
                     </>
                 ) : alertTriggered ? (
                     <>
                        <span className="text-4xl mb-2">🛡️</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-center">AIOps Preemptive Intercept<br/>(PagerDuty Alert Sent. Outage Prevented)</span>
                     </>
                 ) : anomalyInjected ? (
                     <span className="text-cyan-400 font-black animate-pulse text-lg uppercase tracking-widest">Ingesting Logs...</span>
                 ) : (
                     <span className="text-slate-500 uppercase font-bold tracking-widest">SRE Dashboard Normal</span>
                 )}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Log Aggregation Stream</span>
                      <span className="text-xs text-white font-bold">Firehose Live Tail</span>
                  </div>
              </div>

              <div className="flex-1 bg-black p-4 flex flex-col relative overflow-hidden font-mono text-[9px] leading-relaxed">
                  
                  {systemCrashed ? (
                       <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center z-20 animate-fade-in-up">
                           <div className="text-rose-500 text-6xl mb-4">503</div>
                           <span className="text-rose-400 font-bold uppercase tracking-widest">Service Unavailable</span>
                       </div>
                  ) : alertTriggered ? (
                       <div className="absolute inset-0 bg-emerald-950/90 z-20 p-6 flex flex-col animate-fade-in-up">
                           <div className="border-b border-emerald-500/30 pb-3 mb-4 flex items-center">
                               <span className="text-3xl mr-3">📟</span>
                               <div className="flex flex-col">
                                   <span className="text-emerald-400 font-black text-xs">PAGERDUTY HIGH URGENCY</span>
                                   <span className="text-emerald-200/50">Triggered by AIOps Isolation Forest</span>
                               </div>
                           </div>
                           <div className="bg-black/50 border border-emerald-900 p-3 rounded text-emerald-300">
                               <span className="block mb-2 font-bold">// ANOMALY CLUSTER DETECTED</span>
                               Semantic shift identified in `PaymentDB` and `TicketingAPI` logs. 
                               <br/><br/>
                               Velocity: +400% deviation from baseline.
                               <br/>
                               Forecast: Connection pool exhaustion predicted in 3.5 minutes.
                           </div>
                           <button className="mt-auto w-full bg-emerald-600 text-white font-bold py-2 rounded">
                               Acknowledge & Auto-Scale DB
                           </button>
                       </div>
                  ) : (
                      <div className="flex-1 flex flex-col justify-end space-y-1">
                          {logStream.map((log) => (
                              <div key={log.id} className={`p-1.5 rounded animate-fade-in-up ${
                                  log.type === 'ERROR' ? (aiOpsEnabled ? 'bg-rose-900/30 text-rose-400 border border-rose-500/30' : 'text-slate-400') : 'text-slate-500'
                              }`}>
                                  {log.msg}
                                  {aiOpsEnabled && log.type === 'ERROR' && (
                                      <span className="ml-2 px-1 py-0.5 bg-rose-600 text-white text-[7px] font-black rounded-sm">ML_FLAG</span>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Top Fade Gradient for Logs */}
                  {!systemCrashed && !alertTriggered && (
                      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"></div>
                  )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#070b12] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">AIOps Pattern Recognition:</span>
               With AIOps disabled, click <span className="text-white font-bold bg-slate-800 px-1 rounded">Inject Anomaly</span>. Watch the live tail. The latency warnings get buried in the noise. The SRE team doesn't notice until 5 seconds later when the entire system catastrophically crashes (503).<br/><br/>Now, toggle <span className="text-white font-bold bg-cyan-600 px-1 rounded">AIOps</span> ON and inject the anomaly. The ML model instantly semantically clusters the new warnings, flags them, and triggers a PagerDuty alert to auto-scale the DB <i>before</i> the crash can occur.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SemanticLogAnalysisAIOps;
