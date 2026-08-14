/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BehavioralBiometricsLogin = () => {
  const [isMlEnabled, setIsMlEnabled] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // null, 'PASS', 'FAIL'
  const [loginType, setLoginType] = useState(null); // 'HUMAN', 'BOT'
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Auth Gateway online. Awaiting login events.' }
  ]);

  const simulateLogin = (type) => {
      setIsSimulating(true);
      setSimulationComplete(false);
      setAuthStatus(null);
      setLoginType(type);
      setActiveStep(1);
      
      if (type === 'HUMAN') {
          addLog('ACTION', 'User manually typing password on mobile keyboard...');
      } else {
          addLog('CRIT', 'Automated Bot initiating credential stuffing attack. Pasting stolen password in 1ms.');
      }
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isMlEnabled) {
              addLog('SYS', 'Telemetry collected: Keystroke Flight Time (ms), Swipe Velocity (px/s).');
              addLog('SYS', 'Executing Behavioral Biometrics ML Inference against user baseline profile...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  
                  if (type === 'HUMAN') {
                      addLog('SUCCESS', 'ML Inference: Telemetry matches historical baseline. Trust Score: 98%.');
                      
                      setTimeout(() => {
                          setActiveStep(4);
                          setAuthStatus('PASS');
                          setIsSimulating(false);
                          setSimulationComplete(true);
                          addLog('SUCCESS', 'Frictionless Auth successful. User granted access.');
                      }, 1200);
                      
                  } else {
                      addLog('CRIT', 'ML Inference: Anomalous non-human typing cadence detected. Trust Score: 1%.');
                      
                      setTimeout(() => {
                          setActiveStep(4);
                          setAuthStatus('FAIL');
                          setIsSimulating(false);
                          setSimulationComplete(true);
                          addLog('WARN', 'Account Takeover Prevented! High-friction FaceID re-authentication triggered.');
                      }, 1200);
                  }
              }, 1500);
              
          } else {
              // Legacy Auth - No ML
              addLog('WARN', 'Legacy Auth: Checking raw plaintext password against database hash...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Password Hash Match: TRUE');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setAuthStatus('PASS');
                      setIsSimulating(false);
                      setSimulationComplete(true);
                      
                      if (type === 'BOT') {
                          addLog('CRIT', 'API blindly accepted stolen credentials. Account hijacked. Tickets compromised.');
                      } else {
                          addLog('SUCCESS', 'Auth successful. User granted access.');
                      }
                  }, 1200);
              }, 1200);
          }
      }, 1500);
  };

  const toggleML = () => {
      const newState = !isMlEnabled;
      setIsMlEnabled(newState);
      setSimulationComplete(false);
      setAuthStatus(null);
      setLoginType(null);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Behavioral Biometrics ML Pipeline activated. Keystroke dynamics monitoring enabled.');
      } else {
          addLog('CRIT', 'ML Pipeline deactivated. Reverting to legacy password hash validation only.');
      }
  };
  
  const resetSimulation = () => {
      setSimulationComplete(false);
      setAuthStatus(null);
      setLoginType(null);
      setIsSimulating(false);
      setActiveStep(0);
      addLog('SYS', 'Auth Gateway reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030206] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Cybersecurity & Machine Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Behavioral Biometrics <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-500">Account Takeover Prevention</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Hackers frequently buy stolen passwords on the dark web and run automated credential stuffing attacks to hijack user accounts and steal expensive VIP tickets, easily bypassing standard email/password checks. Eventra solves this by implementing a Behavioral Biometrics Machine Learning pipeline. The frontend records the user's unique typing cadence and swipe velocity. If the telemetry drastically deviates from the user's historical profile (e.g., a bot pasting a password in 1ms), the backend intercepts the login and triggers a high-friction biometric challenge (FaceID).
          </p>

          <div className="bg-[#0b0714] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Identity & Access Control
               </h3>
               {simulationComplete && (
                   <button onClick={resetSimulation} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Auth State</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* ML Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Behavioral Biometrics (ML)</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isMlEnabled ? 'Active: Keystroke Dynamics & Swipe Velocity' : 'Inactive: Legacy Password Validation Only'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleML}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isMlEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isMlEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-4">
                     <button 
                         onClick={() => simulateLogin('HUMAN')}
                         disabled={isSimulating || simulationComplete}
                         className={`py-4 rounded-xl border font-black text-xs uppercase tracking-widest transition-colors flex flex-col items-center justify-center ${
                             simulationComplete || isSimulating ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 
                             'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 shadow-lg'
                         }`}
                     >
                         <span className="text-xl mb-1">👩‍💻</span>
                         Simulate Human Login
                     </button>
                     
                     <button 
                         onClick={() => simulateLogin('BOT')}
                         disabled={isSimulating || simulationComplete}
                         className={`py-4 rounded-xl border font-black text-xs uppercase tracking-widest transition-colors flex flex-col items-center justify-center shadow-lg ${
                             simulationComplete || isSimulating ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 
                             isMlEnabled ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]' :
                             'bg-rose-900 hover:bg-rose-800 text-rose-100 border-rose-500'
                         }`}
                     >
                         <span className="text-xl mb-1">🤖</span>
                         Simulate Bot Attack
                     </button>
                 </div>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040208] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Identity Provider Logs</span>
                 {isSimulating && <span className="text-indigo-400 font-black animate-pulse">ANALYZING...</span>}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Authentication ML Pipeline</span>
                      <span className="text-xs text-white font-bold">Telemetry Inference Engine</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Top: Client Device Telemetry */}
                  <div className="w-full flex flex-col items-center z-20">
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-all duration-500 ${
                          activeStep >= 1 ? (loginType === 'BOT' ? 'border-rose-500 bg-rose-950/20' : 'border-indigo-500 bg-indigo-950/20') : 'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                  <span className="text-lg mr-2">📱</span> Client Telemetry Node
                              </span>
                          </div>

                          <div className="text-[9px] font-mono flex flex-col space-y-2 h-[60px] justify-center">
                              {activeStep >= 1 ? (
                                  loginType === 'BOT' ? (
                                      <div className="text-rose-400 animate-fade-in-up">
                                          <span className="font-bold text-rose-500 block uppercase tracking-widest mb-1">// Raw Telemetry Collected</span>
                                          Input Source: Automated Script<br/>
                                          Flight Time (Key to Key): <span className="font-bold">0.01ms</span><br/>
                                          Dwell Time: <span className="font-bold">0.00ms (Pasted)</span>
                                      </div>
                                  ) : (
                                      <div className="text-indigo-400 animate-fade-in-up">
                                          <span className="font-bold text-indigo-500 block uppercase tracking-widest mb-1">// Raw Telemetry Collected</span>
                                          Input Source: Touchscreen<br/>
                                          Flight Time (Key to Key): <span className="font-bold">345ms (Avg)</span><br/>
                                          Dwell Time: <span className="font-bold">85ms (Avg)</span>
                                      </div>
                                  )
                              ) : (
                                  <div className="text-slate-500 text-center uppercase tracking-widest">Waiting for input...</div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Intercept Animation Line */}
                  {activeStep === 2 && (
                      <div className="absolute top-36 right-24 bottom-32 w-0.5 bg-indigo-500/50 z-10">
                          <div className="w-full h-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)] animate-[drop_1s_linear_infinite]"></div>
                      </div>
                  )}

                  {/* Bottom: Auth Server / ML Model */}
                  <div className="w-full flex flex-col items-center z-20 mt-4">
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-all duration-500 ${
                          authStatus === 'PASS' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-950/20' : 
                          authStatus === 'FAIL' ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-amber-950/20' : 
                          'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                  <span className="text-lg mr-2">🧠</span> IAM Auth Backend
                              </span>
                          </div>

                          <div className="text-[9px] font-mono flex flex-col space-y-1 h-[60px] justify-center">
                              {activeStep >= 3 ? (
                                  isMlEnabled ? (
                                      loginType === 'BOT' ? (
                                          <div className="text-amber-400 animate-fade-in-up">
                                              <span className="font-bold block uppercase tracking-widest mb-1">// ML Inference Result</span>
                                              Match vs Baseline: <span className="text-rose-500 font-bold">0.02% (Anomalous)</span><br/>
                                              Trust Score: <span className="text-rose-500 font-bold">1/100</span><br/>
                                              Action: BLOCK and Trigger FaceID.
                                          </div>
                                      ) : (
                                          <div className="text-emerald-400 animate-fade-in-up">
                                              <span className="font-bold block uppercase tracking-widest mb-1">// ML Inference Result</span>
                                              Match vs Baseline: <span className="font-bold">94.5% (Typical)</span><br/>
                                              Trust Score: <span className="font-bold">98/100</span><br/>
                                              Action: ALLOW frictionless login.
                                          </div>
                                      )
                                  ) : (
                                      <div className="text-slate-400 animate-fade-in-up">
                                          <span className="font-bold text-slate-300 block uppercase tracking-widest mb-1">// Legacy Hash Check</span>
                                          Password Hash Match: <span className="text-emerald-400 font-bold">TRUE</span><br/>
                                          Action: ALLOW login.
                                      </div>
                                  )
                              ) : (
                                  <div className="text-slate-500">
                                      {isMlEnabled ? 'ML Model loaded. Awaiting telemetry...' : 'Awaiting password hash...'}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Overlays */}
                  {simulationComplete && !isMlEnabled && loginType === 'BOT' && (
                      <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm rounded-xl border-2 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">💸</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">Account Hijacked<br/><span className="text-[10px] font-normal text-rose-200 mt-1 block">API blindly accepted stolen credentials</span></span>
                      </div>
                  )}
                  
                  {simulationComplete && isMlEnabled && loginType === 'BOT' && (
                      <div className="absolute inset-0 bg-amber-900/90 backdrop-blur-sm rounded-xl border-2 border-amber-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">🛡️</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">Takeover Prevented<br/><span className="text-[10px] font-normal text-amber-200 mt-1 block">ML detected bot keystrokes.<br/>FaceID requested.</span></span>
                      </div>
                  )}

                  {simulationComplete && loginType === 'HUMAN' && (
                      <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-sm rounded-xl border-2 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">✅</span>
                          <span className="text-xs font-black uppercase tracking-widest text-center">Auth Successful<br/><span className="text-[10px] font-normal text-emerald-200 mt-1 block">Frictionless login complete</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0714] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Zero-Trust Biometrics:</span>
               With ML disabled, click <span className="text-rose-300 font-bold bg-rose-950 px-1 rounded">Simulate Bot Attack</span>. The hacker uses a stolen password. The legacy API only checks if the hash matches. It does, so it grants access, and the tickets are stolen.<br/><br/>Toggle <span className="text-white font-bold bg-indigo-600 px-1 rounded">Behavioral Biometrics (ML)</span> ON and run the bot attack again. The ML engine analyzes the keystroke telemetry. It notices the password was pasted in 1ms (impossible for a human). It blocks the frictionless login and triggers a biometric FaceID challenge, stopping the hacker cold.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
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

export default BehavioralBiometricsLogin;
