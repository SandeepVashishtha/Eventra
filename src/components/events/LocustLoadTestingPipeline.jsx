/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const LocustLoadTestingPipeline = () => {
  const [isQaEnabled, setIsQaEnabled] = useState(false);
  const [isOptimizedCode, setIsOptimizedCode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [prStatus, setPrStatus] = useState(null); // null, 'FAIL', 'PASS', 'MERGED_UNTESTED'
  
  const [simUsers, setSimUsers] = useState(0);
  const [p95Latency, setP95Latency] = useState(0);
  const loadIntervalRef = useRef(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'CI/CD Pipeline idle. Waiting for developer commits.' }
  ]);

  useEffect(() => {
      if (isRunning && isQaEnabled) {
          loadIntervalRef.current = setInterval(() => {
              setSimUsers(prev => {
                  const nextUsers = prev + 1500;
                  if (nextUsers >= 10000) return 10000;
                  return nextUsers;
              });
              
              setP95Latency(prev => {
                  if (isOptimizedCode) {
                      return Math.min(prev + (Math.random() * 20), 140); // Max ~140ms
                  } else {
                      return prev + 350 + (Math.random() * 200); // Spikes heavily > 2000ms
                  }
              });
          }, 300);
      }
      
      return () => {
          if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
      };
  }, [isRunning, isQaEnabled, isOptimizedCode]);

  const triggerPipeline = () => {
      setIsRunning(true);
      setPrStatus(null);
      setSimUsers(0);
      setP95Latency(25);
      
      const commitMsg = isOptimizedCode 
          ? 'feat: add compound redis index for checkout flow' 
          : 'feat: add nested SQL joins for ticket lookup (unoptimized)';
          
      addLog('ACTION', `Developer pushed commit: "${commitMsg}"`);
      
      setTimeout(() => {
          if (isQaEnabled) {
              addLog('SYS', 'GitHub Action triggered: Booting ephemeral staging environment...');
              
              setTimeout(() => {
                  addLog('WARN', 'Initializing distributed Locust Python Swarm (Target: 10k concurrent users)');
                  
                  setTimeout(() => {
                      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
                      setIsRunning(false);
                      
                      if (isOptimizedCode) {
                          setPrStatus('PASS');
                          addLog('SUCCESS', 'Locust Load Test Complete. P95 Latency: 135ms. (Target < 500ms).');
                          addLog('SYS', 'Quality Gate passed. Pull Request unlocked for merge.');
                      } else {
                          setPrStatus('FAIL');
                          addLog('CRIT', 'Locust Load Test Complete. P95 Latency: 2,450ms. (Target < 500ms).');
                          addLog('CRIT', 'Quality Gate failed. Performance regression detected. Merge blocked.');
                      }
                  }, 3000);
              }, 1000);
              
          } else {
              // Legacy Pipeline - No Load Testing
              addLog('WARN', 'Skipping load tests. Running basic unit tests only...');
              
              setTimeout(() => {
                  addLog('SUCCESS', 'Unit tests passed in 5 seconds.');
                  setIsRunning(false);
                  setPrStatus('MERGED_UNTESTED');
                  addLog('WARN', 'Code merged to production. Praying it scales during ticket drop.');
                  
                  if (!isOptimizedCode) {
                      setTimeout(() => {
                          addLog('CRIT', 'TICKET DROP LIVE: 50,000 users hit checkout endpoint. Production DB crashed! Total outage.');
                      }, 1500);
                  } else {
                      setTimeout(() => {
                          addLog('SUCCESS', 'TICKET DROP LIVE: Servers survived by pure luck.');
                      }, 1500);
                  }
              }, 1000);
          }
      }, 1000);
  };
  
  const toggleQA = () => {
      const newState = !isQaEnabled;
      setIsQaEnabled(newState);
      setPrStatus(null);
      if (newState) {
          addLog('SUCCESS', 'Locust Load Testing added to GitHub Actions yaml.');
      } else {
          addLog('CRIT', 'Locust Load Testing removed from CI pipeline.');
      }
  };

  const toggleCodeQuality = () => {
      setIsOptimizedCode(!isOptimizedCode);
      setPrStatus(null);
  };

  const resetDemo = () => {
      setIsRunning(false);
      setPrStatus(null);
      setSimUsers(0);
      setP95Latency(0);
      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
      addLog('SYS', 'Pipeline reset. Awaiting next commit.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦗</span> QA Automation & CI/CD
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Load Testing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-500 to-cyan-500">Locust CI/CD Pipeline</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The ticketing API works perfectly in local development environments but frequently crashes when 50,000 real people hit the server simultaneously during a ticket on-sale drop. Eventra solves this by integrating a distributed Locust (Python) load testing suite directly into the CI/CD pipeline. Before any code is allowed to merge to `main`, the CI runner spins up 10,000 simulated concurrent users that aggressively hit the new code, automatically blocking the PR if the API's P95 latency exceeds 500ms.
          </p>

          <div className="bg-[#080b12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> CI/CD Workflow Rules
               </h3>
               {prStatus !== null && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Pipeline</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* QA Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-4">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">CI Quality Gate: Load Testing</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isQaEnabled ? 'Active: Locust Distributed Swarm (10k Users)' : 'Inactive: Basic Unit Tests Only'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleQA}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isQaEnabled ? 'bg-blue-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isQaEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 {/* Code Quality Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Developer's Code Quality</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isOptimizedCode ? 'Optimized: O(1) Redis Lookup' : 'Unoptimized: Nested O(N^2) SQL Joins'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleCodeQuality}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isOptimizedCode ? 'bg-emerald-500' : 'bg-rose-500'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isOptimizedCode ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={triggerPipeline}
                     disabled={isRunning || prStatus !== null}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         prStatus === 'FAIL' || (prStatus === 'MERGED_UNTESTED' && !isOptimizedCode) ? 'bg-rose-900/40 text-rose-500 border-rose-900 cursor-not-allowed' :
                         prStatus === 'PASS' || (prStatus === 'MERGED_UNTESTED' && isOptimizedCode) ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isRunning ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                     }`}
                 >
                     {isRunning ? 'Running CI/CD Pipeline...' : prStatus !== null ? 'Workflow Complete' : "Push Commit to Branch"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>GitHub Actions Runner</span>
                 {isRunning && <span className="text-blue-400 font-black animate-pulse">EXECUTING...</span>}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Locust Dashboard</span>
                      <span className="text-xs text-white font-bold">Distributed Load Simulator</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {isQaEnabled ? (
                      // Locust Dashboard View
                      <div className="flex flex-col h-full">
                          
                          {/* Locust Header */}
                          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 mb-6">
                              <div className="flex items-center">
                                  <span className="text-2xl mr-3">🦗</span>
                                  <div className="flex flex-col">
                                      <span className="text-white font-bold text-sm leading-tight">Locust Test Suite</span>
                                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Staging Environment</span>
                                  </div>
                              </div>
                              <div className="text-right flex flex-col">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Simulated Users</span>
                                  <span className="text-lg font-mono font-black text-amber-400">{simUsers.toLocaleString()}</span>
                              </div>
                          </div>

                          {/* Latency Graph Area */}
                          <div className={`flex-1 border-2 rounded-xl flex flex-col p-4 relative overflow-hidden transition-colors duration-500 ${
                              p95Latency > 500 ? 'border-rose-900 bg-rose-950/20' : 'border-slate-800 bg-slate-900'
                          }`}>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">P95 Response Latency (Threshold: 500ms)</span>
                              
                              <div className="flex-1 relative flex items-end justify-center pb-8">
                                  {/* Target Threshold Line */}
                                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-600 z-10 flex items-center justify-end">
                                      <span className="text-[8px] font-mono text-slate-500 -mt-4 bg-slate-900 px-1">500ms limit</span>
                                  </div>
                                  
                                  <div className="text-center z-20">
                                      <span className={`text-6xl font-black font-mono transition-colors duration-300 ${
                                          p95Latency > 500 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'text-emerald-400'
                                      }`}>{Math.floor(p95Latency)}<span className="text-2xl text-slate-500 ml-1">ms</span></span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      // Legacy View - No locust
                      <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-2xl mb-4 text-slate-500">
                              💤
                          </div>
                          <span className="text-white font-bold mb-2">Load Testing Disabled</span>
                          <span className="text-[10px] text-slate-500 leading-relaxed">
                              The CI pipeline will only run basic functional unit tests. It will not simulate concurrency or traffic volume.
                          </span>
                      </div>
                  )}

                  {/* Overlays */}
                  {prStatus === 'FAIL' && (
                      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col overflow-hidden animate-fade-in-up border-4 border-rose-900 rounded-[1rem]">
                          <div className="p-4 border-b border-slate-800 bg-rose-950/30 flex items-center">
                              <span className="text-2xl mr-3">🛑</span>
                              <div className="flex flex-col">
                                  <span className="text-white font-bold">Merge Blocked by QA</span>
                                  <span className="text-[10px] text-rose-400 font-mono">Performance Regression Detected</span>
                              </div>
                          </div>
                          <div className="p-6 flex flex-col">
                              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                                  Your code works fine for 1 user, but the <span className="font-bold text-white">Locust Swarm</span> discovered that it scales at O(N^2). Under the simulated load of 10,000 users, P95 latency spiked to <span className="font-bold text-rose-500">2,450ms</span>, exceeding the 500ms threshold.
                              </p>
                              <p className="text-[10px] text-slate-400 mb-4">
                                  This code would have melted production. Please optimize your database queries and try again.
                              </p>
                          </div>
                      </div>
                  )}
                  
                  {prStatus === 'PASS' && (
                      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col overflow-hidden animate-fade-in-up border-4 border-emerald-900 rounded-[1rem]">
                          <div className="p-4 border-b border-slate-800 bg-emerald-950/30 flex items-center">
                              <span className="text-2xl mr-3">✅</span>
                              <div className="flex flex-col">
                                  <span className="text-white font-bold">Checks Passed</span>
                                  <span className="text-[10px] text-emerald-400 font-mono">Ready for Production</span>
                              </div>
                          </div>
                          <div className="p-6 flex flex-col">
                              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                                  The <span className="font-bold text-white">Locust Swarm</span> blasted your code with 10,000 concurrent users. The O(1) Redis implementation held strong.
                              </p>
                              <div className="bg-slate-950 border border-slate-800 p-3 rounded font-mono text-[9px] text-slate-400 mb-4 space-y-1">
                                  <div className="flex justify-between"><span>Max Users:</span> <span className="text-white">10,000</span></div>
                                  <div className="flex justify-between"><span>P95 Latency:</span> <span className="text-emerald-400">135ms</span></div>
                                  <div className="flex justify-between"><span>Errors:</span> <span className="text-white">0.00%</span></div>
                              </div>
                          </div>
                      </div>
                  )}
                  
                  {prStatus === 'MERGED_UNTESTED' && !isOptimizedCode && (
                      <div className="absolute inset-0 bg-rose-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-fade-in-up rounded-[1rem]">
                          <span className="text-6xl mb-4">🔥</span>
                          <span className="text-white font-black text-xl mb-2">Production Outage</span>
                          <span className="text-[10px] text-rose-200 leading-relaxed">
                              Unoptimized code was merged without load testing. When the ticket drop happened, 50,000 users hit the O(N^2) SQL query, instantly crashing the database cluster.
                          </span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#080b12] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Pre-Production Load Gates:</span>
               Set Code Quality to <span className="text-rose-400 font-bold">Unoptimized</span> and Load Testing OFF. The bad code merges, and production melts down on ticket day.<br/><br/>Toggle <span className="text-blue-400 font-bold bg-slate-800 px-1 rounded">QA Load Testing</span> ON. When you push the bad code, the CI server automatically spins up 10,000 Locust bots. The bots immediately expose the bad SQL query, identifying a 2.4s latency spike, and automatically block the PR *before* it can destroy production.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default LocustLoadTestingPipeline;
