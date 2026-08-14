/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebAuthnFIDO2 = () => {
  const [isFidoEnabled, setIsFidoEnabled] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackComplete, setAttackComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'IAM Identity Provider initialized. Awaiting user authentication.' }
  ]);

  const executeAttack = () => {
      setIsAttacking(true);
      setAttackComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'Attacker registered typo-squatted domain: "evnetra-vip.com" (Phishing).');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('WARN', '[Attacker] Sent phishing email to VIP User. User clicked link.');
          
          setTimeout(() => {
              setActiveStep(3);
              
              if (isFidoEnabled) {
                  addLog('SYS', '[Browser] navigator.credentials.get() invoked by evnetra-vip.com');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', '[WebAuthn] Checking Relying Party (RP) ID against Origin...');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('CRIT', '[FIDO2 Engine] Origin mismatch! Expected: eventra.com. Got: evnetra-vip.com');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsAttacking(false);
                              setAttackComplete(true);
                              addLog('SUCCESS', 'Hardware authenticator refused to sign the challenge. Phishing attack neutralized cryptographically.');
                          }, 1200);
                      }, 1200);
                  }, 1200);
                  
              } else {
                  // Legacy Password + SMS 2FA
                  addLog('WARN', '[Phishing Site] Displaying fake login form to User.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('CRIT', '[User] Typed password: "VIPPassword123!". Attacker harvested credentials.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('CRIT', '[Attacker] Executing SIM-Swap attack via telco social engineering... Intercepted SMS 2FA code: 849312.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsAttacking(false);
                              setAttackComplete(true);
                              addLog('CRIT', 'FATAL: Attacker bypassed 2FA and successfully logged into VIP Account. Tickets stolen.');
                          }, 1500);
                      }, 1800);
                  }, 1500);
              }
          }, 1500);
      }, 1000);
  };

  const toggleFido = () => {
      const newState = !isFidoEnabled;
      setIsFidoEnabled(newState);
      setAttackComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'FIDO2 WebAuthn protocol enabled. Passwords purged. Hardware authenticators (TouchID/YubiKey) required.');
      } else {
          addLog('CRIT', 'WebAuthn disabled. Falling back to easily-phishable Passwords + SMS 2FA.');
      }
  };

  const resetDemo = () => {
      setIsAttacking(false);
      setAttackComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Security session reset. Monitoring for authentication attempts.');
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
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Identity & Access Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            FIDO2 WebAuthn Integration <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Passwordless VIP Access</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            VIP users repeatedly have their highly valuable accounts compromised. They reuse weak passwords across multiple sites, making them vulnerable to credential stuffing. Even worse, attackers easily bypass SMS 2FA codes using targeted SIM-swapping attacks. Eventra solves this by implementing passwordless authentication via the FIDO2 WebAuthn API. Passwords are eliminated entirely. Instead, users register a hardware authenticator (like Apple TouchID, Windows Hello, or a YubiKey). During login, public-key cryptography is used. If an attacker tricks a user into visiting a phishing site, the WebAuthn API detects the domain mismatch and the hardware physically refuses to sign the login challenge—making the system mathematically immune to phishing.
          </p>

          <div className="bg-[#050b12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Authentication Configuration
               </h3>
               {attackComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset IAM Engine</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* FIDO Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">IAM Protocol</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isFidoEnabled ? 'Active: FIDO2 / WebAuthn (Hardware/Biometrics)' : 'Inactive: Legacy Passwords + SMS OTP (2FA)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleFido}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isFidoEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isFidoEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeAttack}
                     disabled={isAttacking || attackComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         attackComplete ? 'bg-slate-800 text-cyan-500 border-cyan-900 cursor-not-allowed' :
                         isAttacking ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                     }`}
                 >
                     {isAttacking ? 'Executing Phishing / SIM-Swap Attack...' : attackComplete ? 'Simulation Completed' : "Simulate Phishing Attack"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020407] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Identity Provider Audit Log</span>
                 {isAttacking && <span className="text-cyan-400 font-black animate-pulse">MONITORING...</span>}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Cryptographic Auth Flow</span>
                      <span className="text-xs text-white font-bold">Client-Server Handshake</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-between">
                  
                  {/* Attacker Phishing Site */}
                  <div className={`w-64 border-2 rounded-xl p-3 relative z-20 transition-all duration-300 ${
                      activeStep >= 1 ? 'border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-slate-800 bg-slate-900'
                  }`}>
                      <div className="absolute -top-3 -right-3 text-2xl">🥷</div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-1 flex items-center">
                          <span className="mr-1">🎣</span> Typo-Squatted Phishing Domain
                      </span>
                      <div className="bg-black/80 px-2 py-1 rounded border border-red-900 text-[10px] font-mono text-red-200 mb-2 truncate">
                          https://<span className="text-white font-bold bg-red-600 px-0.5 rounded">evnetra-vip</span>.com/login
                      </div>
                      
                      {/* Phishing Form */}
                      {!isFidoEnabled && activeStep >= 3 && (
                          <div className="bg-black p-2 rounded border border-slate-800 flex flex-col gap-1.5 animate-fade-in-up">
                              <input type="text" disabled value="vip@eventra.com" className="bg-slate-900 text-[9px] px-2 py-1 rounded border border-slate-700 text-slate-400" />
                              <div className="relative">
                                  <input type="password" disabled value={activeStep >= 4 ? 'VIPPassword123!' : ''} className="w-full bg-slate-900 text-[9px] px-2 py-1 rounded border border-slate-700 text-white" />
                                  {activeStep >= 4 && <span className="absolute right-2 top-1 text-[8px] text-red-500 font-bold animate-pulse">STOLEN!</span>}
                              </div>
                          </div>
                      )}
                      
                      {/* WebAuthn Prompt visually blocking the attacker */}
                      {isFidoEnabled && activeStep >= 3 && (
                          <div className="bg-black p-2 rounded border border-slate-800 flex flex-col items-center justify-center animate-fade-in-up py-4 relative overflow-hidden">
                              <span className="text-2xl mb-1">👆</span>
                              <span className="text-[9px] font-bold text-white">Touch ID for evnetra-vip.com</span>
                              
                              {/* The Cryptographic Block */}
                              {activeStep >= 5 && (
                                  <div className="absolute inset-0 bg-red-950/90 backdrop-blur border-2 border-red-500 flex flex-col items-center justify-center animate-[popIn_0.3s_ease-out_forwards]">
                                      <span className="text-xl mb-1">❌</span>
                                      <span className="text-[7px] font-black uppercase text-red-400">Origin Mismatch</span>
                                      <span className="text-[6px] font-mono text-red-200 text-center px-2 mt-1">Hardware refused to sign.<br/>(Expected eventra.com)</span>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {/* Intercept / Transmission Lines */}
                  <div className="flex-1 w-full relative z-10 flex justify-center items-center py-2">
                      {/* Line to Server */}
                      <div className="w-1 h-full bg-slate-800 relative">
                          {/* Attack Packets */}
                          {!isFidoEnabled && activeStep >= 4 && activeStep < 6 && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] animate-[drop_1.5s_linear_infinite]"></div>
                          )}
                          
                          {/* 2FA SIM Swap Intercept Line */}
                          {!isFidoEnabled && activeStep >= 5 && (
                              <div className="absolute top-1/2 left-0 w-32 h-1 bg-red-500 -translate-x-full shadow-[0_0_15px_rgba(239,68,68,1)] overflow-hidden">
                                  <div className="absolute top-1/2 -translate-y-1/2 right-0 bg-red-950 text-red-400 text-[6px] font-mono px-1 border border-red-500 rounded animate-[slideLeft_1s_linear_forwards]">
                                      SMS: 849312
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Eventra Identity Server */}
                  <div className={`w-64 border-2 rounded-xl p-4 relative z-10 transition-all duration-500 ${
                      !isFidoEnabled && activeStep >= 6 ? 'border-red-500 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 
                      isFidoEnabled && activeStep >= 6 ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-900'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">🛡️</span> Eventra IAM Server</span>
                      </span>
                      
                      <div className="bg-black/50 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-400 h-20 flex flex-col justify-center relative">
                          {!isFidoEnabled ? (
                              <div className="flex flex-col gap-1">
                                  <div className="flex justify-between">
                                      <span>Password Hash:</span>
                                      <span className={activeStep >= 6 ? "text-red-500 font-bold" : "text-slate-500"}>{activeStep >= 6 ? 'MATCH' : 'WAITING'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span>SMS 2FA Code:</span>
                                      <span className={activeStep >= 6 ? "text-red-500 font-bold" : "text-slate-500"}>{activeStep >= 6 ? 'MATCH' : 'WAITING'}</span>
                                  </div>
                                  {activeStep >= 6 && <div className="text-red-500 text-center font-bold mt-1 animate-pulse">ACCOUNT COMPROMISED</div>}
                              </div>
                          ) : (
                              <div className="flex flex-col gap-1 items-center">
                                  <span className="text-emerald-500 font-bold mb-1 border-b border-slate-800 pb-1">FIDO2 Public Key Crypto</span>
                                  {activeStep >= 6 ? (
                                      <div className="text-emerald-400 text-center animate-fade-in-up">
                                          Challenge signature null.<br/>Authentication aborted.
                                      </div>
                                  ) : (
                                      <div className="text-slate-500 text-center">Awaiting signed challenge...</div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Custom Keyframes */}
                  <style>{`
                      @keyframes drop {
                          0% { top: 0; }
                          100% { top: 100%; }
                      }
                      @keyframes slideLeft {
                          0% { right: 0; opacity: 1; }
                          100% { right: 100%; opacity: 0; }
                      }
                      @keyframes popIn {
                          0% { transform: scale(0.8); opacity: 0; }
                          50% { transform: scale(1.05); opacity: 1; }
                          100% { transform: scale(1); opacity: 1; }
                      }
                  `}</style>

                  {/* Overlays */}
                  {attackComplete && !isFidoEnabled && (
                      <div className="absolute inset-0 bg-red-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center shadow-2xl">
                          <span className="text-6xl mb-4">🚨</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-2 text-red-500">Security Breach</span>
                          <p className="text-[10px] text-red-200 leading-relaxed font-mono bg-red-900/50 p-3 rounded border border-red-500">
                              The VIP user fell for the phishing email and typed their password into the fake site. The attacker then used a SIM-Swap attack to intercept the SMS 2FA code. The account was fully compromised.
                          </p>
                      </div>
                  )}
                  
                  {attackComplete && isFidoEnabled && (
                      <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center shadow-2xl">
                          <span className="text-6xl mb-4">🛡️</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-2 text-emerald-400">Phishing Neutralized</span>
                          <p className="text-[10px] text-emerald-200 leading-relaxed font-mono bg-emerald-900/50 p-3 rounded border border-emerald-500">
                              Because passwords were eliminated, there was nothing for the user to type. The WebAuthn API detected that the phishing domain (`evnetra.com`) did not match the registered Relying Party (`eventra.com`). The hardware mathematically blocked the login, securing the account perfectly.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050b12] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">Phishing Resistance & WebAuthn:</span>
               With FIDO2 OFF, click Simulate Phishing. The VIP user clicks a link to a fake "evnetra.com" site. They type their weak password, which the attacker immediately steals. Even with 2FA enabled, the attacker uses SIM-swapping to intercept the SMS code, easily taking over the account.<br/><br/>Toggle <span className="text-cyan-400 font-bold bg-slate-800 px-1 rounded">IAM Protocol</span> ON. Passwords are gone. The user authenticates using their laptop's TouchID. When they click the phishing link, the browser's WebAuthn API compares the fraudulent domain against the registered origin. Because they don't match, the physical hardware authenticator strictly refuses to generate the cryptographic signature. The attacker gets absolutely nothing.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WebAuthnFIDO2;
