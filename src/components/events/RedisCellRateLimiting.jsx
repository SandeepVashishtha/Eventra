/* eslint-disable */
import React, { useState, useEffect } from 'react';

const RedisCellRateLimiting = () => {
  const [isGcraEnabled, setIsGcraEnabled] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackComplete, setAttackComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Simulation stats
  const [clock, setClock] = useState('11:59:57');
  const [serverLoad, setServerLoad] = useState(0);
  const [blockedRequests, setBlockedRequests] = useState(0);
  const [allowedRequests, setAllowedRequests] = useState(0);

  const [sysLog, setSysLog] = useState([
    { id: 1, time: '11:59:50', type: 'SYS', msg: 'API Gateway Rate Limiter active. Limit: 100 req/min.' }
  ]);

  const executeAttack = () => {
      setIsAttacking(true);
      setAttackComplete(false);
      setActiveStep(1);
      
      setClock('11:59:58');
      setAllowedRequests(0);
      setBlockedRequests(0);
      setServerLoad(0);
      
      addLog('WARN', '[Scalper Bot] Initiating Window-Boundary Burst Attack...');
      
      setTimeout(() => {
          setActiveStep(2);
          setClock('11:59:59');
          addLog('CRIT', '[Scalper Bot] Firing 100 concurrent requests at end of minute.');
          setAllowedRequests(100);
          setServerLoad(50); // 50% capacity
          
          if (isGcraEnabled) {
              addLog('SYS', '[Redis-Cell GCRA] Bucket filled. Next cell available in 600ms.');
          } else {
              addLog('SYS', '[Fixed Window] Counter reached 100. Limit hit for current minute.');
          }
          
          setTimeout(() => {
              setActiveStep(3);
              setClock('12:00:00');
              
              if (isGcraEnabled) {
                  addLog('SYS', '[Redis-Cell GCRA] Algorithm continuously leaking 1.66 req/sec...');
                  setServerLoad(48); // Slightly leaked
              } else {
                  addLog('SUCCESS', '[Fixed Window] Minute boundary crossed. Counter reset to 0.');
                  setServerLoad(0); // Arbitrary drop for visual effect of reset, though physically load might still be processing. We use it to represent "allowed capacity"
              }
              
              setTimeout(() => {
                  setActiveStep(4);
                  setClock('12:00:01');
                  addLog('CRIT', '[Scalper Bot] Firing ANOTHER 100 concurrent requests!');
                  
                  if (isGcraEnabled) {
                      addLog('SUCCESS', '[Redis-Cell GCRA] Bucket still full. Math denies burst.');
                      setBlockedRequests(98);
                      setAllowedRequests(102); // 2 requests leaked out and were allowed
                      setServerLoad(55); 
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setClock('12:00:02');
                          setIsAttacking(false);
                          setAttackComplete(true);
                          addLog('SUCCESS', 'Attack neutralized. 429 Too Many Requests returned. Server stable.');
                      }, 1500);
                      
                  } else {
                      // Legacy Fixed Window
                      addLog('WARN', '[Fixed Window] Counter at 0. Allowing 100 new requests.');
                      setAllowedRequests(200);
                      setServerLoad(100); // 200 reqs in 2 seconds = BOOM
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setClock('12:00:02');
                          setIsAttacking(false);
                          setAttackComplete(true);
                          addLog('CRIT', 'FATAL: 200 requests processed in 2 seconds. API Server crashed.');
                      }, 1500);
                  }
              }, 1500);
          }, 1500);
      }, 1500);
  };

  const toggleGcra = () => {
      const newState = !isGcraEnabled;
      setIsGcraEnabled(newState);
      setAttackComplete(false);
      setActiveStep(0);
      setClock('11:59:57');
      setAllowedRequests(0);
      setBlockedRequests(0);
      setServerLoad(0);
      
      if (newState) {
          addLog('SUCCESS', 'Redis-Cell GCRA (Leaky Bucket) algorithm enabled. Burst limits smoothed.');
      } else {
          addLog('CRIT', 'Fixed Window Rate Limiting enabled. Vulnerable to boundary exploits.');
      }
  };

  const resetDemo = () => {
      setIsAttacking(false);
      setAttackComplete(false);
      setActiveStep(0);
      setClock('11:59:57');
      setAllowedRequests(0);
      setBlockedRequests(0);
      setServerLoad(0);
      addLog('SYS', 'API Gateway restored. Counters reset.');
  };

  const addLog = (type, msg) => {
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: clock, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> API Security & Algorithms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Rate Limiting via GCRA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500">Redis Cell Integration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Eventra's API Gateway limits users to 100 requests per minute to prevent abuse. However, the current implementation uses a naive "Fixed Window" algorithm. A scalper bot can exploit this by sending 100 requests at exactly 11:59:59, and another 100 requests at 12:00:01 after the counter resets. This effectively hammers the backend with 200 requests in 2 seconds, crashing the server. Eventra solves this by replacing the logic with the Generic Cell Rate Algorithm (GCRA) using the high-performance `redis-cell` Rust module. Acting as a mathematical "Leaky Bucket," GCRA ensures that traffic is smoothed out perfectly over time, strictly denying window-boundary burst attacks with microscopic precision and zero memory overhead.
          </p>

          <div className="bg-[#120a03] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Rate Limiter Configuration
               </h3>
               {attackComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset API Gateway</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* GCRA Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Throttling Algorithm</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isGcraEnabled ? 'Active: Redis Cell / GCRA (Leaky Bucket)' : 'Inactive: Basic Fixed Window (Minute Reset)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleGcra}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isGcraEnabled ? 'bg-yellow-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isGcraEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeAttack}
                     disabled={isAttacking || attackComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         attackComplete ? 'bg-slate-800 text-yellow-500 border-yellow-900 cursor-not-allowed' :
                         isAttacking ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-red-700 hover:bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                     }`}
                 >
                     {isAttacking ? 'Bot Executing Exploit...' : attackComplete ? 'Simulation Completed' : "Simulate Window-Boundary Burst Attack"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Redis Gateway Trace</span>
                 {isAttacking && <span className="text-yellow-400 font-black animate-pulse">ANALYZING...</span>}
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
                       log.type === 'SYS' ? 'text-yellow-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Gateway Traffic Flow</span>
                      <span className="text-xs text-white font-bold">API Boundary Exploitation</span>
                  </div>
                  <div className="bg-black border border-slate-700 px-3 py-1 rounded font-mono text-xl font-bold text-white shadow-inner flex items-center">
                      ⏱️ <span className="ml-2 w-[100px] text-center">{clock}</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-between">
                  
                  {/* Scalper Bot Source */}
                  <div className="w-full flex justify-center relative z-20">
                      <div className={`border-2 rounded-xl p-2 w-48 text-center transition-all duration-300 ${
                          activeStep === 2 || activeStep === 4 ? 'border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105' : 'border-slate-700 bg-slate-900'
                      }`}>
                          <span className="text-2xl block mb-1">🤖</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 block">Scalper Bot Script</span>
                          <span className="text-[7px] font-mono text-slate-400">Target: POST /api/tickets/buy</span>
                      </div>
                  </div>

                  {/* Packet Storm area */}
                  <div className="flex-1 w-full relative z-10">
                      {/* Storm 1: 11:59:59 */}
                      {activeStep >= 2 && activeStep < 4 && (
                          <div className="absolute inset-0 flex justify-center animate-[fadeDown_0.5s_linear_forwards]">
                              <div className="w-32 flex flex-wrap justify-center gap-1">
                                  {Array.from({ length: 20 }).map((_, i) => (
                                      <div key={i} className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                                  ))}
                              </div>
                          </div>
                      )}
                      
                      {/* Storm 2: 12:00:01 */}
                      {activeStep >= 4 && (
                          <div className="absolute inset-0 flex justify-center animate-[fadeDown_0.5s_linear_forwards]">
                              <div className="w-32 flex flex-wrap justify-center gap-1">
                                  {Array.from({ length: 20 }).map((_, i) => (
                                      <div key={i} className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-colors ${
                                          isGcraEnabled ? 'bg-slate-600 text-slate-600' : 'bg-red-500 text-red-500'
                                      }`}></div>
                                  ))}
                              </div>
                          </div>
                      )}
                      
                      {/* Rejection Wall (GCRA Only) */}
                      {isGcraEnabled && activeStep >= 4 && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,1)] z-20 flex justify-center">
                              <span className="absolute -mt-6 bg-amber-950 text-amber-500 text-[8px] font-bold px-2 py-1 rounded border border-amber-500 animate-pulse">HTTP 429 TOO MANY REQUESTS</span>
                          </div>
                      )}
                  </div>

                  {/* Backend Server */}
                  <div className={`w-64 border-2 rounded-xl p-4 relative z-20 transition-all duration-500 mt-auto ${
                      !isGcraEnabled && activeStep >= 5 ? 'border-red-500 bg-red-950/40 shadow-[0_0_40px_rgba(239,68,68,0.6)] rotate-2' : 
                      'border-emerald-500 bg-emerald-950/20'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-3 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">🖥️</span> Eventra Backend</span>
                      </span>
                      
                      {/* Load Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-3 mb-2 border border-slate-700 relative overflow-hidden">
                          <div className={`h-full transition-all duration-700 ${
                              serverLoad >= 100 ? 'bg-red-500 animate-pulse' : 
                              serverLoad >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`} style={{ width: `${Math.min(serverLoad, 100)}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between font-mono text-[9px]">
                          <span className="text-slate-400">Allowed: <span className="text-emerald-400 font-bold">{allowedRequests}</span></span>
                          <span className="text-slate-400">Blocked: <span className="text-amber-500 font-bold">{blockedRequests}</span></span>
                      </div>
                      
                      {!isGcraEnabled && activeStep >= 5 && (
                          <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-2xl uppercase tracking-widest bg-red-950/80 backdrop-blur-sm rounded-xl border border-red-500">
                              CRASHED
                          </div>
                      )}
                  </div>

                  {/* Custom Keyframes */}
                  <style>{`
                      @keyframes fadeDown {
                          0% { top: 0; opacity: 0; }
                          20% { opacity: 1; }
                          80% { top: 50%; opacity: 1; }
                          100% { top: 100%; opacity: 0; }
                      }
                  `}</style>

                  {/* Overlays */}
                  {attackComplete && !isGcraEnabled && (
                      <div className="absolute inset-x-4 top-1/4 bg-red-950/95 backdrop-blur-sm rounded-xl border border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">💥</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-red-500">Boundary Exploit Successful</span>
                          <p className="text-[9px] text-red-200 leading-relaxed font-mono">
                              The bot manipulated the 12:00:00 counter reset. By sending 100 requests right before the reset, and 100 requests right after, it pushed 200 requests to the backend in 2 seconds. The server's CPU spiked and crashed.
                          </p>
                      </div>
                  )}
                  
                  {attackComplete && isGcraEnabled && (
                      <div className="absolute inset-x-4 top-1/4 bg-emerald-950/95 backdrop-blur-sm rounded-xl border border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">🛡️</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-emerald-400">Math Defeats Bot</span>
                          <p className="text-[9px] text-emerald-200 leading-relaxed font-mono">
                              GCRA doesn't use simple minute windows. It tracks exact time mathematically. At 12:00:01, the "bucket" was still 98% full from the previous second's attack. The new 100 requests were instantly rejected. Server stayed online.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120a03] p-4 rounded-xl border border-yellow-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-yellow-400 uppercase block mb-1">Fixed Window vs Leaky Bucket:</span>
               With GCRA OFF, click Simulate Attack. The basic rate limiter allows 100 req/min. A bot sends 100 requests at 11:59:59. At 12:00:00, the naive logic simply resets the counter to 0. The bot immediately sends another 100 requests. 200 heavy database transactions hit the server in 2 seconds, destroying it.<br/><br/>Toggle <span className="text-yellow-400 font-bold bg-slate-800 px-1 rounded">Throttling Algorithm</span> ON. The `redis-cell` GCRA algorithm is active. It acts as a leaky bucket. After the first 100 requests, the bucket is full. It only "leaks" capacity at ~1.6 req/sec. When the bot attacks again at 12:00:01, the bucket is still full! The requests hit a wall, returning 429 Too Many Requests instantly.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default RedisCellRateLimiting;
