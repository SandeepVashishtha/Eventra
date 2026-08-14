/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveFoodWaste = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'Sustainability Module active. Ingesting historical sales and live foot traffic.' }
  ]);

  const generatePrediction = () => {
      setIsPredicting(true);
      setReportReady(false);
      addLog('ACTION', 'Executing Predictive Inventory ML Model for midnight (00:00) projection...');
      
      setTimeout(() => {
          addLog('SYS', 'Analyzing Vendor Point-of-Sale velocity vs current crowd density...');
          
          setTimeout(() => {
              addLog('WARN', 'Critical surplus predicted at 3 vendors. Generating logistical dispatch plan.');
              
              setTimeout(() => {
                  setIsPredicting(false);
                  setReportReady(true);
                  addLog('SUCCESS', 'Charity Dispatch Manifest created. Webhook sent to local Food Bank.');
              }, 1500);
          }, 1500);
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsPredicting(false);
      setReportReady(false);
      addLog('SYS', 'Demo reset. Waiting for next prediction cycle.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020704] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌱</span> Sustainability & Machine Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Food Waste <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-500">Reduction Algorithm</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals throw away tons of perfectly good food every night because vendors over-prepare, resulting in massive ecological and financial waste. Eventra solves this using a Predictive Inventory ML model. By analyzing real-time foot traffic and sales velocity, the algorithm predicts exactly which vendors will have excess perishable inventory at midnight. It automatically generates a logistical manifest, alerting local food bank charities exactly how much food to pick up and where.
          </p>

          <div className="bg-[#05120a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Inventory Telemetry
               </h3>
               {reportReady && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">Live Foot Traffic (Food Court)</span>
                     <div className="flex items-center">
                         <span className="text-3xl mr-3">📉</span>
                         <div className="flex flex-col">
                             <span className="text-xl font-black text-amber-400 font-mono">1,204</span>
                             <span className="text-[10px] text-slate-400">Users (Dropping rapidly)</span>
                         </div>
                     </div>
                 </div>

                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">Aggregate Sales Velocity</span>
                     <div className="flex items-center">
                         <span className="text-3xl mr-3">🍔</span>
                         <div className="flex flex-col">
                             <span className="text-xl font-black text-rose-400 font-mono">12.5 / min</span>
                             <span className="text-[10px] text-slate-400">P.O.S. Transaction Rate</span>
                         </div>
                     </div>
                 </div>

             </div>

             <button 
                 onClick={generatePrediction}
                 disabled={isPredicting || reportReady}
                 className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-colors mb-4 ${
                     reportReady ? 'bg-emerald-600' :
                     isPredicting ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500'
                 }`}
             >
                 {reportReady ? '✅ Webhook Sent to Charity' : isPredicting ? 'Calculating Surplus...' : 'Run ML Waste Prediction'}
             </button>
             
             {/* System Log */}
             <div className="h-28 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ML Prediction Logs</span>
                 {isPredicting && <span className="text-emerald-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' :
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
            
            {/* Manifest Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-1000 ${
                reportReady ? 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : ''
            }`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Logistics API</span>
                      <span className="text-xs text-white font-bold">Charity Dispatch Manifest</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-y-auto">
                  
                  {!isPredicting && !reportReady && (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                          <div className="text-6xl mb-4 grayscale">🚚</div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center">
                              Awaiting 00:00 Prediction Model
                          </span>
                      </div>
                  )}

                  {isPredicting && (
                      <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest animate-pulse">Running Neural Net...</span>
                      </div>
                  )}

                  {reportReady && (
                      <div className="flex-1 flex flex-col animate-fade-in-up">
                          
                          <div className="bg-amber-950/40 border border-amber-900 rounded-xl p-4 mb-4 flex items-center justify-between">
                              <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Total Predicted Surplus</span>
                                  <span className="text-2xl font-black text-white font-mono">680 LBS</span>
                              </div>
                              <div className="text-3xl">📦</div>
                          </div>
                          
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-1">Pickup Route (00:30 AM)</span>
                          
                          <div className="space-y-3">
                              
                              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                      <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center mr-3">🍔</div>
                                      <div className="flex flex-col">
                                          <span className="text-xs font-bold text-white">Bob's Burgers (Stall A4)</span>
                                          <span className="text-[9px] text-slate-400 font-mono">105 Prepared / 4 Sold per hour</span>
                                      </div>
                                  </div>
                                  <span className="text-emerald-400 font-black text-sm">~85 items</span>
                              </div>

                              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                      <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center mr-3">🍕</div>
                                      <div className="flex flex-col">
                                          <span className="text-xs font-bold text-white">Luigi's Pizza (Stall B2)</span>
                                          <span className="text-[9px] text-slate-400 font-mono">45 Pies / 0 Sold per hour</span>
                                      </div>
                                  </div>
                                  <span className="text-emerald-400 font-black text-sm">~45 items</span>
                              </div>
                              
                              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center opacity-50">
                                  <div className="flex items-center">
                                      <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center mr-3">🌮</div>
                                      <div className="flex flex-col">
                                          <span className="text-xs font-bold text-slate-300">Taco Stand (Stall C1)</span>
                                          <span className="text-[9px] text-slate-500 font-mono">Model Predicts: Sold Out</span>
                                      </div>
                                  </div>
                                  <span className="text-slate-500 font-black text-sm">Bypass</span>
                              </div>

                          </div>
                          
                          <div className="mt-auto pt-4">
                              <div className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 rounded p-2 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                                  Logistics Dispatched to Food Bank
                              </div>
                          </div>

                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#05120a] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Algorithmic Sustainability:</span>
               Click <span className="text-white font-bold bg-emerald-600 px-1 rounded">Run ML Prediction</span>. Instead of waiting until 1 AM to realize there are 500 unsold burgers and throwing them in a dumpster, the ML algorithm analyzes foot traffic and sales velocity at 9:30 PM. It mathematically proves that Bob's Burgers will not sell their inventory. The backend preemptively generates a manifest and dispatches a local food charity truck to arrive precisely at closing, ensuring zero waste.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveFoodWaste;
