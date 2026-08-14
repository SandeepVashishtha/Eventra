/* eslint-disable */
import React, { useState, useEffect } from 'react';

const A11yContrastPipeline = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [badContrast, setBadContrast] = useState(true);
  const [prStatus, setPrStatus] = useState(null); // null, 'FAIL', 'PASS'
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'GitHub Actions runner initialized. Awaiting commits.' }
  ]);

  const triggerPipeline = () => {
      setIsRunning(true);
      setPrStatus(null);
      
      const commitMsg = badContrast 
          ? 'feat: update map buttons to new brand pink' 
          : 'fix: darken map buttons for a11y compliance';
          
      addLog('ACTION', `Developer pushed commit: "${commitMsg}"`);
      
      setTimeout(() => {
          addLog('SYS', 'Triggering axe-core automated accessibility audit...');
          
          setTimeout(() => {
              addLog('WARN', 'Analyzing DOM nodes and calculating WCAG 2.1 color contrast ratios...');
              
              setTimeout(() => {
                  setIsRunning(false);
                  
                  if (badContrast) {
                      setPrStatus('FAIL');
                      addLog('CRIT', 'Audit Failed! Found 3 elements with contrast ratio < 4.5:1.');
                      addLog('SYS', 'GitHub Action failed. Automated PR comment posted. Merge blocked.');
                  } else {
                      setPrStatus('PASS');
                      addLog('SUCCESS', 'Audit Passed! All elements exceed WCAG AA 4.5:1 contrast ratio.');
                      addLog('SYS', 'GitHub Action succeeded. Ready for merge.');
                  }
              }, 2000);
          }, 1500);
      }, 1000);
  };
  
  const toggleContrast = () => {
      const newState = !badContrast;
      setBadContrast(newState);
      setPrStatus(null);
      if (newState) {
          addLog('WARN', 'Developer switched to Low Contrast brand colors (Pink on White).');
      } else {
          addLog('SUCCESS', 'Developer switched to High Contrast brand colors (Dark Navy on White).');
      }
  };

  const resetDemo = () => {
      setIsRunning(false);
      setPrStatus(null);
      addLog('SYS', 'Pipeline reset. Awaiting next commit.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#04060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿</span> Accessibility (a11y) & QA Automation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Accessibility <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Contrast Pipeline</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Visually impaired attendees cannot read the festival map because UI updates frequently introduce brand colors that fail WCAG contrast ratio requirements. Relying on manual testing allows inaccessible code to slip into production. Eventra solves this by implementing an automated accessibility testing tool (`axe-core`) directly into the GitHub Actions CI/CD pipeline. If a developer opens a Pull Request with bad contrast, the pipeline automatically fails the build, blocks the merge, and pinpoints exactly which DOM elements need fixing.
          </p>

          <div className="bg-[#0a0c12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> CI/CD Audit Configuration
               </h3>
               {prStatus !== null && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Pipeline</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Contrast Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Developer's Code Changes</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {badContrast ? 'CSS: color: #ff99cc; background: #ffffff;' : 'CSS: color: #ffffff; background: #002244;'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleContrast}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             badContrast ? 'bg-rose-500' : 'bg-emerald-500'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             badContrast ? 'translate-x-1' : 'translate-x-8'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={triggerPipeline}
                     disabled={isRunning || prStatus !== null}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         prStatus === 'FAIL' ? 'bg-rose-900/40 text-rose-500 border-rose-900 cursor-not-allowed' :
                         prStatus === 'PASS' ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isRunning ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                     }`}
                 >
                     {isRunning ? 'Running axe-core CI Action...' : prStatus !== null ? 'Audit Complete' : "Push Commit to CI/CD"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040608] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pull Request Simulator</span>
                      <span className="text-xs text-white font-bold">axe-core Accessibility Audit</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* PR Header */}
                  <div className="mb-6">
                      <h2 className="text-white font-bold text-lg mb-2">Update Map Buttons</h2>
                      <div className="flex items-center text-[10px] text-slate-400">
                          <div className="w-4 h-4 rounded-full bg-blue-900 text-blue-400 flex items-center justify-center mr-2">O</div>
                          <span className="font-bold text-slate-300 mr-1">dev1</span> wants to merge 1 commit into <span className="font-mono bg-slate-800 px-1 mx-1 rounded">main</span>
                      </div>
                  </div>

                  {/* UI Preview Area */}
                  <div className="bg-white rounded-xl p-6 mb-6 flex flex-col items-center shadow-inner relative border border-slate-200">
                      <span className="absolute top-2 left-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Live DOM Preview</span>
                      
                      {badContrast ? (
                          <button className="mt-4 px-6 py-3 rounded-full font-bold shadow-sm" style={{ backgroundColor: '#ffffff', color: '#ff99cc', border: '2px solid #ff99cc' }}>
                              Find Main Stage
                          </button>
                      ) : (
                          <button className="mt-4 px-6 py-3 rounded-full font-bold shadow-sm" style={{ backgroundColor: '#002244', color: '#ffffff', border: '2px solid #002244' }}>
                              Find Main Stage
                          </button>
                      )}
                      
                      {/* Scanning Animation */}
                      {isRunning && (
                          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                              <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_1.5s_linear_infinite]"></div>
                              <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-800 bg-white/80 px-2 py-0.5 rounded animate-pulse">Running axe-core</span>
                          </div>
                      )}
                  </div>

                  {/* CI/CD Status Overlay */}
                  {prStatus === 'FAIL' && (
                      <div className="bg-slate-900 border border-rose-900/50 rounded-xl flex flex-col overflow-hidden animate-fade-in-up">
                          <div className="p-3 border-b border-slate-800 flex items-center bg-rose-950/20">
                              <span className="text-rose-500 mr-2">❌</span>
                              <span className="text-white font-bold text-xs">Accessibility checks failed</span>
                          </div>
                          
                          {/* Automated Bot Comment */}
                          <div className="p-4 bg-slate-950">
                              <div className="flex items-center mb-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] mr-2">🤖</span>
                                  <span className="text-[10px] font-bold text-slate-300">eventra-a11y-bot</span>
                              </div>
                              <div className="text-[10px] text-slate-400 space-y-2">
                                  <p>Found <span className="text-rose-400 font-bold">1 WCAG violation</span> blocking this merge.</p>
                                  <div className="bg-slate-900 p-2 rounded border border-rose-900 font-mono text-[9px] text-rose-300">
                                      <span className="text-white block mb-1">Rule: color-contrast (WCAG AA)</span>
                                      Element: &lt;button&gt;Find Main Stage&lt;/button&gt;<br/>
                                      Actual Contrast Ratio: <span className="font-bold">2.1:1</span><br/>
                                      Required Contrast Ratio: <span className="font-bold">4.5:1</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {prStatus === 'PASS' && (
                      <div className="bg-slate-900 border border-emerald-900/50 rounded-xl flex flex-col overflow-hidden animate-fade-in-up">
                          <div className="p-3 border-b border-slate-800 flex items-center bg-emerald-950/20">
                              <span className="text-emerald-500 mr-2">✅</span>
                              <span className="text-white font-bold text-xs">All checks have passed</span>
                          </div>
                          
                          <div className="p-4 bg-slate-950 flex flex-col">
                              <div className="text-[10px] text-slate-400 mb-3">
                                  <span className="text-emerald-400 font-bold">axe-core</span> found 0 violations. Contrast ratio (7.5:1) meets WCAG AA requirements.
                              </div>
                              <button className="w-full bg-emerald-600 text-white font-bold text-xs py-2 rounded">
                                  Squash and merge
                              </button>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a0c12] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Automated QA Enforcement:</span>
               Ensure the toggle is set to <span className="text-rose-400 font-bold">Low Contrast (Pink)</span> and click Push Commit. The CI/CD pipeline runs `axe-core`. It mathematically calculates that the pink-on-white text is unreadable (2.1:1 ratio). It automatically fails the build and posts an exact error report, preventing the bad code from reaching production.<br/><br/>Now, toggle to <span className="text-emerald-400 font-bold">High Contrast (Navy)</span> and run it again. The contrast ratio is 7.5:1, passing the WCAG standard and allowing the PR to be merged safely.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-50px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default A11yContrastPipeline;
