/* eslint-disable */
import React, { useState, useEffect } from 'react';

const JWTTokenRotation = () => {
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [attackerIntercepted, setAttackerIntercepted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('ACTIVE'); // 'ACTIVE', 'COMPROMISED', 'REVOKED'
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Auth Server initialized. Sessions Active.' }
  ]);

  const simulateAttack = () => {
      setIsSimulating(true);
      setAttackerIntercepted(false);
      setSessionStatus('ACTIVE');
      setActiveStep(1);
      
      addLog('WARN', 'Attacker sniffing public Wi-Fi traffic...');
      
      setTimeout(() => {
          setActiveStep(2);
          setAttackerIntercepted(true);
          
          if (isRotationEnabled) {
              addLog('CRIT', 'Attacker intercepted old Refresh Token (Family ID: 8XF2).');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('ACTION', 'Attacker attempting to mint new Access Token using stolen Refresh Token...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setSessionStatus('REVOKED');
                      setIsSimulating(false);
                      addLog('SUCCESS', 'Auth Server detected Token Reuse Anomaly! Token Family 8XF2 instantly revoked.');
                      addLog('SYS', 'Both Attacker and Legitimate User forced to re-authenticate. Tickets secured.');
                  }, 1500);
              }, 1500);
              
          } else {
              addLog('CRIT', 'Attacker intercepted long-lived Access Token (Valid for 24h).');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('ACTION', 'Attacker authenticating to API using stolen Access Token...');
                  setSessionStatus('COMPROMISED');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsSimulating(false);
                      addLog('CRIT', 'API accepted valid token. Attacker successfully transferred VIP tickets. Total Loss.');
                  }, 1500);
              }, 1500);
          }
      }, 1500);
  };

  const toggleRotation = () => {
      const newState = !isRotationEnabled;
      setIsRotationEnabled(newState);
      setSessionStatus('ACTIVE');
      setAttackerIntercepted(false);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Strict JWT Rotation enabled. Access tokens expire in 5m. Refresh Token reuse detection active.');
      } else {
          addLog('CRIT', 'Legacy Auth enabled. Access tokens live for 24h. No reuse detection.');
      }
  };
  
  const resetDemo = () => {
      setSessionStatus('ACTIVE');
      setAttackerIntercepted(false);
      setIsSimulating(false);
      setActiveStep(0);
      addLog('SYS', 'Tokens reset. Legitimate User session restored.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050207] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-violet-900/40 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔑</span> Authentication & API Security
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Strict JWT Token <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500">Rotation & Revocation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            If a user's JSON Web Token (JWT) is intercepted on public Wi-Fi, the attacker has permanent access to transfer the user's tickets until that token expires (often 24 hours later). Eventra solves this by implementing strict JWT token rotation. Access tokens are short-lived (5 minutes). When the frontend uses a refresh token to get a new access token, the old refresh token is invalidated. If an attacker tries to use the stolen old token, the backend detects the "Token Reuse" anomaly and instantly revokes all active sessions for that user.
          </p>

          <div className="bg-[#0b0312] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-violet-500 text-lg mr-2">🎛️</span> Auth Gateway Rules
               </h3>
               {activeStep === 4 && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Session</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Rotation Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">JWT Security Policy</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isRotationEnabled ? 'Active: Token Families & Reuse Detection' : 'Inactive: Legacy 24h Static Tokens'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleRotation}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isRotationEnabled ? 'bg-violet-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isRotationEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={simulateAttack}
                     disabled={isSimulating || activeStep === 4}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         activeStep === 4 ? 'bg-slate-800 text-violet-500 border-violet-900 cursor-not-allowed' :
                         isSimulating ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-violet-600 hover:bg-violet-500 text-white border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                     }`}
                 >
                     {isSimulating ? 'Executing Attack Vector...' : activeStep === 4 ? 'Simulation Complete' : "Simulate Session Hijacking"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040106] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Auth Audit Logs</span>
                 {isSimulating && <span className="text-violet-400 font-black animate-pulse">DETECTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' : 
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Security Architecture Simulator</span>
                      <span className="text-xs text-white font-bold">Token Reuse Anomaly Detection</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Top: Users */}
                  <div className="w-full flex justify-between px-2 z-20">
                      
                      {/* Legitimate User */}
                      <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl mb-2 transition-colors ${
                              sessionStatus === 'REVOKED' ? 'bg-slate-800 border-slate-600 opacity-50' : 'bg-slate-800 border-blue-500'
                          }`}>👨‍💻</div>
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-700 text-center">User (Alice)<br/>(Valid Client)</span>
                          
                          <div className="mt-3 text-[8px] font-mono text-slate-400 text-center">
                              {sessionStatus === 'REVOKED' ? (
                                  <span className="text-rose-400 block font-bold mt-1">Logged Out</span>
                              ) : (
                                  <>
                                      <span className="block mb-1">State: Active</span>
                                      <span className="bg-slate-800 px-1 rounded block">AT: ...eyJhbG</span>
                                      <span className="bg-slate-800 px-1 rounded mt-1 block">{isRotationEnabled ? 'RT: (v2)' : 'RT: None'}</span>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Attacker */}
                      <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl mb-2 transition-colors ${
                              activeStep >= 2 ? 'bg-rose-950/50 border-rose-500' : 'bg-slate-800 border-slate-600'
                          }`}>🥷</div>
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-rose-950/30 px-2 py-1 rounded border border-rose-900/50 text-center">Attacker<br/>(Public Wi-Fi)</span>
                          
                          {attackerIntercepted && (
                              <div className="mt-3 text-[8px] font-mono text-center animate-fade-in-up">
                                  {isRotationEnabled ? (
                                      <span className="bg-rose-900/30 text-rose-400 px-1 rounded border border-rose-500 block font-bold">Stolen RT: (v1)</span>
                                  ) : (
                                      <span className="bg-rose-900/30 text-rose-400 px-1 rounded border border-rose-500 block font-bold">Stolen AT: ...eyJhbG</span>
                                  )}
                              </div>
                          )}
                      </div>

                  </div>

                  {/* Intercept Animation Line */}
                  {activeStep === 1 && (
                      <div className="absolute top-28 left-16 right-16 h-0.5 bg-rose-500/50 overflow-hidden z-10">
                          <div className="w-8 h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] animate-[slide_1.5s_linear_infinite]"></div>
                      </div>
                  )}
                  {activeStep >= 3 && (
                      <div className="absolute top-28 right-24 bottom-32 w-0.5 bg-rose-500/50 z-10">
                          <div className="w-full h-8 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] animate-[drop_1.5s_linear_infinite]"></div>
                      </div>
                  )}

                  {/* Bottom: Auth Server */}
                  <div className="w-full flex flex-col items-center z-20 mt-4">
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-all duration-500 ${
                          sessionStatus === 'REVOKED' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-950/20' : 
                          sessionStatus === 'COMPROMISED' ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)] bg-rose-950/20' : 
                          'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                  <span className="text-lg mr-2">🛡️</span> Auth Gateway
                              </span>
                          </div>

                          <div className="text-[9px] font-mono flex flex-col space-y-1 h-[60px] justify-center">
                              {sessionStatus === 'REVOKED' ? (
                                  <div className="text-emerald-400 animate-fade-in-up">
                                      <span className="font-bold text-emerald-500 block">// ANOMALY: REFRESH TOKEN REUSE DETECTED</span>
                                      Attacker attempted to use RT(v1).<br/>
                                      Current expected is RT(v2).<br/>
                                      Action: Destroying entire Token Family.
                                  </div>
                              ) : sessionStatus === 'COMPROMISED' ? (
                                  <div className="text-rose-400 animate-fade-in-up">
                                      <span className="font-bold block">// API GATEWAY ACCEPTED</span>
                                      Valid Access Token presented.<br/>
                                      Action: Initiating Ticket Transfer...
                                  </div>
                              ) : (
                                  <div className="text-slate-500">
                                      {isRotationEnabled ? 'Tracking Token Family [8XF2]...' : 'Validating static signatures...'}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Overlays */}
                  {sessionStatus === 'COMPROMISED' && (
                      <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm rounded-xl border-2 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">💸</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">Tickets Stolen<br/><span className="text-[10px] font-normal text-rose-200 mt-1 block">Account Compromised</span></span>
                      </div>
                  )}

                  {sessionStatus === 'REVOKED' && (
                      <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-sm rounded-xl border-2 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">🛡️</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">Attack Prevented<br/><span className="text-[10px] font-normal text-emerald-200 mt-1 block">All Sessions Revoked Instantly</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0312] p-4 rounded-xl border border-violet-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-violet-400 uppercase block mb-1">Cybersecurity Threat Vectors:</span>
               With Rotation disabled, click <span className="text-white font-bold bg-slate-800 px-1 rounded">Simulate</span>. The attacker intercepts the long-lived Access Token on Wi-Fi and uses it directly against the API. The API blindly accepts it, and the tickets are stolen.<br/><br/>Now, toggle <span className="text-white font-bold bg-violet-600 px-1 rounded">JWT Security Policy</span> ON. Access tokens live for 5m. The attacker intercepts an old Refresh Token instead. When the attacker tries to use it, the Auth Server detects the anomaly (Token Reuse), instantly realizes the account is under attack, and revokes <i>all</i> tokens in that family, blocking the hacker and protecting the tickets.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes drop {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default JWTTokenRotation;
