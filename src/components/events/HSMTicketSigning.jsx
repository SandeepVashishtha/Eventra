/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HSMTicketSigning = () => {
  const [isHsmEnabled, setIsHsmEnabled] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackComplete, setAttackComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Eventra Backend initialized. Cryptographic ticket signing active.' }
  ]);

  const executeAttack = () => {
      setIsAttacking(true);
      setAttackComplete(false);
      setActiveStep(1);
      
      addLog('CRIT', 'WARNING: Remote Code Execution (RCE) payload detected on Node.js server!');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('WARN', '[Attacker] Shell access granted. Attempting to locate RSA Master Key...');
          
          setTimeout(() => {
              setActiveStep(3);
              
              if (isHsmEnabled) {
                  addLog('SYS', '[Attacker] Executing: printenv | grep PRIVATE_KEY');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', '[Attacker] Result: null. Key not found in application layer.');
                      addLog('SYS', '[Attacker] Attempting to extract key from CloudHSM...');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('CRIT', 'AWS CloudHSM rejected physical memory read attempt.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsAttacking(false);
                              setAttackComplete(true);
                              addLog('SUCCESS', 'Attack thwarted! Master Key remains physically secure inside HSM hardware.');
                          }, 1000);
                      }, 1200);
                  }, 1200);
                  
              } else {
                  // Legacy Env Var
                  addLog('SYS', '[Attacker] Executing: cat .env | grep PRIVATE_KEY');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('CRIT', '[Attacker] Successfully extracted: "BEGIN RSA PRIVATE KEY..."');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('WARN', '[Attacker] Master Key stolen. Generating forged VIP signatures offline.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsAttacking(false);
                              setAttackComplete(true);
                              addLog('CRIT', 'CATASTROPHIC FAILURE: Attacker minted 10,000 fake VIP tickets. $4M lost.');
                          }, 1500);
                      }, 1200);
                  }, 1200);
              }
          }, 1500);
      }, 1000);
  };

  const toggleHsm = () => {
      const newState = !isHsmEnabled;
      setIsHsmEnabled(newState);
      setAttackComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'AWS CloudHSM integrated. Private keys purged from application memory.');
      } else {
          addLog('CRIT', 'HSM disconnected. Master Key loaded dangerously into process.env variables.');
      }
  };

  const resetDemo = () => {
      setIsAttacking(false);
      setAttackComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Server restarted. Monitoring for RCE vulnerabilities.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060402] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Cyber Security & Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Hardware Security Module <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">(HSM) Master Ticket Signing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The RSA private key used to cryptographically sign valid digital tickets is currently stored as an environment variable in the Node.js backend. If an attacker discovers a vulnerability and gains Remote Code Execution (RCE) on the server, they can easily extract the key and mint infinite fake VIP tickets, destroying the festival economy. Eventra solves this by integrating AWS CloudHSM (a physical Hardware Security Module). The ticket signing logic is moved entirely outside the application layer. The backend sends the raw ticket to the HSM, and the HSM returns the signature. The private key physically cannot be extracted from the FIPS 140-2 validated hardware, even by a root server administrator.
          </p>

          <div className="bg-[#120a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🎛️</span> Cryptographic Architecture
               </h3>
               {attackComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Environment</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* HSM Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Key Management Strategy</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isHsmEnabled ? 'Active: CloudHSM (FIPS 140-2 Hardware)' : 'Inactive: .env Variables (Application Memory)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleHsm}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isHsmEnabled ? 'bg-amber-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isHsmEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeAttack}
                     disabled={isAttacking || attackComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         attackComplete ? 'bg-slate-800 text-amber-500 border-amber-900 cursor-not-allowed' :
                         isAttacking ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-red-900 hover:bg-red-800 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                     }`}
                 >
                     {isAttacking ? 'Executing RCE Exploit...' : attackComplete ? 'Attack Concluded' : "Simulate Zero-Day RCE Attack"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Security Operations Center (SOC) Log</span>
                 {isAttacking && <span className="text-red-500 font-black animate-pulse">BREACH IN PROGRESS...</span>}
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
                       log.type === 'SYS' ? 'text-amber-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Threat Visualizer</span>
                      <span className="text-xs text-white font-bold">Server Architecture</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-between">
                  
                  {/* Attacker Node */}
                  {activeStep >= 1 && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 bg-red-950/80 border-2 border-red-500 rounded-xl p-3 z-30 animate-fade-in-up shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-col items-center backdrop-blur-sm">
                          <span className="text-2xl mb-1">🥷</span>
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Malicious Actor</span>
                          
                          {activeStep >= 2 && (
                              <div className="mt-2 w-full bg-black/80 p-2 rounded border border-red-900 font-mono text-[8px] text-red-500 leading-tight">
                                  <div className="text-white">$ whoami</div>
                                  <div>root</div>
                                  {activeStep >= 3 && (
                                      <>
                                          <div className="text-white mt-1">$ cat .env | grep KEY</div>
                                          {isHsmEnabled ? (
                                              <div className="text-slate-500 italic">No output...</div>
                                          ) : activeStep >= 4 ? (
                                              <div className="text-emerald-400">PRIVATE_KEY="BEGIN RSA..."</div>
                                          ) : (
                                              <div className="animate-pulse">reading...</div>
                                          )}
                                      </>
                                  )}
                              </div>
                          )}
                      </div>
                  )}
                  
                  {/* Exploit Line */}
                  {activeStep >= 2 && (
                      <div className="absolute top-24 bottom-[40%] left-1/2 -translate-x-1/2 w-1 bg-red-500/50 z-20 shadow-[0_0_15px_rgba(239,68,68,1)]">
                          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                  )}

                  {/* Node.js Server Node */}
                  <div className={`w-64 border-2 rounded-xl p-4 mt-auto mb-auto relative z-10 transition-all duration-500 ${
                      activeStep >= 2 ? 'border-red-500 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-slate-700 bg-slate-900'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-3 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">⚙️</span> Node.js App Server</span>
                          {activeStep >= 2 && <span className="text-red-500 text-[8px] animate-pulse">COMPROMISED</span>}
                      </span>
                      
                      <div className="bg-black/50 p-3 rounded border border-slate-800 font-mono text-[9px] text-slate-400 relative">
                          <span className="block mb-2 font-bold text-white border-b border-slate-800 pb-1">Application Memory</span>
                          <div className="flex justify-between items-center mb-1">
                              <span>DB_PASSWORD:</span>
                              <span className="text-emerald-500">"supersecret"</span>
                          </div>
                          <div className="flex justify-between items-center relative">
                              <span>PRIVATE_KEY:</span>
                              {!isHsmEnabled ? (
                                  <span className={`transition-colors ${activeStep >= 4 ? 'text-red-500 font-bold bg-red-950/50 px-1 rounded' : 'text-emerald-500'}`}>
                                      "BEGIN RSA..."
                                  </span>
                              ) : (
                                  <span className="text-slate-600 italic">null (Delegated)</span>
                              )}
                              
                              {/* Extraction Animation */}
                              {!isHsmEnabled && activeStep >= 4 && activeStep < 5 && (
                                  <div className="absolute right-0 -top-8 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] animate-[moveUp_1s_ease-in_forwards]"></div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* CloudHSM Node */}
                  <div className={`w-64 border-2 rounded-xl p-4 mt-auto relative z-10 transition-all duration-500 ${
                      isHsmEnabled ? (activeStep >= 5 ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-amber-500 bg-amber-950/20') : 'border-slate-800 bg-slate-950 opacity-50 grayscale'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">🗄️</span> AWS CloudHSM (Hardware)</span>
                          {isHsmEnabled && <span className="bg-amber-900 text-amber-400 px-1 rounded text-[7px]">FIPS 140-2</span>}
                      </span>
                      
                      <div className="bg-black/50 p-3 rounded border border-slate-800 font-mono text-[9px] text-slate-400">
                          <span className="block mb-2 font-bold text-white border-b border-slate-800 pb-1">Tamper-Proof Silicon</span>
                          <div className="flex justify-between items-center">
                              <span>MASTER_RSA_KEY:</span>
                              <span className="text-amber-500">**********</span>
                          </div>
                          
                          {isHsmEnabled && activeStep >= 5 && (
                              <div className="mt-2 text-center text-emerald-400 font-bold bg-emerald-950/50 p-1 rounded border border-emerald-900 animate-pulse">
                                  HARDWARE READ REJECTED
                              </div>
                          )}
                      </div>
                  </div>
                  
                  {/* Connection from App to HSM */}
                  {isHsmEnabled && (
                      <div className="absolute bottom-32 top-[60%] left-1/2 w-0.5 border-l-2 border-dashed border-amber-900 z-0"></div>
                  )}

                  {/* Custom Keyframes embedded for animation */}
                  <style>{`
                      @keyframes moveUp {
                          0% { transform: translateY(0); opacity: 1; }
                          100% { transform: translateY(-150px); opacity: 0; }
                      }
                  `}</style>

                  {/* Overlays */}
                  {attackComplete && !isHsmEnabled && (
                      <div className="absolute inset-0 bg-red-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🚨</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Private Key Stolen</span>
                          <p className="text-[10px] text-red-200 leading-relaxed font-mono bg-red-900/50 p-3 rounded border border-red-500">
                              The attacker read the .env file from server memory. With the Master RSA Key, they successfully generated 10,000 mathematically valid fake tickets. $4M in revenue lost.
                          </p>
                      </div>
                  )}
                  
                  {attackComplete && isHsmEnabled && (
                      <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm rounded-[1.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-6 text-center">
                          <span className="text-6xl mb-4">🛡️</span>
                          <span className="text-lg font-black uppercase tracking-widest mb-2">Key Extraction Blocked</span>
                          <p className="text-[10px] text-emerald-200 leading-relaxed bg-emerald-900/50 p-3 rounded border border-emerald-500">
                              The attacker compromised the app server, but the .env file did not contain the key. The Master Key is permanently locked inside the physical HSM hardware. The festival economy remains perfectly secure.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120a05] p-4 rounded-xl border border-amber-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-amber-400 uppercase block mb-1">Hardware Security Modules:</span>
               With the HSM OFF, click Simulate Attack. The attacker gains root access to the Node server, simply reads the environment variables (`.env`), and steals the master cryptographic key to forge infinite VIP tickets.<br/><br/>Toggle <span className="text-amber-400 font-bold bg-slate-800 px-1 rounded">Key Management</span> ON. Eventra now uses an external AWS CloudHSM. The server is compromised again, but the attacker finds nothing in memory. They attempt to extract the key from the HSM, but the physical FIPS 140-2 hardware strictly rejects read operations, thwarting the attack entirely.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HSMTicketSigning;
