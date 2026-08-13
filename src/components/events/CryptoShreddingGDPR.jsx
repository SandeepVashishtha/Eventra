/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CryptoShreddingGDPR = () => {
  const [isCryptoEnabled, setIsCryptoEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'GDPR Compliance Portal online. Awaiting user deletion requests.' }
  ]);

  const executeDeletion = () => {
      setIsDeleting(true);
      setDeleteComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'User EUR-942 submitted a GDPR Article 17 "Right-to-be-Forgotten" request.');
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isCryptoEnabled) {
              addLog('SYS', 'Locating User Master Encryption Key in Key Management Service (KMS)...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('WARN', 'Dropping Master Key [0x7F9B...]. Shredding cryptographic material.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsDeleting(false);
                      setDeleteComplete(true);
                      addLog('SUCCESS', 'KMS Key dropped. All ciphertext across 15 databases rendered mathematically unrecoverable.');
                      addLog('SYS', 'O(1) complexity. Instant compliance achieved.');
                  }, 1200);
              }, 1200);
              
          } else {
              // Legacy Cascade Delete
              addLog('WARN', 'Initiating manual SQL Cascade DELETE across 15 monolithic tables...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Deleting from Users... Deleting from Billing... Deleting from Logs...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsDeleting(false);
                      setDeleteComplete(true);
                      addLog('CRIT', 'SQL script failed on orphaned row in `legacy_analytics` table.');
                      addLog('CRIT', 'PII remains in database. GDPR violation flagged by automated audit.');
                  }, 2500);
              }, 1500);
          }
      }, 1000);
  };

  const toggleCrypto = () => {
      const newState = !isCryptoEnabled;
      setIsCryptoEnabled(newState);
      setDeleteComplete(false);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Crypto-Shredding Engine enabled. All PII encrypted at rest with unique KMS keys per user.');
      } else {
          addLog('CRIT', 'Crypto-Shredding disabled. PII stored as plaintext. Deletion requires manual SQL cascades.');
      }
  };

  const resetPortal = () => {
      setIsDeleting(false);
      setDeleteComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Portal reset. Databases restored to initial state.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020604] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🇪🇺</span> Privacy & Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Ephemeral Data Sharding <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Crypto-Shredding Architecture</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a European user requests their data be deleted (GDPR Right-to-be-Forgotten), engineering teams historically run dangerous, manual SQL DELETE queries across 15 different database tables—often missing orphaned rows and violating international privacy laws. Eventra solves this via Cryptographic Shredding. All PII is encrypted at rest using a unique cryptographic key stored in a central KMS for that specific user. To delete the user, the system simply drops their master key from the KMS, rendering their PII mathematically unrecoverable across all databases instantly.
          </p>

          <div className="bg-[#050c08] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> GDPR Compliance Hub
               </h3>
               {deleteComplete && (
                   <button onClick={resetPortal} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Restore Data</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Crypto Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Data Storage Architecture</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isCryptoEnabled ? 'Active: Ephemeral AES-256 GCM (KMS Backed)' : 'Inactive: Legacy Plaintext SQL Columns'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleCrypto}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isCryptoEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isCryptoEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeDeletion}
                     disabled={isDeleting || deleteComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         deleteComplete ? 'bg-slate-800 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isDeleting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                     }`}
                 >
                     {isDeleting ? 'Executing GDPR Request...' : deleteComplete ? 'Request Fulfilled' : "Execute GDPR Deletion"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#010402] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Privacy Operations Log</span>
                 {isDeleting && <span className="text-emerald-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Database Architecture</span>
                      <span className="text-xs text-white font-bold">Data Privacy Engine</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {isCryptoEnabled ? (
                      // Crypto Shredding View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          
                          {/* KMS Node */}
                          <div className={`border-2 rounded-xl p-4 mb-6 relative overflow-hidden transition-all duration-500 ${
                              activeStep >= 4 ? 'border-rose-900 bg-rose-950/20' : 
                              activeStep >= 3 ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-amber-950/20' : 
                              'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-emerald-950/20'
                          }`}>
                              <span className="text-[9px] font-bold uppercase tracking-widest block mb-2 text-white flex items-center">
                                  <span className="mr-2 text-xl">🔐</span> Key Management Service (KMS)
                              </span>
                              
                              <div className={`bg-black/50 p-3 rounded border font-mono text-[10px] transition-all duration-500 ${
                                  activeStep >= 4 ? 'border-rose-900 text-rose-500 opacity-50' : 'border-emerald-900 text-emerald-400'
                              }`}>
                                  <div><span className="text-slate-500">User:</span> EUR-942</div>
                                  <div className="mt-1"><span className="text-slate-500">Master_Key:</span></div>
                                  
                                  {activeStep >= 4 ? (
                                      <div className="text-rose-500 font-bold mt-1 line-through">[SHREDDED / DROPPED]</div>
                                  ) : activeStep >= 3 ? (
                                      <div className="text-amber-400 font-bold mt-1 animate-pulse">[DROPPING KEY...]</div>
                                  ) : (
                                      <div className="break-all text-xs mt-1">0x7F9B2C4E...A8F1</div>
                                  )}
                              </div>
                          </div>

                          {/* Data Nodes */}
                          <div className="flex-1 flex flex-col space-y-3">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center block">Distributed Databases</span>
                              
                              {/* DB 1 */}
                              <div className={`border rounded p-3 flex flex-col font-mono text-[9px] transition-colors duration-500 ${
                                  activeStep >= 4 ? 'border-slate-800 bg-slate-900/50' : 'border-slate-700 bg-slate-900'
                              }`}>
                                  <div className="text-white font-bold mb-2 flex justify-between border-b border-slate-800 pb-1">
                                      <span>[DB_Auth].users</span>
                                      <span className="text-slate-500">Row ID: 942</span>
                                  </div>
                                  <div className="break-all text-slate-500">
                                      {activeStep >= 4 ? (
                                          <span className="text-slate-600 italic">ciphertext_AES256 (Decryption mathematically impossible)</span>
                                      ) : (
                                          <span className="text-emerald-500 opacity-50">g4j8k2l...aes_gcm_ciphertext...9f2b</span>
                                      )}
                                  </div>
                              </div>
                              
                              {/* DB 2 */}
                              <div className={`border rounded p-3 flex flex-col font-mono text-[9px] transition-colors duration-500 ${
                                  activeStep >= 4 ? 'border-slate-800 bg-slate-900/50' : 'border-slate-700 bg-slate-900'
                              }`}>
                                  <div className="text-white font-bold mb-2 flex justify-between border-b border-slate-800 pb-1">
                                      <span>[DB_Billing].invoices</span>
                                      <span className="text-slate-500">Row ID: 44X</span>
                                  </div>
                                  <div className="break-all text-slate-500">
                                      {activeStep >= 4 ? (
                                          <span className="text-slate-600 italic">ciphertext_AES256 (Decryption mathematically impossible)</span>
                                      ) : (
                                          <span className="text-emerald-500 opacity-50">x7m1p9...aes_gcm_ciphertext...3n8c</span>
                                      )}
                                  </div>
                              </div>

                              <div className="text-center text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                                  ... 13 more tables
                              </div>
                          </div>

                      </div>
                  ) : (
                      // Legacy Cascade Delete View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Legacy SQL Cascade Query</span>
                              <div className="text-[10px] text-rose-300 bg-black/50 p-3 rounded border border-rose-900/50 font-mono opacity-80">
                                  DELETE FROM auth_users WHERE id = 942;<br/>
                                  DELETE FROM billing WHERE user_id = 942;<br/>
                                  DELETE FROM logs WHERE user_id = 942;<br/>
                                  -- Running 15 massive table scans...
                              </div>
                          </div>

                          <div className="flex-1 flex flex-col space-y-3 relative">
                              {/* DB 1 */}
                              <div className={`border rounded p-3 flex flex-col font-mono text-[9px] ${
                                  activeStep >= 3 ? 'border-rose-900/50 bg-rose-950/20' : 'border-slate-700 bg-slate-900'
                              }`}>
                                  <div className="text-white font-bold mb-1 flex justify-between">
                                      <span>[DB_Auth].users</span>
                                  </div>
                                  <div className="text-slate-400">
                                      email: <span className={activeStep >= 4 ? 'line-through opacity-20' : ''}>alice@gmail.com</span>
                                  </div>
                              </div>
                              
                              {/* DB 2 */}
                              <div className={`border rounded p-3 flex flex-col font-mono text-[9px] ${
                                  activeStep >= 3 ? 'border-rose-900/50 bg-rose-950/20' : 'border-slate-700 bg-slate-900'
                              }`}>
                                  <div className="text-white font-bold mb-1 flex justify-between">
                                      <span>[DB_Billing].invoices</span>
                                  </div>
                                  <div className="text-slate-400">
                                      address: <span className={activeStep >= 4 ? 'line-through opacity-20' : ''}>123 Main St</span>
                                  </div>
                              </div>
                              
                              {/* The Orphaned Row */}
                              <div className={`border rounded p-3 flex flex-col font-mono text-[9px] transition-colors duration-500 ${
                                  activeStep >= 4 ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-amber-950/30' : 'border-slate-700 bg-slate-900'
                              }`}>
                                  <div className="text-white font-bold mb-1 flex justify-between">
                                      <span>[DB_Legacy].analytics</span>
                                      {activeStep >= 4 && <span className="text-amber-500 animate-pulse">⚠️ ORPHANED ROW</span>}
                                  </div>
                                  <div className="text-slate-400">
                                      email: <span className="text-amber-400 font-bold">alice@gmail.com</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Overlays */}
                  {deleteComplete && isCryptoEnabled && (
                      <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-sm rounded-[1.5rem] border-2 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">✅</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">Crypto-Shredding Complete<br/><span className="text-[10px] font-normal text-emerald-200 mt-1 block">O(1) Deletion. Instant GDPR Compliance.</span></span>
                      </div>
                  )}
                  
                  {deleteComplete && !isCryptoEnabled && (
                      <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm rounded-[1.5rem] border-2 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">⚖️</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">GDPR Violation<br/><span className="text-[10px] font-normal text-rose-200 mt-1 block">SQL Cascade missed orphaned PII.<br/>Legal liability triggered.</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050c08] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Right to be Forgotten:</span>
               With Crypto-Shredding OFF, click Execute. The backend runs massive SQL `DELETE` queries across 15 databases. It misses a legacy analytics table, leaving plaintext PII in the database and causing a severe GDPR violation.<br/><br/>Toggle <span className="text-emerald-400 font-bold bg-slate-800 px-1 rounded">Data Architecture</span> ON. All user data is encrypted at rest using AES-256 GCM. When the user requests deletion, we don't run any database scans. We simply drop their master key from the KMS. In O(1) time, all ciphertext across all 15 databases becomes mathematically unrecoverable forever.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CryptoShreddingGDPR;
