/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ASTSemVerEnforcement = () => {
  const [isAstEnabled, setIsAstEnabled] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitComplete, setCommitComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'GitHub Actions runner standing by. Listening for push events.' }
  ]);

  const executeCommit = () => {
      setIsCommitting(true);
      setCommitComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'Dev pushed commit: "refactor: optimize checkout API payload".');
      addLog('WARN', 'package.json version bumped: v1.2.0 -> v1.3.0 (Minor Release).');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('SYS', '[CI/CD] Triggering automated build pipeline...');
          
          setTimeout(() => {
              setActiveStep(3);
              addLog('SUCCESS', '[Job: Lint] TypeScript compiler passed successfully (0 errors).');
              
              setTimeout(() => {
                  setActiveStep(4);
                  addLog('SUCCESS', '[Job: Test] Jest Unit Tests passed (142/142).');
                  
                  setTimeout(() => {
                      setActiveStep(5);
                      
                      if (isAstEnabled) {
                          addLog('SYS', '[Job: AST Diff] Analyzing exported interfaces against main branch...');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              addLog('CRIT', '[AST] BREAKING CHANGE: Removed required property "ticketId" from "CheckoutPayload" interface.');
                              
                              setTimeout(() => {
                                  setActiveStep(7);
                                  addLog('WARN', '[SemVer] Validating package.json version bump...');
                                  
                                  setTimeout(() => {
                                      setActiveStep(8);
                                      setIsCommitting(false);
                                      setCommitComplete(true);
                                      addLog('CRIT', 'FATAL: Expected MAJOR version bump (v2.0.0). Found MINOR bump (v1.3.0).');
                                      addLog('CRIT', '[CI/CD] Pipeline FAILED. PR blocked from merging.');
                                  }, 1000);
                              }, 1200);
                          }, 1500);
                          
                      } else {
                          // Legacy Manual Review (Passes CI)
                          addLog('SYS', '[Job: Build] Webpack compiling application bundle...');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              addLog('SUCCESS', '[Job: Build] Compilation finished in 45s.');
                              
                              setTimeout(() => {
                                  setActiveStep(7);
                                  addLog('WARN', '[PR Status] All checks passed. Merged into main automatically.');
                                  
                                  setTimeout(() => {
                                      setActiveStep(8);
                                      setIsCommitting(false);
                                      setCommitComplete(true);
                                      addLog('CRIT', 'CATASTROPHIC FAILURE: v1.3.0 deployed to production. 40+ third-party partner integrations broken instantly.');
                                  }, 1500);
                              }, 1200);
                          }, 1200);
                      }
                  }, 1200);
              }, 1000);
          }, 1000);
      }, 1000);
  };

  const toggleAst = () => {
      const newState = !isAstEnabled;
      setIsAstEnabled(newState);
      setCommitComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'Abstract Syntax Tree (AST) API diffing integrated into GitHub Actions pipeline.');
      } else {
          addLog('CRIT', 'AST analysis disabled. API contract enforcement relying on manual human PR reviews.');
      }
  };

  const resetDemo = () => {
      setIsCommitting(false);
      setCommitComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Pipeline reset. Awaiting new commits.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛠️</span> Developer Experience & CI/CD
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Semantic Versioning <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">AST Diff Enforcement</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Eventra provides a public API for third-party festival vendors. Developers often refactor code and unknowingly make "Breaking Changes" to the API (like removing a required property). They then bump the version in `package.json` as a "Minor" release (e.g., v1.2.0 to v1.3.0) because the unit tests still pass. The PR merges, and the production release immediately breaks 40+ partner integrations. Relying on humans to catch API breaches is error-prone. Eventra solves this by integrating an Abstract Syntax Tree (AST) diff tool into the CI/CD pipeline. The tool parses the TypeScript codebase, mathematically proves if an API contract was broken, and strictly fails the build if the version bump does not match Semantic Versioning (SemVer) rules (requiring a Major v2.0.0 bump).
          </p>

          <div className="bg-[#060c14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🎛️</span> Pipeline Configuration
               </h3>
               {commitComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset CI Pipeline</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* AST Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">GitHub Actions Runner</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isAstEnabled ? 'Active: Lint → Test → AST Diff → Deploy' : 'Inactive: Lint → Test → Deploy (Legacy)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleAst}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isAstEnabled ? 'bg-sky-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isAstEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeCommit}
                     disabled={isCommitting || commitComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         commitComplete && !isAstEnabled ? 'bg-slate-800 text-red-500 border-red-900 cursor-not-allowed' :
                         commitComplete && isAstEnabled ? 'bg-slate-800 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isCommitting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                     }`}
                 >
                     {isCommitting ? 'Running GitHub Actions...' : commitComplete && isAstEnabled ? 'Build Safely Blocked' : commitComplete && !isAstEnabled ? 'Bad Code Shipped' : "Commit Breaking Change (Minor Bump)"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>CI/CD stdout</span>
                 {isCommitting && <span className="text-sky-400 font-black animate-pulse">EXECUTING...</span>}
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
                       log.type === 'SYS' ? 'text-sky-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">Pull Request Diff View</span>
                      <span className="text-xs text-white font-bold">feat(api): refactor checkout payload</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Code Diff Section */}
                  <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-lg mb-6 z-10">
                      <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400">src/types/api.ts</span>
                          <span className="text-[9px] font-mono bg-amber-950 text-amber-500 px-1 rounded border border-amber-900">Modified</span>
                      </div>
                      <div className="p-3 font-mono text-[9px] leading-relaxed">
                          <div className="text-slate-400">export interface CheckoutPayload {"{"}</div>
                          <div className="text-emerald-400 bg-emerald-950/20 pl-4 border-l-2 border-emerald-500"><span className="text-emerald-600 select-none mr-2">+</span> userId: string;</div>
                          <div className={`pl-4 border-l-2 transition-colors ${activeStep >= 1 ? 'bg-red-950/40 border-red-500' : 'bg-transparent border-transparent'}`}>
                              {activeStep >= 1 ? (
                                  <span className="text-red-400 line-through"><span className="text-red-600 select-none mr-2">-</span> ticketId: string;</span>
                              ) : (
                                  <span className="text-slate-300"><span className="text-transparent select-none mr-2"> </span> ticketId: string;</span>
                              )}
                          </div>
                          <div className="text-emerald-400 bg-emerald-950/20 pl-4 border-l-2 border-emerald-500"><span className="text-emerald-600 select-none mr-2">+</span> tier: 'vip' | 'ga';</div>
                          <div className="text-slate-400">{"}"}</div>
                      </div>
                  </div>

                  {/* package.json Section */}
                  <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-lg mb-8 z-10">
                      <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400">package.json</span>
                          <span className="text-[9px] font-mono bg-amber-950 text-amber-500 px-1 rounded border border-amber-900">Modified</span>
                      </div>
                      <div className="p-3 font-mono text-[9px] leading-relaxed flex items-center">
                          <span className="text-slate-400 mr-2">"version":</span>
                          {activeStep >= 1 ? (
                              <div className="flex items-center">
                                  <span className="text-red-400 line-through mr-2">"1.2.0"</span>
                                  <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1 rounded border border-emerald-900">"1.3.0"</span>
                              </div>
                          ) : (
                              <span className="text-emerald-400">"1.2.0"</span>
                          )}
                      </div>
                  </div>

                  {/* CI/CD Pipeline Visualizer */}
                  <div className="flex-1 border-t border-slate-800 pt-4 flex flex-col relative">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-4 text-center">CI/CD Pipeline Jobs</span>
                      
                      <div className="flex justify-between items-center px-4 relative z-10">
                          {/* Line connecting nodes */}
                          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -z-10 -translate-y-1/2"></div>
                          
                          {/* Node 1: Lint */}
                          <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-slate-900 transition-all ${
                                  activeStep === 2 ? 'border-sky-500 animate-pulse text-sky-400' :
                                  activeStep > 2 ? 'border-emerald-500 text-emerald-500' : 'border-slate-700 text-slate-700'
                              }`}>
                                  {activeStep > 2 ? '✓' : activeStep === 2 ? '⚙' : ''}
                              </div>
                              <span className={`text-[8px] font-bold mt-2 uppercase ${activeStep >= 2 ? 'text-white' : 'text-slate-600'}`}>Lint</span>
                          </div>

                          {/* Node 2: Test */}
                          <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-slate-900 transition-all ${
                                  activeStep === 3 ? 'border-sky-500 animate-pulse text-sky-400' :
                                  activeStep > 3 ? 'border-emerald-500 text-emerald-500' : 'border-slate-700 text-slate-700'
                              }`}>
                                  {activeStep > 3 ? '✓' : activeStep === 3 ? '⚙' : ''}
                              </div>
                              <span className={`text-[8px] font-bold mt-2 uppercase ${activeStep >= 3 ? 'text-white' : 'text-slate-600'}`}>Test</span>
                          </div>

                          {/* Node 3: AST Diff (Conditional) */}
                          {isAstEnabled ? (
                              <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-slate-900 transition-all ${
                                      activeStep >= 4 && activeStep <= 7 ? 'border-amber-500 animate-pulse text-amber-500' :
                                      activeStep > 7 ? 'border-red-500 text-red-500' : 'border-slate-700 text-slate-700'
                                  }`}>
                                      {activeStep > 7 ? '✗' : (activeStep >= 4 && activeStep <= 7) ? '🔍' : ''}
                                  </div>
                                  <span className={`text-[8px] font-bold mt-2 uppercase ${activeStep >= 4 ? 'text-white' : 'text-slate-600'}`}>AST Diff</span>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center opacity-30 grayscale">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-700 bg-slate-900 text-slate-700"></div>
                                  <span className="text-[8px] font-bold mt-2 uppercase text-slate-600">AST (Off)</span>
                              </div>
                          )}

                          {/* Node 4: Build/Deploy */}
                          <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-slate-900 transition-all ${
                                  !isAstEnabled && activeStep === 5 ? 'border-sky-500 animate-pulse text-sky-400' :
                                  !isAstEnabled && activeStep > 5 ? 'border-emerald-500 text-emerald-500' : 
                                  isAstEnabled && activeStep > 7 ? 'border-red-500 text-red-500 opacity-50' : 'border-slate-700 text-slate-700'
                              }`}>
                                  {!isAstEnabled && activeStep > 5 ? '✓' : (!isAstEnabled && activeStep === 5) ? '⚙' : (isAstEnabled && activeStep > 7) ? '🚫' : ''}
                              </div>
                              <span className={`text-[8px] font-bold mt-2 uppercase ${(!isAstEnabled && activeStep >= 5) ? 'text-white' : 'text-slate-600'}`}>Deploy</span>
                          </div>
                      </div>

                      {/* AST Diff Details Popup */}
                      {isAstEnabled && activeStep >= 6 && (
                          <div className="absolute bottom-16 left-4 right-4 bg-red-950/90 border border-red-500 p-3 rounded-lg z-20 animate-fade-in-up shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-md">
                              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center mb-1">
                                  <span className="mr-2">🚨</span> Contract Breach Detected
                              </span>
                              <div className="font-mono text-[8px] text-red-200 leading-relaxed">
                                  AST analysis detected removal of required parameter: <span className="text-white font-bold bg-black/50 px-1 rounded">ticketId</span>.<br/>
                                  <span className="mt-1 block">Expected version bump: <span className="text-white font-bold">MAJOR</span></span>
                                  <span className="block">Detected version bump: <span className="text-white font-bold">MINOR</span></span>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Final Overlays */}
                  {commitComplete && !isAstEnabled && (
                      <div className="absolute inset-0 bg-red-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center shadow-2xl">
                          <span className="text-5xl mb-4">💥</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-2 text-red-500">Integrations Broken</span>
                          <p className="text-[10px] text-red-200 leading-relaxed font-mono">
                              The breaking change bypassed Linting and Testing. It was successfully deployed as a Minor release (v1.3.0). Dozens of API partners crashed because they were expecting `ticketId` in the payload.
                          </p>
                      </div>
                  )}
                  
                  {commitComplete && isAstEnabled && (
                      <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center shadow-2xl">
                          <span className="text-5xl mb-4">🛡️</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-2 text-emerald-400">Disaster Prevented</span>
                          <p className="text-[10px] text-emerald-200 leading-relaxed font-mono">
                              The AST step parsed the code structure and identified a deleted interface property. Because the developer only provided a Minor version bump, the pipeline intelligently blocked the deploy, enforcing SemVer compliance.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#060c14] p-4 rounded-xl border border-sky-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-sky-400 uppercase block mb-1">AST Analysis in CI/CD:</span>
               With AST pipeline OFF, click Commit. A developer removes a required field but only increments the version slightly. Because syntax (Lint) and Unit Tests pass, the code is deployed, breaking the API contract and taking down partner integrations.<br/><br/>Toggle <span className="text-sky-400 font-bold bg-slate-800 px-1 rounded">GitHub Actions Runner</span> ON. Now the pipeline includes an Abstract Syntax Tree (AST) diffing step. The pipeline parses the raw TypeScript structure, detects the missing property, mathematically identifies it as a "Breaking Change," and forcefully halts the CI build because the version was not incremented to v2.0.0 (Major).
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ASTSemVerEnforcement;
