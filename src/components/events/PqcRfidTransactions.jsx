/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PqcRfidTransactions = () => {
  const [encryptionMode, setEncryptionMode] = useState('RSA-2048'); // RSA-2048 or CRYSTALS-KYBER
  const [transactionState, setTransactionState] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS
  
  // Security Metrics
  const [interceptedPackets, setInterceptedPackets] = useState(0); 
  const [quantumBreaches, setQuantumBreaches] = useState(0); 
  const [secureTransactions, setSecureTransactions] = useState(1420);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'RFID Point-of-Sale terminal online. Awaiting cashless tap.' },
    { id: 2, time: '09:00:02', type: 'WARN', msg: 'System operating on legacy RSA-2048 encryption (Vulnerable to Harvest-Now-Decrypt-Later).' }
  ]);

  // Visualizer State
  const [attackStatus, setAttackStatus] = useState('MONITORING');
  const [capturedPayload, setCapturedPayload] = useState('');

  const generateHexPayload = () => {
      let result = '';
      const characters = '0123456789ABCDEF';
      for (let i = 0; i < 64; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
  };

  const simulateTransaction = () => {
      if (transactionState !== 'IDLE') return;
      
      setTransactionState('PROCESSING');
      setAttackStatus('INTERCEPTING');
      addLog('ACTION', 'RFID Wristband tapped. Initiating cashless payment ($12.50).');
      
      const payload = generateHexPayload();
      setCapturedPayload(payload);
      
      setTimeout(() => {
          setInterceptedPackets(prev => prev + 1);
          
          if (encryptionMode === 'RSA-2048') {
              addLog('CRIT', 'WARNING: Adversary captured payload. Simulating Quantum Shor\'s Algorithm decryption...');
              setAttackStatus('DECRYPTING');
              
              setTimeout(() => {
                  setQuantumBreaches(prev => prev + 1);
                  setAttackStatus('BREACHED');
                  addLog('CRIT', 'BREACH DETECTED: Payload decrypted successfully by Quantum adversary. Fin data exposed.');
                  setTransactionState('IDLE');
              }, 2000);
          } else {
              addLog('SYS', 'Adversary captured payload. Attempting Quantum decryption on Lattice-based cyphertext...');
              setAttackStatus('ATTACKING');
              
              setTimeout(() => {
                  setSecureTransactions(prev => prev + 1);
                  setAttackStatus('FAILED');
                  addLog('SUCCESS', 'PQC DEFENSE ACTIVE: CRYSTALS-Kyber key encapsulation thwarted Quantum decryption attempt.');
                  addLog('SUCCESS', 'Transaction processed securely.');
                  setTransactionState('IDLE');
              }, 2000);
          }
      }, 1000);
  };

  const toggleEncryption = () => {
      if (encryptionMode === 'RSA-2048') {
          setEncryptionMode('CRYSTALS-KYBER');
          addLog('SYS', 'Firmware upgraded. Post-Quantum Cryptography (PQC) active via CRYSTALS-Kyber.');
          setAttackStatus('MONITORING');
          setCapturedPayload('');
      } else {
          setEncryptionMode('RSA-2048');
          addLog('WARN', 'Firmware downgraded to legacy RSA-2048. System vulnerable to Quantum attacks.');
          setAttackStatus('MONITORING');
          setCapturedPayload('');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050a0a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> FinTech & Cybersecurity
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Post-Quantum Cryptography <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500">for RFID Transactions</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            As quantum computing advances rapidly, standard encryption protocols (like RSA and ECC) securing millions of dollars of on-site cashless RFID wristband transactions face future vulnerability risks from "Harvest Now, Decrypt Later" attacks. Eventra solves this by future-proofing the festival's financial infrastructure, upgrading the point-of-sale firmware and backend microservices to utilize Post-Quantum Cryptography (PQC) algorithms, specifically CRYSTALS-Kyber for key encapsulation. This ensures intercepted transaction packets remain completely unreadable to future quantum computers.
          </p>

          <div className="bg-[#081212] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Cryptographic Security Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEncryption}
                   disabled={transactionState !== 'IDLE'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     transactionState !== 'IDLE' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     encryptionMode === 'RSA-2048' ? 'bg-teal-600 hover:bg-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.4)]' :
                     'bg-red-900/50 hover:bg-red-900/80 text-red-400 border border-red-800'
                   }`}
                 >
                   {encryptionMode === 'RSA-2048' ? 'Upgrade to CRYSTALS-Kyber (PQC)' : 'Downgrade to Legacy RSA'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Current Encryption */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 encryptionMode === 'CRYSTALS-KYBER' ? 'bg-teal-950/40 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'bg-red-950/20 border-red-900/50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Key Encapsulation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     encryptionMode === 'CRYSTALS-KYBER' ? 'text-teal-400' : 'text-red-400'
                   }`}>
                     {encryptionMode}
                   </span>
                 </div>
               </div>

               {/* Secure Txns */}
               <div className="col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Secured
                 </span>
                 <div className="flex items-end">
                   <span className="text-2xl font-black font-mono leading-none text-slate-300">
                     {secureTransactions}
                   </span>
                 </div>
               </div>
               
               {/* Breaches */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 quantumBreaches > 0 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Decryptions
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         quantumBreaches > 0 ? 'text-red-500' : 'text-slate-600'
                       }`}>
                         {quantumBreaches}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020505] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Financial Security Ledger</span>
                 {encryptionMode === 'CRYSTALS-KYBER' && <span className="text-teal-400 font-black animate-pulse">LATTICE-BASED SECURITY</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-900/30 px-1 uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* POS vs Adversary Simulator */}
            <div className="w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 bg-[#040808]">
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">RFID POS TERMINAL</span>
                <span className="text-[8px] font-mono text-emerald-500">READY FOR TAP</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12">
                  
                  {/* Top Half: The Vendor POS */}
                  <div className="h-1/2 border-b border-slate-800 p-6 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 to-black">
                      <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                          transactionState === 'PROCESSING' ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse' : 'border-slate-700 bg-slate-800'
                      }`}>
                          <span className="text-4xl text-slate-500">💳</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">
                          {transactionState === 'PROCESSING' ? 'Processing Payment...' : 'Total: $12.50'}
                      </span>
                  </div>

                  {/* Bottom Half: The Adversary / Packet Sniffer */}
                  <div className="flex-1 bg-black p-4 relative font-mono overflow-hidden">
                      <div className="flex justify-between items-center mb-2 border-b border-red-900/30 pb-2">
                          <span className="text-[10px] font-bold text-red-500 flex items-center">
                              <span className="mr-2">☠️</span> Adversary Packet Sniffer
                          </span>
                          <span className={`text-[8px] px-1 rounded ${
                              attackStatus === 'BREACHED' ? 'bg-red-500 text-black' : 
                              attackStatus === 'FAILED' ? 'bg-emerald-500 text-black' : 'text-slate-600'
                          }`}>
                              {attackStatus}
                          </span>
                      </div>

                      <div className="h-full flex flex-col">
                          {attackStatus === 'MONITORING' ? (
                              <div className="flex-1 flex items-center justify-center">
                                  <span className="text-xs text-red-900/50 animate-pulse">Monitoring airgap for RFID packets...</span>
                              </div>
                          ) : (
                              <div className="flex flex-col h-full">
                                  <span className="text-[8px] text-slate-500 mb-1">Encrypted Payload Captured:</span>
                                  <div className="bg-slate-900/50 text-[8px] text-emerald-400 p-2 border border-slate-800 break-all leading-tight mb-2">
                                      {capturedPayload}
                                  </div>

                                  {(attackStatus === 'DECRYPTING' || attackStatus === 'ATTACKING') && (
                                      <div className="flex-1 flex flex-col justify-end pb-4">
                                          <span className="text-[8px] text-red-400 mb-1 animate-pulse">Running Shor's Algorithm...</span>
                                          <div className="w-full h-1 bg-red-900/30 rounded-full overflow-hidden">
                                              <div className="h-full bg-red-500 w-full animate-[progress_2s_ease-in-out]"></div>
                                          </div>
                                      </div>
                                  )}

                                  {attackStatus === 'BREACHED' && (
                                      <div className="bg-red-900/20 border border-red-500/50 p-2 mt-auto">
                                          <span className="text-[8px] font-black text-red-500 block mb-1">SUCCESS: FIN DATA DECRYPTED</span>
                                          <span className="text-[8px] text-white">Acct: 4892-XXXX-XXXX-1204</span>
                                      </div>
                                  )}

                                  {attackStatus === 'FAILED' && (
                                      <div className="bg-emerald-900/20 border border-emerald-500/50 p-2 mt-auto">
                                          <span className="text-[8px] font-black text-emerald-500 block mb-1">FAILURE: PQC ALGORITHM</span>
                                          <span className="text-[8px] text-emerald-300/70">Lattice-based encryption unbreakable by current quantum capabilities.</span>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#081212] p-4 rounded-xl border border-slate-800">
               <button 
                   onClick={simulateTransaction}
                   disabled={transactionState !== 'IDLE'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     transactionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   📲 Tap Wristband (Pay $12.50)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PqcRfidTransactions;
