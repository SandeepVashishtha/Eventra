/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CSPReportingAutomation = () => {
  const [isCspEnabled, setIsCspEnabled] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackComplete, setAttackComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Frontend security layer initialized. Strict CSP enforced.' }
  ]);

  const executeAttack = () => {
      setIsAttacking(true);
      setAttackComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'Marketing team injected unapproved third-party tracking script via Google Tag Manager.');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('WARN', '[Browser] Attempting to load resource: https://sketchy-analytics.io/tracker.js');
          
          setTimeout(() => {
              setActiveStep(3);
              addLog('CRIT', '[CSP] Execution blocked! Domain not whitelisted in script-src directive.');
              
              if (isCspEnabled) {
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', '[Browser] Generating JSON CSP Violation Report...');
                      addLog('WARN', '[Network] POST /api/csp-report -> Eventra Ingest API');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('SYS', '[Logstash] Parsing violation payload. Pumping to Elasticsearch.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsAttacking(false);
                              setAttackComplete(true);
                              addLog('SUCCESS', '[Kibana] SOC Dashboard Alert Triggered: XSS / Unauthorized Script attempt detected in real-time.');
                          }, 1200);
                      }, 1200);
                  }, 1000);
                  
              } else {
                  // Legacy Silent Failure
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('WARN', '[Browser] Console Error thrown. Script fails silently in production.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsAttacking(false);
                          setAttackComplete(true);
                          addLog('CRIT', '[Observability] DevOps team is completely blind. Marketing complains tracking is broken, engineers cannot diagnose.');
                      }, 1500);
                  }, 1200);
              }
          }, 1500);
      }, 1000);
  };

  const toggleCsp = () => {
      const newState = !isCspEnabled;
      setIsCspEnabled(newState);
      setAttackComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'CSP Report-URI enabled. Telemetry pipeline to ELK stack active.');
      } else {
          addLog('CRIT', 'Telemetry disabled. Browser blocks will occur silently without observability.');
      }
  };

  const resetDemo = () => {
      setIsAttacking(false);
      setAttackComplete(false);
      setActiveStep(0);
      addLog('SYS', 'SOC Dashboard reset. Monitoring for strict CSP violations.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020605] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Frontend Security & Observability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            CSP Reporting Automation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500">ELK Stack Integration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Eventra utilizes strict Content Security Policies (CSP) to prevent catastrophic Cross-Site Scripting (XSS) attacks. However, when marketing accidentally injects an unapproved third-party analytics script via Tag Manager, the browser blocks it, but fails entirely silently. The DevOps team is blind, leading to days of confused debugging. Eventra solves this by implementing the `report-uri` directive. When the browser blocks an unauthorized script, it automatically generates a JSON violation report and POSTs it to the backend. This data is piped into an Elasticsearch/Kibana (ELK) stack, instantly triggering a real-time SOC dashboard alert.
          </p>

          <div className="bg-[#05110d] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Security Telemetry Configuration
               </h3>
               {attackComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Kibana Dashboard</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* CSP Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">CSP Response Header Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isCspEnabled ? 'Active: CSP + report-uri -> Elasticsearch' : 'Inactive: Basic CSP (Silent Local Blocking)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleCsp}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isCspEnabled ? 'bg-teal-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isCspEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeAttack}
                     disabled={isAttacking || attackComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         attackComplete ? 'bg-slate-800 text-teal-500 border-teal-900 cursor-not-allowed' :
                         isAttacking ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-red-900 hover:bg-red-800 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                     }`}
                 >
                     {isAttacking ? 'Injecting Malicious Script...' : attackComplete ? 'Simulation Completed' : "Simulate Unauthorized Script Injection"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Security Operations Center Log</span>
                 {isAttacking && <span className="text-teal-400 font-black animate-pulse">MONITORING...</span>}
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
                       log.type === 'SYS' ? 'text-teal-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Security Pipeline Visualizer</span>
                      <span className="text-xs text-white font-bold">Client Browser to Kibana SOC</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-between">
                  
                  {/* Client Browser Node */}
                  <div className={`w-64 border-2 rounded-xl p-4 relative z-10 transition-all duration-300 bg-slate-900 ${
                      activeStep >= 3 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-700'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-3 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">🌐</span> Client Browser (Chrome)</span>
                      </span>
                      
                      <div className="bg-black/50 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-400 flex flex-col gap-1">
                          {activeStep >= 2 ? (
                              <div className="flex flex-col">
                                  <span className="text-orange-400">Loading: sketchy-analytics.io/tracker.js</span>
                                  {activeStep >= 3 && (
                                      <span className="text-red-500 font-bold mt-1">❌ BLOCKED: Violates script-src 'self'</span>
                                  )}
                              </div>
                          ) : (
                              <span className="italic text-slate-600">DOM Loaded. Awaiting Script Injection.</span>
                          )}
                      </div>

                      {/* Outbound Telemetry Payload */}
                      {isCspEnabled && activeStep >= 4 && (
                          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 bg-teal-950/90 border border-teal-500 rounded p-2 z-30 animate-[moveDown_1s_linear_forwards] shadow-[0_0_15px_rgba(20,184,166,0.5)] flex flex-col">
                              <span className="text-[7px] font-bold text-teal-400 mb-1">POST /api/csp-report</span>
                              <div className="font-mono text-[6px] text-teal-200">
                                  {"{"}<br/>
                                  &nbsp;&nbsp;"csp-report": {"{"}<br/>
                                  &nbsp;&nbsp;&nbsp;&nbsp;"document-uri": "eventra.com/home",<br/>
                                  &nbsp;&nbsp;&nbsp;&nbsp;"violated-directive": "script-src",<br/>
                                  &nbsp;&nbsp;&nbsp;&nbsp;"blocked-uri": "sketchy-analytics.io"<br/>
                                  &nbsp;&nbsp;{"}"}<br/>
                                  {"}"}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Network Wire */}
                  <div className="flex-1 w-0.5 bg-slate-800 relative z-0">
                      {!isCspEnabled && activeStep >= 4 && (
                          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-2xl font-black text-slate-700 bg-slate-950 p-2">
                              Ø
                          </div>
                      )}
                  </div>

                  {/* ELK Stack / Kibana Node */}
                  <div className={`w-64 border-2 rounded-xl p-4 relative z-10 transition-all duration-500 ${
                      isCspEnabled && activeStep >= 6 ? 'border-teal-500 bg-teal-950/20 shadow-[0_0_30px_rgba(20,184,166,0.3)]' : 'border-slate-800 bg-slate-900'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">📊</span> ELK Stack (Kibana Dashboard)</span>
                      </span>
                      
                      <div className="bg-black/50 p-3 rounded border border-slate-800 flex flex-col justify-center font-mono text-[9px] text-slate-400 h-24 relative overflow-hidden">
                          {isCspEnabled && activeStep >= 6 ? (
                              <div className="flex flex-col animate-fade-in-up w-full h-full">
                                  <div className="flex justify-between items-center mb-2 border-b border-teal-900 pb-1">
                                      <span className="font-bold text-teal-400">Real-Time Alerts</span>
                                      <span className="bg-red-500 text-white font-bold px-1 rounded animate-pulse">1 NEW</span>
                                  </div>
                                  <div className="bg-red-950/50 border border-red-900 p-1.5 rounded text-red-400 flex flex-col leading-tight">
                                      <span className="font-bold">[ALERT] CSP Violation (XSS Attempt)</span>
                                      <span className="text-[7px]">Source: sketchy-analytics.io</span>
                                      <span className="text-[7px]">Path: /home</span>
                                  </div>
                              </div>
                          ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-slate-600 italic">No violations reported in last 24h.</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Custom Keyframes embedded for animation */}
                  <style>{`
                      @keyframes moveDown {
                          0% { transform: translate(-50%, -100%); opacity: 1; }
                          100% { transform: translate(-50%, 150px); opacity: 0; }
                      }
                  `}</style>

                  {/* Overlays */}
                  {attackComplete && !isCspEnabled && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-slate-700 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🙈</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">DevOps Blindspot</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-mono bg-slate-900/50 p-3 rounded border border-slate-700">
                              The browser successfully blocked the script, but threw a silent console error locally. The SOC team received zero telemetry. Marketing assumes the app is broken, and engineers have no logs to diagnose the issue.
                          </p>
                      </div>
                  )}
                  
                  {attackComplete && isCspEnabled && (
                      <div className="absolute inset-0 bg-teal-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-teal-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">👁️</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Total Observability</span>
                          <p className="text-[10px] text-teal-200 leading-relaxed bg-teal-900/50 p-3 rounded border border-teal-500">
                              The browser blocked the script and instantly fired a JSON payload to the report-uri endpoint. Logstash parsed the event, indexing it into Elasticsearch. The SOC team was alerted via Kibana in real-time, allowing immediate remediation.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#05110d] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">CSP Reporting Telemetry:</span>
               With CSP Report-URI OFF, click Simulate Injection. A malicious/unauthorized script tries to run. The browser's CSP blocks it, but the error happens purely locally on the user's laptop. Eventra receives zero analytics, resulting in a total observability blindspot.<br/><br/>Toggle <span className="text-teal-400 font-bold bg-slate-800 px-1 rounded">Response Header Engine</span> ON. The server injects the `report-uri` directive into the CSP header. Now, when the browser blocks the unauthorized domain, it autonomously POSTs a JSON diagnostic report back to Eventra. This hits the ELK Stack, lighting up the Kibana dashboard and alerting engineers instantly.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CSPReportingAutomation;
