/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveChurnAnalysis = () => {
  const [activeUserId, setActiveUserId] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Data Science pipeline ready. Awaiting layaway cohort data.' }
  ]);

  const users = [
      {
          id: 1,
          name: 'Sarah Jenkins',
          plan: 'VIP 4-Month Layaway',
          balance: 250.00,
          metrics: { appOpensLast30d: 45, emailsOpened: '12/12', friendsAdded: 8 },
          trueRisk: 12 // Low
      },
      {
          id: 2,
          name: 'Michael Torres',
          plan: 'GA 3-Month Layaway',
          balance: 150.00,
          metrics: { appOpensLast30d: 2, emailsOpened: '1/12', friendsAdded: 0 },
          trueRisk: 88 // High
      },
      {
          id: 3,
          name: 'Emma Watson',
          plan: 'GA+ 4-Month Layaway',
          balance: 199.50,
          metrics: { appOpensLast30d: 14, emailsOpened: '5/12', friendsAdded: 2 },
          trueRisk: 45 // Med
      }
  ];

  const activeUser = users.find(u => u.id === activeUserId);

  const runAnalysis = () => {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      addLog('ACTION', `Running classification algorithm (Random Forest) for User ID: ${activeUser.id}...`);
      
      setTimeout(() => {
          addLog('SYS', `Analyzing behavioral vectors: App Engagement, Email Open Rates, Social Graph.`);
          
          setTimeout(() => {
              setIsAnalyzing(false);
              setAnalysisResult(activeUser.trueRisk);
              
              if (activeUser.trueRisk > 75) {
                  addLog('CRIT', `High Default Risk Detected (${activeUser.trueRisk}%). User likely to churn.`);
                  addLog('SUCCESS', `Triggered automated marketing webhook -> 'Grace Period Offer Email' sent.`);
              } else {
                  addLog('SUCCESS', `Low Default Risk (${activeUser.trueRisk}%). User on track for final payment.`);
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
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📊</span> Data Science & Predictive Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Churn Analysis <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">for Payment Plans</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals sell out using layaway installment plans, but 15% of users default on their final payment, leaving organizers with unsold inventory days before the event. Eventra solves this by implementing a backend predictive classification algorithm. It analyzes user engagement (app opens, email opens, friends added) to calculate a "Default Risk Score." If a user is flagged as high-risk, the system automatically triggers targeted retention emails offering a grace period or downgrade option before the card actually bounces.
          </p>

          <div className="bg-[#0a111a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Customer Cohort Selector
               </h3>
             </div>

             <div className="grid grid-cols-3 gap-3 mb-6">
                 {users.map(user => (
                     <button 
                         key={user.id}
                         onClick={() => {
                             setActiveUserId(user.id);
                             setAnalysisResult(null);
                         }}
                         disabled={isAnalyzing}
                         className={`p-3 rounded-xl border text-left transition-all ${
                             activeUserId === user.id ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                         } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                         <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeUserId === user.id ? 'text-cyan-400' : 'text-slate-500'}`}>{user.name}</div>
                         <div className="text-[9px] text-slate-400 truncate">{user.plan}</div>
                     </button>
                 ))}
             </div>
             
             {/* Behavioral Telemetry */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-4 flex justify-between items-center">
                 <div>
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Behavioral Telemetry (Last 30d)</span>
                     <div className="flex space-x-4 text-xs font-mono text-slate-300">
                         <span>App Opens: <span className="text-white font-bold">{activeUser.metrics.appOpensLast30d}</span></span>
                         <span>Emails: <span className="text-white font-bold">{activeUser.metrics.emailsOpened}</span></span>
                         <span>Graph: <span className="text-white font-bold">{activeUser.metrics.friendsAdded} peers</span></span>
                     </div>
                 </div>
                 <button 
                     onClick={runAnalysis}
                     disabled={isAnalyzing}
                     className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition shadow-md whitespace-nowrap"
                 >
                     {isAnalyzing ? 'Analyzing...' : 'Run ML Pipeline'}
                 </button>
             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#04070a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Data Science Pipeline</span>
                 {isAnalyzing && <span className="text-cyan-400 font-black animate-pulse">PROCESSING CLASSIFICATION...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-orange-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">FinTech & Marketing Hub</span>
                      <span className="text-xs text-white font-bold">Churn Prediction Engine</span>
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
                      <div className="flex flex-col items-end">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Final Payment</span>
                          <span className="text-lg font-mono font-black text-slate-300">${activeUser.balance.toFixed(2)}</span>
                      </div>
                  </div>

                  {/* ML Result Area */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                      
                      {isAnalyzing ? (
                          <div className="flex flex-col items-center">
                              {/* Animated Radar/Scanning effect */}
                              <div className="relative w-32 h-32 mb-4">
                                  <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"></div>
                                  <div className="absolute inset-2 border-2 border-cyan-500/40 rounded-full border-t-transparent animate-spin" style={{animationDuration: '2s'}}></div>
                                  <div className="absolute inset-6 border-2 border-cyan-500/50 rounded-full border-b-transparent animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
                                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
                              </div>
                              <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-widest animate-pulse">Running Classification Model...</span>
                          </div>
                      ) : analysisResult !== null ? (
                          <div className="w-full animate-fade-in-up flex flex-col items-center">
                              
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Calculated Default Risk Score</span>
                              
                              <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                                  {/* Donut Chart SVG */}
                                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                      <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="12" />
                                      <circle 
                                          cx="80" cy="80" r="70" fill="none" 
                                          stroke={analysisResult > 75 ? '#f97316' : analysisResult > 40 ? '#eab308' : '#10b981'} 
                                          strokeWidth="12" 
                                          strokeDasharray="439.8" 
                                          strokeDashoffset={439.8 - (439.8 * analysisResult) / 100}
                                          strokeLinecap="round"
                                          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                      />
                                  </svg>
                                  <div className="flex flex-col items-center z-10">
                                      <span className={`text-4xl font-black font-mono ${analysisResult > 75 ? 'text-orange-500' : analysisResult > 40 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                          {analysisResult}%
                                      </span>
                                  </div>
                              </div>

                              {/* Automated Action */}
                              {analysisResult > 75 ? (
                                  <div className="w-full bg-orange-950/30 border border-orange-500/50 rounded-xl p-4 text-center">
                                      <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1 flex items-center justify-center">
                                          <span className="mr-1">⚡️</span> Automated Marketing Triggered
                                      </div>
                                      <p className="text-xs text-orange-200">User classified as High-Risk. A 14-day payment grace period offer has been successfully emailed to prevent cart abandonment.</p>
                                  </div>
                              ) : (
                                  <div className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 text-center">
                                      <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1 flex items-center justify-center">
                                          <span className="mr-1">✓</span> Healthy Engagement
                                      </div>
                                      <p className="text-xs text-emerald-200/70">User is highly engaged with the platform. Final payment projected to clear successfully.</p>
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
            <div className="w-full bg-[#0a111a] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">Behavioral Classification:</span>
               Select <span className="text-white font-bold bg-slate-800 px-1 rounded">Michael Torres</span> and click <span className="text-white font-bold bg-cyan-600 px-1 rounded">Run ML Pipeline</span>. The algorithm analyzes his poor engagement (only 2 app opens, 1 email read) and calculates an 88% risk of defaulting on his payment. To save the sale, the backend instantly hooks into the marketing API to send a targeted grace period offer, preventing the churn.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveChurnAnalysis;
