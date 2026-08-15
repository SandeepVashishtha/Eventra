/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BehavioralBotDetection = () => {
  const [activeProfile, setActiveProfile] = useState('HUMAN'); // HUMAN, BOT
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // null, PASS, BLOCK
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:59:00', type: 'SYS', msg: 'ML Bot Mitigation active on /checkout route.' }
  ]);

  const profiles = {
      HUMAN: {
          name: 'Real Fan',
          cursorEntropy: 87.4,
          typingSpeed: '42 WPM',
          clickCadence: 'Variable (200-800ms)',
          trajectory: 'Curved, erratic',
      },
      BOT: {
          name: 'Scalper Script',
          cursorEntropy: 0.1,
          typingSpeed: 'Instant (0ms)',
          clickCadence: 'Fixed (10ms)',
          trajectory: 'Perfect straight lines',
      }
  };

  const analyzeTelemetry = () => {
      setIsAnalyzing(true);
      setResult(null);
      addLog('ACTION', `Analyzing frontend DOM telemetry for ${profiles[activeProfile].name}...`);
      
      setTimeout(() => {
          addLog('SYS', 'Evaluating biomechanical entropy: cursor pathing, keystroke dynamics...');
          
          setTimeout(() => {
              setIsAnalyzing(false);
              
              if (activeProfile === 'HUMAN') {
                  setResult('PASS');
                  addLog('SUCCESS', `Entropy Score: 87.4%. Human biomechanics confirmed. Allow checkout.`);
              } else {
                  setResult('BLOCK');
                  addLog('CRIT', `Entropy Score: 0.1%. Robotic trajectory detected (Scalper Script).`);
                  addLog('WARN', `Silent mitigation engaged. Session shadow-banned. Serving fake 'Sold Out' inventory.`);
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
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Cybersecurity & Machine Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Behavioral Bot <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500">Detection Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Ticket scalper bots buy up 10,000 VIP tickets in 0.5 seconds by easily bypassing traditional picture CAPTCHAs, leaving real fans empty-handed. Eventra solves this by deploying a behavioral ML classification model on the frontend. It silently analyzes non-PII telemetry—cursor trajectories, typing speed, and click cadence. If the interaction lacks human biomechanical entropy (i.e., perfect straight lines), the backend silently shadow-bans the bot, protecting inventory.
          </p>

          <div className="bg-[#120505] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🎛️</span> Telemetry Simulator
               </h3>
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 <button 
                     onClick={() => { setActiveProfile('HUMAN'); setResult(null); }}
                     disabled={isAnalyzing}
                     className={`p-4 border rounded-xl text-left transition-all ${
                         activeProfile === 'HUMAN' ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800 opacity-50'
                     } ${isAnalyzing ? 'cursor-not-allowed' : 'hover:opacity-100'}`}
                 >
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-xl">🙋‍♂️</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${activeProfile === 'HUMAN' ? 'text-emerald-400' : 'text-slate-500'}`}>Simulate Human</span>
                     </div>
                     <span className="text-xs font-bold text-white block">Real Fan Checkout</span>
                     <span className="text-[9px] text-slate-400 font-mono mt-1 block">Entropy: High</span>
                 </button>

                 <button 
                     onClick={() => { setActiveProfile('BOT'); setResult(null); }}
                     disabled={isAnalyzing}
                     className={`p-4 border rounded-xl text-left transition-all ${
                         activeProfile === 'BOT' ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-slate-900 border-slate-800 opacity-50'
                     } ${isAnalyzing ? 'cursor-not-allowed' : 'hover:opacity-100'}`}
                 >
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-xl">🤖</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${activeProfile === 'BOT' ? 'text-rose-400' : 'text-slate-500'}`}>Simulate Bot</span>
                     </div>
                     <span className="text-xs font-bold text-white block">Scalper Script</span>
                     <span className="text-[9px] text-slate-400 font-mono mt-1 block">Entropy: Zero (0)</span>
                 </button>
                 
             </div>

             <button 
                 onClick={analyzeTelemetry}
                 disabled={isAnalyzing}
                 className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-600 uppercase tracking-widest text-xs transition-colors mb-4"
             >
                 {isAnalyzing ? 'Executing ML Classification...' : 'Analyze DOM Telemetry'}
             </button>
             
             {/* System Log */}
             <div className="h-28 bg-[#050202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Security Operations Center</span>
                 {isAnalyzing && <span className="text-rose-400 font-black animate-pulse">ANALYZING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-fuchsia-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">ML Classification Engine</span>
                      <span className="text-xs text-white font-bold">Biomechanical Entropy</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Trajectory Canvas */}
                  <div className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl mb-4 relative overflow-hidden">
                      <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-slate-500 uppercase">Cursor Vector Field</div>
                      
                      {activeProfile === 'HUMAN' ? (
                          <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M 10 90 Q 30 20, 50 60 T 90 10" fill="none" stroke="#10b981" strokeWidth="2" className="animate-[dash_2s_ease-out]" strokeDasharray="1000" strokeDashoffset="1000" />
                              <circle cx="90" cy="10" r="3" fill="#10b981" className="animate-[fade-in_2.5s_ease-out]" />
                          </svg>
                      ) : (
                          <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M 10 90 L 90 10" fill="none" stroke="#f43f5e" strokeWidth="2" className="animate-[dash_0.2s_linear]" strokeDasharray="1000" strokeDashoffset="1000" />
                              <circle cx="90" cy="10" r="3" fill="#f43f5e" className="animate-[fade-in_0.3s_ease-out]" />
                          </svg>
                      )}
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="w-full space-y-2 font-mono text-[10px] bg-slate-900 border border-slate-700 rounded-xl p-4">
                      
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-500">Biomechanical Entropy:</span>
                          <span className={`font-bold ${activeProfile === 'HUMAN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {profiles[activeProfile].cursorEntropy}%
                          </span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-500">Typing Velocity:</span>
                          <span className="text-white">
                              {profiles[activeProfile].typingSpeed}
                          </span>
                      </div>

                      <div className="flex justify-between items-center">
                          <span className="text-slate-500">Click Cadence:</span>
                          <span className="text-white">
                              {profiles[activeProfile].clickCadence}
                          </span>
                      </div>

                  </div>

                  {/* Final Result Overlay */}
                  {result && (
                      <div className={`mt-auto w-full border rounded-xl p-4 text-center animate-fade-in-up ${
                          result === 'PASS' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-rose-950/40 border-rose-500/50'
                      }`}>
                          <div className={`text-4xl mb-2 ${result === 'PASS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {result === 'PASS' ? '✅' : '🛑'}
                          </div>
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${result === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {result === 'PASS' ? 'Human Verified' : 'Robotic Automation Blocked'}
                          </div>
                          <p className={`text-[9px] ${result === 'PASS' ? 'text-emerald-200/70' : 'text-rose-200/70'}`}>
                              {result === 'PASS' 
                                  ? 'Telemetry proves organic, erratic biomechanical movement. Transaction allowed.' 
                                  : '0% entropy detected. Instantaneous execution indicates scripting. Session silently shadow-banned.'
                              }
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120505] p-4 rounded-xl border border-rose-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-rose-400 uppercase block mb-1">Silent Bot Mitigation:</span>
               Select <span className="text-white font-bold bg-slate-800 px-1 rounded">Simulate Bot</span> and click Analyze. Instead of annoying fans with CAPTCHAs, the frontend silently tracks user interactions. The ML model detects that the Bot's cursor moved in a mathematically perfect straight line, and its typing speed was 0ms (impossible for humans). Because the entropy score is 0%, the backend silently shadow-bans the session, feeding the bot fake "Sold Out" responses while saving the inventory for real fans.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default BehavioralBotDetection;
