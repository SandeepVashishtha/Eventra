/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ChaosEngineeringPipeline = () => {
  const [isChaosEnabled, setIsChaosEnabled] = useState(false);
  const [isCodeResilient, setIsCodeResilient] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null, 'FAIL', 'PASS', 'PROD_CRASH'
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'CI/CD Pipeline initialized. Awaiting developer commit.' }
  ]);

  const executePipeline = () => {
      setIsTesting(true);
      setTestComplete(false);
      setTestStatus(null);
      setActiveStep(1);
      
      const commitMsg = isCodeResilient 
          ? 'feat: add SQS Dead Letter Queue for Stripe fallback' 
          : 'feat: synchronous Stripe checkout endpoint';
          
      addLog('ACTION', `Pushing commit to staging: "${commitMsg}"`);
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isChaosEnabled) {
              addLog('WARN', 'Chaos Monkey injected into CI runner network interface.');
              addLog('SYS', 'Executing: iptables -A OUTPUT -d api.stripe.com -j DROP');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Running Cypress E2E Tests: Attempting to purchase VIP ticket...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('CRIT', 'Stripe API connection timed out (Simulated Outage).');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsTesting(false);
                          setTestComplete(true);
                          
                          if (isCodeResilient) {
                              setTestStatus('PASS');
                              addLog('SUCCESS', 'Application safely caught 504 error. Order routed to SQS DLQ.');
                              addLog('SUCCESS', 'Chaos Test Passed. Fallback logic verified. Safe to merge.');
                          } else {
                              setTestStatus('FAIL');
                              addLog('CRIT', 'Application crashed! Unhandled promise rejection during checkout.');
                              addLog('CRIT', 'Chaos Test Failed. Merge blocked to prevent production outage.');
                          }
                      }, 1500);
                  }, 1500);
              }, 1200);
              
          } else {
              // Standard CI Tests
              addLog('SYS', 'Running Standard Jest Unit Tests (Mocking Stripe API).');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Mock Stripe returned 200 OK.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SUCCESS', 'All unit tests passed. Merging to production...');
                      setIsTesting(false);
                      setTestComplete(true);
                      
                      if (!isCodeResilient) {
                          setTestStatus('PROD_CRASH');
                          setTimeout(() => {
                              addLog('CRIT', 'PRODUCTION OUTAGE: Stripe went down globally. Server crashed. $50k lost.');
                          }, 1500);
                      } else {
                          setTestStatus('PASS');
                          addLog('SYS', 'Deployed to production successfully.');
                      }
                  }, 1200);
              }, 1200);
          }
      }, 1000);
  };

  const toggleChaos = () => {
      const newState = !isChaosEnabled;
      setIsChaosEnabled(newState);
      setTestComplete(false);
      setTestStatus(null);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Gremlin Chaos Engineering active. CI will now actively break network connections.');
      } else {
          addLog('WARN', 'Chaos disabled. Relying on perfect API mocks for unit tests.');
      }
  };

  const toggleResilience = () => {
      setIsCodeResilient(!isCodeResilient);
      setTestComplete(false);
      setTestStatus(null);
      setActiveStep(0);
  };

  const resetDemo = () => {
      setIsTesting(false);
      setTestComplete(false);
      setTestStatus(null);
      setActiveStep(0);
      addLog('SYS', 'CI/CD pipeline reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070305] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔥</span> DevOps & Resilience
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Chaotic Testing Pipeline <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-500 to-amber-500">Chaos Engineering Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Relying solely on unit tests is dangerous because they mock perfect network conditions. We only find out our Stripe payment fallback logic is broken when Stripe actually goes down during a ticket drop, costing thousands of dollars. Eventra solves this by integrating Chaos Engineering into the staging CI/CD pipeline. The pipeline automatically injects randomized network faults (blackholing API IPs, dropping TCP packets) while automated tests attempt to buy tickets. This mathematically guarantees that our asynchronous queue fallback systems actually work before code reaches production.
          </p>

          <div className="bg-[#120508] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🎛️</span> CI/CD Workflow Rules
               </h3>
               {testComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Pipeline</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Chaos Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-4">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Testing Methodology</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isChaosEnabled ? 'Active: Chaos Monkey (Network Fault Injection)' : 'Inactive: Jest Unit Tests (Perfect API Mocks)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleChaos}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isChaosEnabled ? 'bg-rose-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isChaosEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 {/* Code Quality Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Payment Architecture</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isCodeResilient ? 'Resilient: Asynchronous SQS Fallback Queue' : 'Fragile: Synchronous Await Stripe.charge()'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleResilience}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isCodeResilient ? 'bg-emerald-500' : 'bg-orange-500'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isCodeResilient ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executePipeline}
                     disabled={isTesting || testComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         testStatus === 'FAIL' || testStatus === 'PROD_CRASH' ? 'bg-rose-900/40 text-rose-500 border-rose-900 cursor-not-allowed' :
                         testStatus === 'PASS' ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isTesting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                     }`}
                 >
                     {isTesting ? 'Running Deployment Pipeline...' : testComplete ? 'Workflow Complete' : "Push Commit to Staging"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040203] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>GitHub Actions Runner</span>
                 {isTesting && <span className="text-rose-400 font-black animate-pulse">EXECUTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Staging Environment</span>
                      <span className="text-xs text-white font-bold">Network Resilience Visualizer</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {isChaosEnabled ? (
                      // Chaos Monkey View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          <div className="bg-rose-950/30 border border-rose-900 rounded-xl p-4 mb-4 relative overflow-hidden flex items-center">
                              <span className="text-3xl mr-4 z-10 relative">🐒</span>
                              <div className="flex flex-col z-10 relative">
                                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Chaos Monkey Injected</span>
                                  <span className="text-[9px] text-rose-200 font-mono">iptables: Blackholing Stripe IPs</span>
                              </div>
                          </div>
                          
                          <div className={`bg-slate-900 border rounded-xl p-4 flex-1 flex flex-col relative overflow-hidden transition-colors duration-500 ${
                              activeStep >= 5 ? (isCodeResilient ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]') : 'border-slate-800'
                          }`}>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Checkout API Flow</span>
                              
                              <div className="flex justify-between items-center mb-6">
                                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-xl z-10 border border-slate-600">🛒</div>
                                  
                                  {/* Network Line */}
                                  <div className="flex-1 h-0.5 bg-slate-700 relative">
                                      {activeStep >= 3 && activeStep < 4 && (
                                          <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-3 h-3 bg-white rounded-full animate-ping"></div>
                                      )}
                                      {activeStep >= 4 && (
                                          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 text-rose-500 font-black text-xl bg-slate-900 px-1 -mt-3.5">X</div>
                                      )}
                                  </div>
                                  
                                  <div className={`w-12 h-12 bg-indigo-900/50 border border-indigo-500 rounded-lg flex items-center justify-center text-xl z-10 transition-opacity ${activeStep >= 4 ? 'opacity-30 grayscale' : 'opacity-100'}`}>💳</div>
                              </div>
                              
                              <div className="bg-black/50 p-3 rounded border border-slate-800 font-mono text-[9px] text-slate-400 space-y-1 h-32 overflow-hidden">
                                  {activeStep >= 3 && <div>[Runner] POST /checkout...</div>}
                                  {activeStep >= 4 && <div className="text-rose-400">[Axios] ERROR 504 Gateway Timeout</div>}
                                  {activeStep >= 5 && isCodeResilient && (
                                      <>
                                          <div className="text-emerald-400">[Fallback] Catching 504 error...</div>
                                          <div className="text-emerald-400">[SQS] Pushing order payload to DLQ.</div>
                                          <div className="text-emerald-400">[Client] Returned 202 Accepted.</div>
                                      </>
                                  )}
                                  {activeStep >= 5 && !isCodeResilient && (
                                      <>
                                          <div className="text-rose-500 font-bold">[Fatal] UnhandledPromiseRejection!</div>
                                          <div className="text-rose-500 font-bold">[Server] Process exited with code 1.</div>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                  ) : (
                      // Standard Mocking View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Unit Test Mocks</span>
                              <div className="text-[10px] text-slate-300 bg-black/50 p-3 rounded border border-slate-800 font-mono">
                                  jest.mock('stripe');<br/>
                                  stripe.charge.mockResolvedValue(<br/>
                                  &nbsp;&nbsp;{'{ status: "succeeded" }'}<br/>
                                  );
                              </div>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-6 bg-slate-900/50">
                              {activeStep >= 3 && activeStep < 4 ? (
                                  <div className="text-center animate-pulse">
                                      <span className="text-4xl mb-2 block">🧪</span>
                                      <span className="text-white font-bold text-xs uppercase tracking-widest">Running Tests...</span>
                                  </div>
                              ) : activeStep >= 4 ? (
                                  <div className="text-center animate-fade-in-up">
                                      <span className="text-4xl mb-2 block">✅</span>
                                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest block mb-2">14/14 Tests Passed</span>
                                      <span className="text-[9px] text-slate-500">Mocks returned perfect responses. Code looks great in theory.</span>
                                  </div>
                              ) : (
                                  <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Awaiting Commit...</span>
                              )}
                          </div>
                      </div>
                  )}

                  {/* Overlays */}
                  {testStatus === 'PROD_CRASH' && (
                      <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🔥</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Production Outage</span>
                          <p className="text-[10px] text-rose-200 leading-relaxed bg-rose-900/50 p-3 rounded border border-rose-500">
                              The unit tests passed because the network was mocked. In reality, Stripe went down during the ticket drop. The fragile code crashed the server, costing $50k in lost revenue.
                          </p>
                      </div>
                  )}
                  
                  {testStatus === 'FAIL' && isChaosEnabled && (
                      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🛑</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Merge Blocked</span>
                          <p className="text-[10px] text-rose-200 leading-relaxed bg-rose-900/50 p-3 rounded border border-rose-500">
                              Chaos Monkey blocked the Stripe API. The checkout service failed to handle the timeout and crashed. The CI pipeline caught the fragile code and blocked the merge, saving production.
                          </p>
                      </div>
                  )}
                  
                  {testStatus === 'PASS' && isChaosEnabled && (
                      <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🛡️</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Resilience Verified</span>
                          <p className="text-[10px] text-emerald-200 leading-relaxed bg-emerald-900/50 p-3 rounded border border-emerald-500">
                              Chaos Monkey blocked the Stripe API, but the resilient codebase caught the 504 Gateway Timeout and safely routed the payload to the Dead Letter Queue. Code is safe to merge.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120508] p-4 rounded-xl border border-rose-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-rose-400 uppercase block mb-1">Chaos Engineering:</span>
               Set architecture to <span className="text-orange-400 font-bold">Fragile</span> and Chaos <span className="text-rose-400 font-bold">OFF</span>. The code merges because perfect unit test mocks pass. When a real network timeout occurs, production melts down.<br/><br/>Toggle <span className="text-rose-400 font-bold bg-slate-800 px-1 rounded">Chaos Engine</span> ON. The CI runner actively drops network packets to the Stripe API. If the code is fragile, the tests fail immediately, blocking the merge. Change the code to <span className="text-emerald-400 font-bold">Resilient</span>, and watch the system gracefully handle the forced 504 Timeout using a Dead Letter Queue.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ChaosEngineeringPipeline;
