/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VIPPropensityScoring = () => {
  const [isScoring, setIsScoring] = useState(false);
  const [activeUserId, setActiveUserId] = useState(1);
  const [scoreResult, setScoreResult] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'ML Classification Pipeline ready. Awaiting GA cohort.' }
  ]);

  const users = [
      {
          id: 1,
          name: 'David Chen',
          plan: 'General Admission (3-Day)',
          metrics: { foodSpent: 185.00, appOpens: 32, vipProximityMin: 145 },
          truePropensity: 88 // High
      },
      {
          id: 2,
          name: 'Jessica Taylor',
          plan: 'General Admission (1-Day)',
          metrics: { foodSpent: 25.00, appOpens: 4, vipProximityMin: 12 },
          truePropensity: 15 // Low
      },
      {
          id: 3,
          name: 'Marcus Johnson',
          plan: 'General Admission (3-Day)',
          metrics: { foodSpent: 95.00, appOpens: 18, vipProximityMin: 45 },
          truePropensity: 52 // Medium
      }
  ];

  const activeUser = users.find(u => u.id === activeUserId);

  const runModel = () => {
      setIsScoring(true);
      setScoreResult(null);
      addLog('ACTION', `Executing XGBoost Classification for User ID: ${activeUser.id}...`);
      
      setTimeout(() => {
          addLog('SYS', `Analyzing tensors: Spend Velocity, Engagement Index, Spatial Dwell Time.`);
          
          setTimeout(() => {
              setIsScoring(false);
              setScoreResult(activeUser.truePropensity);
              
              if (activeUser.truePropensity > 75) {
                  addLog('CRIT', `High VIP Propensity Detected (${activeUser.truePropensity}%). User likely to convert.`);
                  addLog('SUCCESS', `Triggered Marketing Webhook -> 'Flash VIP Upgrade Push Notification' sent.`);
              } else {
                  addLog('WARN', `Low VIP Propensity (${activeUser.truePropensity}%). Suppressing marketing spam.`);
              }
          }, 1500);
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080512] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Machine Learning & Marketing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            VIP Upgrade Propensity <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">Scoring Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals miss out on thousands of dollars in revenue because they don't know which General Admission attendees are most likely to impulse-buy a VIP upgrade on the second day. Eventra solves this by building a machine learning classification engine. It analyzes behavioral telemetry (amount spent on food, app opens, spatial proximity to VIP zones) to calculate a "Propensity to Upgrade" score, automatically dispatching targeted push notifications to high-value users.
          </p>

          <div className="bg-[#0e0a17] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> GA Cohort Selector
               </h3>
             </div>

             <div className="grid grid-cols-3 gap-3 mb-6">
                 {users.map(user => (
                     <button 
                         key={user.id}
                         onClick={() => {
                             setActiveUserId(user.id);
                             setScoreResult(null);
                         }}
                         disabled={isScoring}
                         className={`p-3 rounded-xl border text-left transition-all ${
                             activeUserId === user.id ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                         } ${isScoring ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                         <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeUserId === user.id ? 'text-purple-400' : 'text-slate-500'}`}>{user.name}</div>
                         <div className="text-[9px] text-slate-400 truncate">{user.plan}</div>
                     </button>
                 ))}
             </div>
             
             {/* Behavioral Telemetry */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-4 flex justify-between items-center">
                 <div>
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Live Telemetry Vectors</span>
                     <div className="flex space-x-4 text-[10px] font-mono text-slate-300">
                         <div className="flex flex-col">
                             <span className="text-slate-500 uppercase mb-0.5">F&B Spend</span>
                             <span className="text-white font-bold">${activeUser.metrics.foodSpent.toFixed(2)}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-slate-500 uppercase mb-0.5">App Opens</span>
                             <span className="text-white font-bold">{activeUser.metrics.appOpens}x</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-slate-500 uppercase mb-0.5">VIP Proximity</span>
                             <span className="text-white font-bold">{activeUser.metrics.vipProximityMin} min</span>
                         </div>
                     </div>
                 </div>
                 <button 
                     onClick={runModel}
                     disabled={isScoring}
                     className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition shadow-md whitespace-nowrap"
                 >
                     {isScoring ? 'Executing...' : 'Run ML Model'}
                 </button>
             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#050308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Data Science Pipeline</span>
                 {isScoring && <span className="text-purple-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-fuchsia-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Marketing Hub</span>
                      <span className="text-xs text-white font-bold">VIP Upsell Automation</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* User Profile Summary */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
                      <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-lg mr-3">👤</div>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{activeUser.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">{activeUser.plan}</span>
                          </div>
                      </div>
                  </div>

                  {/* ML Result Area */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                      
                      {isScoring ? (
                          <div className="flex flex-col items-center">
                              {/* Animated AI effect */}
                              <div className="relative w-32 h-32 mb-4">
                                  <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full"></div>
                                  <div className="absolute inset-2 border-2 border-fuchsia-500/40 rounded-full border-t-transparent animate-spin" style={{animationDuration: '1s'}}></div>
                                  <div className="absolute inset-6 border-2 border-pink-500/50 rounded-full border-b-transparent animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
                                  <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
                              </div>
                              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest animate-pulse">Running Neural Net...</span>
                          </div>
                      ) : scoreResult !== null ? (
                          <div className="w-full animate-fade-in-up flex flex-col items-center">
                              
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Upgrade Propensity Score</span>
                              
                              <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                                  {/* Donut Chart SVG */}
                                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                      <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="12" />
                                      <circle 
                                          cx="80" cy="80" r="70" fill="none" 
                                          stroke={scoreResult > 75 ? '#d946ef' : scoreResult > 40 ? '#3b82f6' : '#64748b'} 
                                          strokeWidth="12" 
                                          strokeDasharray="439.8" 
                                          strokeDashoffset={439.8 - (439.8 * scoreResult) / 100}
                                          strokeLinecap="round"
                                          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                      />
                                  </svg>
                                  <div className="flex flex-col items-center z-10">
                                      <span className={`text-4xl font-black font-mono ${scoreResult > 75 ? 'text-fuchsia-400' : scoreResult > 40 ? 'text-blue-400' : 'text-slate-400'}`}>
                                          {scoreResult}%
                                      </span>
                                  </div>
                              </div>

                              {/* Automated Action */}
                              {scoreResult > 75 ? (
                                  <div className="w-full bg-fuchsia-950/30 border border-fuchsia-500/50 rounded-xl p-4 text-center relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 animate-pulse"></div>
                                      <div className="text-[10px] text-fuchsia-400 font-black uppercase tracking-widest mb-2 flex items-center justify-center relative z-10">
                                          <span className="mr-1">💸</span> Marketing Webhook Fired
                                      </div>
                                      <p className="text-xs text-fuchsia-200/80 relative z-10">Push Notification Sent: "Hey David! Having fun? Upgrade to VIP for the rest of the weekend for 25% off!"</p>
                                  </div>
                              ) : (
                                  <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center justify-center">
                                          <span className="mr-1">🛑</span> Action Suppressed
                                      </div>
                                      <p className="text-xs text-slate-400">User classified as Low-Propensity. Notification suppressed to prevent spam and app uninstalls.</p>
                                  </div>
                              )}

                          </div>
                      ) : (
                          <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                              Awaiting Model Execution
                          </div>
                      )}
                      
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0e0a17] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">Predictive ML Upselling:</span>
               Select <span className="text-white font-bold bg-slate-800 px-1 rounded">David Chen</span> and click <span className="text-white font-bold bg-purple-600 px-1 rounded">Run ML Model</span>. The algorithm analyzes his behavior (spent $185 on food, opened the app 32 times, loitered near VIP for 145 mins). It calculates an 88% chance he wants to upgrade. The backend instantly hooks into the marketing API to push a targeted 25% discount, converting a highly likely upsell.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default VIPPropensityScoring;
