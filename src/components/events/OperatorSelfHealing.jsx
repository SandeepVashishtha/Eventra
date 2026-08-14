/* eslint-disable */
import React, { useState, useEffect } from 'react';

const OperatorSelfHealing = () => {
  const [isOperatorEnabled, setIsOperatorEnabled] = useState(false);
  const [isFailing, setIsFailing] = useState(false);
  const [failoverComplete, setFailoverComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '03:00:00', type: 'SYS', msg: 'PostgreSQL cluster (Primary + Replica) running smoothly.' }
  ]);

  const executeCrash = () => {
      setIsFailing(true);
      setFailoverComplete(false);
      setActiveStep(1);
      
      addLog('CRIT', 'FATAL: PostgreSQL Primary Node crashed (Hardware Failure / Kernel Panic).');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('WARN', '[App Pods] Connection refused. Database unreachable.');
          
          setTimeout(() => {
              setActiveStep(3);
              
              if (isOperatorEnabled) {
                  addLog('SYS', '[K8s Operator] Liveness probe failed. Commencing automated failover protocol.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', '[K8s Operator] Step 1: Promoting Read-Replica to Primary (Master).');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('SYS', '[K8s Operator] Step 2: Re-writing internal DNS routes to new Primary.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              addLog('SYS', '[K8s Operator] Step 3: Spinning up new empty Pod to serve as Secondary Replica.');
                              
                              setTimeout(() => {
                                  setActiveStep(7);
                                  setIsFailing(false);
                                  setFailoverComplete(true);
                                  addLog('SUCCESS', 'Cluster self-healed in 14.2s. 100% automated. Zero SRE intervention required.');
                              }, 1500);
                          }, 1200);
                      }, 1200);
                  }, 1200);
                  
              } else {
                  // Legacy Manual SRE
                  addLog('CRIT', 'No automated failover detected. Eventra API is OFFLINE.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('WARN', '[PagerDuty] Firing Sev-1 alert to On-Call SRE (3:05 AM)...');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('SYS', '[SRE Human] Waking up, finding laptop, logging into VPN... (15 mins)');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              addLog('SYS', '[SRE Human] Manually executing psql promote scripts & updating DNS... (25 mins)');
                              
                              setTimeout(() => {
                                  setActiveStep(7);
                                  setIsFailing(false);
                                  setFailoverComplete(true);
                                  addLog('SUCCESS', 'Cluster recovered manually. Total Downtime: 48 minutes. Revenue impacted.');
                              }, 2000);
                          }, 2500);
                      }, 2000);
                  }, 1500);
              }
          }, 1500);
      }, 1500);
  };

  const toggleOperator = () => {
      const newState = !isOperatorEnabled;
      setIsOperatorEnabled(newState);
      setFailoverComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'Custom Kubernetes Operator deployed. Autonomous monitoring active.');
      } else {
          addLog('CRIT', 'Operator disabled. State management downgraded to manual SRE runbooks.');
      }
  };

  const resetDemo = () => {
      setIsFailing(false);
      setFailoverComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Hardware replaced. Cluster restored to pristine state.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    // Simulate night time for the scenario
    let hour = 3;
    let min = Math.floor(activeStep * 8); // Fake time progression for manual
    if(isOperatorEnabled) min = 0; // Fast for automated
    
    const timeStr = `0${hour}:${min.toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060309] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚙️</span> Site Reliability Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Self-Healing Kubernetes <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-orange-500 to-amber-500">Database Operator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Stateful applications like PostgreSQL databases are notoriously difficult to manage in Kubernetes. Standard deployments cannot handle complex leader-election and failover logic. When the Primary DB node crashes at 3 AM due to a kernel panic, the entire application goes down until a human SRE wakes up, logs in, and manually promotes a read-replica (costing ~45 minutes of downtime). Eventra solves this by deploying a custom Kubernetes Operator. The Operator continuously monitors the DB health. Upon crash detection, it autonomously executes the complex failover protocol—promoting the replica and updating DNS—achieving a self-healing cluster in under 15 seconds.
          </p>

          <div className="bg-[#110717] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Automation Configuration
               </h3>
               {failoverComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Cluster State</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Operator Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Failover Execution Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isOperatorEnabled ? 'Active: K8s Operator (Zero-Touch Self-Healing)' : 'Inactive: PagerDuty (Human SRE Manual Runbooks)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleOperator}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isOperatorEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isOperatorEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeCrash}
                     disabled={isFailing || failoverComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         failoverComplete ? 'bg-slate-800 text-orange-500 border-orange-900 cursor-not-allowed' :
                         isFailing ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                     }`}
                 >
                     {isFailing ? 'Simulating DB Kernel Panic...' : failoverComplete ? 'Incident Resolved' : "Simulate Primary DB Node Crash"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Kubernetes Controller Log</span>
                 {isFailing && <span className="text-orange-400 font-black animate-pulse">INCIDENT ONGOING...</span>}
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
                       log.type === 'SYS' ? 'text-indigo-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Stateful Cluster View</span>
                      <span className="text-xs text-white font-bold">PostgreSQL Architecture</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Operator Node */}
                  {isOperatorEnabled && (
                      <div className={`absolute top-4 right-4 w-32 border-2 rounded p-2 z-30 transition-colors shadow-lg ${
                          activeStep >= 3 && activeStep < 7 ? 'border-indigo-500 bg-indigo-950/80 animate-pulse' : 'border-slate-700 bg-slate-900/80'
                      } backdrop-blur-sm`}>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">⚙️ Custom K8s Operator</span>
                          <div className="text-[7px] text-slate-300 font-mono leading-tight">
                              {activeStep < 3 && "Watching StatefulSet..."}
                              {activeStep === 3 && "Probe Failed. Executing..."}
                              {activeStep === 4 && "Promoting Replica..."}
                              {activeStep === 5 && "Patching CoreDNS..."}
                              {activeStep === 6 && "Deploying New Secondary..."}
                              {activeStep >= 7 && "State Reconciled."}
                          </div>
                      </div>
                  )}

                  {/* App Pods */}
                  <div className="w-full h-16 border-2 border-slate-700 bg-slate-900 rounded-xl mb-12 relative z-20 flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Eventra API Pods</span>
                      <div className="flex gap-2">
                          {[1,2,3].map(i => (
                              <div key={i} className={`w-8 h-4 rounded border font-mono text-[6px] flex items-center justify-center font-bold transition-colors ${
                                  activeStep >= 2 && activeStep < 7 ? 'bg-red-950 border-red-500 text-red-500' : 'bg-emerald-950 border-emerald-500 text-emerald-500'
                              }`}>
                                  {activeStep >= 2 && activeStep < 7 ? '500 ERR' : '200 OK'}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Network Lines */}
                  {/* Main Line */}
                  <div className={`absolute top-[100px] w-1 transition-colors z-0 ${
                      activeStep >= 5 ? 'bottom-[25%] left-[70%] border-l-2 border-dashed border-emerald-500' : 'bottom-[25%] left-[30%] border-l-2 border-dashed border-emerald-500'
                  } ${activeStep >= 2 && activeStep < 5 ? 'border-red-500' : ''}`}></div>
                  
                  {/* Sync Line */}
                  <div className={`absolute bottom-[20%] left-[30%] right-[30%] h-1 border-t-2 border-dashed z-0 ${
                      activeStep >= 1 && activeStep < 7 ? 'border-red-500' : 'border-blue-500 opacity-50'
                  }`}></div>


                  <div className="w-full flex justify-between px-2 mt-auto mb-10 relative z-10 h-36">
                      
                      {/* Node A (Originally Primary) */}
                      <div className={`w-[45%] border-2 rounded-xl p-3 flex flex-col transition-all duration-500 ${
                          activeStep >= 1 ? 'border-red-500 bg-red-950/30 shadow-[0_0_30px_rgba(239,68,68,0.3)] translate-y-2' : 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      }`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                              <span className="flex items-center"><span className="mr-1 text-base">🐘</span> Node A</span>
                              <span className={`px-1 rounded text-[7px] ${activeStep >= 1 ? 'bg-red-900 text-red-400' : 'bg-emerald-900 text-emerald-400'}`}>
                                  {activeStep >= 1 ? 'CRASHED' : 'PRIMARY'}
                              </span>
                          </span>
                          <div className="bg-black/50 p-2 rounded border border-slate-800 flex-1 flex flex-col justify-center items-center font-mono text-[8px]">
                              {activeStep >= 1 ? (
                                  <div className="text-red-500 text-center animate-pulse font-bold">
                                      KERNEL PANIC<br/>(Exit Code 137)
                                  </div>
                              ) : (
                                  <div className="text-slate-400 text-center">
                                      <div className="text-emerald-400 mb-1">R/W Active</div>
                                      <div>Role: Master</div>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Node B (Originally Replica) */}
                      <div className={`w-[45%] border-2 rounded-xl p-3 flex flex-col transition-all duration-500 ${
                          activeStep >= 4 ? 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.4)] -translate-y-2' : 'border-blue-500 bg-blue-950/20'
                      }`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                              <span className="flex items-center"><span className="mr-1 text-base">🐘</span> Node B</span>
                              <span className={`px-1 rounded text-[7px] ${activeStep >= 4 ? 'bg-emerald-900 text-emerald-400' : 'bg-blue-900 text-blue-400'}`}>
                                  {activeStep >= 4 ? 'NEW PRIMARY' : 'REPLICA'}
                              </span>
                          </span>
                          <div className="bg-black/50 p-2 rounded border border-slate-800 flex-1 flex flex-col justify-center items-center font-mono text-[8px]">
                              {activeStep >= 4 ? (
                                  <div className="text-emerald-400 text-center font-bold animate-fade-in-up">
                                      Promoted to Master!<br/>R/W Active
                                  </div>
                              ) : (
                                  <div className="text-slate-400 text-center">
                                      <div className="text-blue-400 mb-1">Read-Only</div>
                                      <div>Role: Follower</div>
                                  </div>
                              )}
                          </div>
                      </div>

                  </div>
                  
                  {/* New Secondary Node (Appears in step 6) */}
                  {isOperatorEnabled && activeStep >= 6 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[40%] border-2 border-blue-500 bg-blue-950/20 rounded-xl p-2 z-10 animate-fade-in-up shadow-xl backdrop-blur">
                          <span className="text-[7px] font-bold uppercase tracking-widest text-white mb-1 flex items-center justify-between">
                              <span className="flex items-center">🐘 Node C (New)</span>
                              <span className="bg-blue-900 text-blue-400 px-1 rounded text-[6px]">SYNCING</span>
                          </span>
                      </div>
                  )}

                  {/* Overlays */}
                  {failoverComplete && !isOperatorEnabled && (
                      <div className="absolute inset-x-4 top-1/3 bg-slate-950/95 backdrop-blur-sm rounded-xl border border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">😴</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-red-500">45 Minutes Downtime</span>
                          <p className="text-[9px] text-slate-300 leading-relaxed font-mono">
                              The on-call engineer had to wake up, find their laptop, log in, diagnose the issue, run manual psql failover scripts, and update CoreDNS. Revenue lost during this window.
                          </p>
                      </div>
                  )}
                  
                  {failoverComplete && isOperatorEnabled && (
                      <div className="absolute inset-x-4 top-1/3 bg-emerald-950/95 backdrop-blur-sm rounded-xl border border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">⚡</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-emerald-400">14 Second Recovery</span>
                          <p className="text-[9px] text-emerald-200 leading-relaxed font-mono">
                              The K8s Operator instantly detected the crash, autonomously promoted Node B, rerouted internal DNS, and spun up a new replica (Node C). The SRE slept peacefully through the night.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#110717] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Autonomous Self-Healing:</span>
               With Operator OFF, click Simulate Crash. The primary DB node dies. The API pods instantly start throwing 500 errors. Because there is no automation, the platform stays dead until an SRE wakes up to a PagerDuty alarm and manually fixes the routing.<br/><br/>Toggle <span className="text-indigo-400 font-bold bg-slate-800 px-1 rounded">Execution Engine</span> ON. The custom K8s Operator is active. When the DB crashes, the operator's control loop triggers. It programmatically executes the exact steps the SRE would take—promoting the replica and updating DNS—healing the entire cluster in seconds without human intervention.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default OperatorSelfHealing;
