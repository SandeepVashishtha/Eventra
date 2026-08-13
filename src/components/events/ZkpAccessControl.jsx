/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ZkpAccessControl = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [scanState, setScanState] = useState('IDLE'); // IDLE, PROVING, VERIFIED, REJECTED
  
  // ZKP Metrics
  const [proofGenTime, setProofGenTime] = useState(0); // ms
  const [verificationTime, setVerificationTime] = useState(0); // ms
  const [identityLeaks, setIdentityLeaks] = useState(0); 
  const [verifiedCount, setVerifiedCount] = useState(0); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'zk-SNARK Proving Engine Initialized.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Zero-Knowledge VIP Checkpoint active.' }
  ]);

  // Visualizer State
  const [circuitNodes, setCircuitNodes] = useState([]);
  const [actorIdentity, setActorIdentity] = useState('0x...');

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (scanState === 'PROVING') {
              // Generate fake circuit node pulses
              setCircuitNodes(prev => [...prev, {
                  id: Date.now() + Math.random(),
                  x: 10 + Math.random() * 80,
                  y: 10 + Math.random() * 80,
                  size: 2 + Math.random() * 6
              }].slice(-20));
          } else if (scanState === 'IDLE') {
              setCircuitNodes([]);
              setActorIdentity('0x...');
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, scanState]);

  const triggerScan = (scenario) => {
      if (!systemActive || scanState !== 'IDLE') return;
      
      setScanState('PROVING');
      const genTime = 120 + Math.random() * 80;
      setProofGenTime(genTime);
      setVerificationTime(0);
      
      addLog('ACTION', 'Device scanned at Backstage Checkpoint.');
      addLog('SYS', 'Generating local zk-SNARK cryptographic proof...');
      
      setTimeout(() => {
          if (!systemActive) return;
          
          const verTime = 15 + Math.random() * 5;
          setVerificationTime(verTime);
          
          if (scenario === 'VALID_VIP') {
              setScanState('VERIFIED');
              setVerifiedCount(prev => prev + 1);
              setActorIdentity('VALID (MASKED)');
              addLog('SUCCESS', `Proof Verified (${verTime.toFixed(1)}ms). Assert: Holds Backstage Pass == TRUE.`);
              addLog('SYS', 'Identity hidden. PII Transmitted: 0 bytes. Access Granted.');
          } else {
              setScanState('REJECTED');
              setActorIdentity('INVALID (MASKED)');
              addLog('CRIT', `Proof Rejected (${verTime.toFixed(1)}ms). Assert: Holds Backstage Pass == FALSE.`);
              addLog('WARN', 'Access Denied. ZKP constraints failed.');
          }
          
          setTimeout(() => {
              if (systemActive) setScanState('IDLE');
          }, 3000);
          
      }, genTime);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setScanState('IDLE');
      setIdentityLeaks(0);
      setVerifiedCount(0);
      addLog('SYS', 'Decentralized ZKP Checkpoint Online.');
    } else {
      setSystemActive(false);
      setScanState('IDLE');
      setCircuitNodes([]);
      addLog('WARN', 'Cryptographic Engine Offline. Reverting to insecure physical databases.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Decentralized Identity
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Zero-Knowledge Proof <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500">VIP Access Control</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            High-profile VIPs (celebrities, politicians) want backstage access without having their real identity tied to a scanned ticket database that could be leaked, sold, or hacked by paparazzi. Eventra solves this by integrating a Zero-Knowledge Proof (zk-SNARK) cryptographic protocol into the ticketing system. When a VIP scans their device at a secure checkpoint, the system cryptographically verifies that they hold a valid backstage pass without ever transmitting, revealing, or storing their actual identity.
          </p>

          <div className="bg-[#050912] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Cryptographic Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt ZKP Engine' : 'Deploy zk-SNARK Verifier'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Gen Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 scanState === 'PROVING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Proof Gen
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     scanState === 'PROVING' ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(proofGenTime)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* Ver Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 scanState === 'VERIFIED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 scanState === 'REJECTED' ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Verification
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     scanState === 'VERIFIED' ? 'text-emerald-400' : 
                     scanState === 'REJECTED' ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {verificationTime.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Identity Leaks */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Identity Leaks
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {identityLeaks}
                   </span>
                 </div>
               </div>
               
               {/* Verified */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Secure Entry
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {verifiedCount}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010204] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ZKP Node Ledger</span>
                 {scanState === 'PROVING' && <span className="text-indigo-400 font-black animate-pulse">GENERATING CRYPTOGRAPHIC PROOF...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* ZKP Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#050912]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">ZK-SNARK CIRCUIT</span>
                <span className="text-[8px] font-mono text-slate-400">NODE VALIDATOR</span>
              </div>

              <div className="flex-1 relative flex flex-col px-6 pt-12 pb-6">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">VERIFIER UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col items-center justify-between">
                      
                      {/* Prover Side (Device) */}
                      <div className="w-full h-1/3 border-b border-slate-700 flex items-center justify-between px-4 relative">
                          <div className="flex flex-col items-center">
                              <span className="text-2xl mb-1 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">👤</span>
                              <span className="text-[8px] font-black uppercase text-slate-400">VIP Prover</span>
                          </div>
                          
                          <div className="flex-1 flex justify-center">
                              <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-center relative overflow-hidden">
                                  <span className="text-[8px] text-slate-500 uppercase block mb-1">True Identity</span>
                                  <span className="font-mono text-sm text-slate-300 filter blur-sm select-none">Taylor Swift</span>
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="text-xs font-black text-red-500 tracking-widest">ENCRYPTED</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Mathematical Circuit Field */}
                      <div className="w-full h-1/3 flex items-center justify-center relative">
                          
                          {/* Circuit paths */}
                          <svg className="absolute inset-0 w-full h-full opacity-20">
                              <path d="M 0,20 Q 50,20 50,60 T 100,60" fill="none" stroke="#6366f1" strokeWidth="2" />
                              <path d="M 0,60 Q 50,60 50,20 T 100,20" fill="none" stroke="#6366f1" strokeWidth="2" />
                              <path d="M 0,40 L 100,40" fill="none" stroke="#6366f1" strokeWidth="2" />
                          </svg>

                          {/* Firing Nodes */}
                          {circuitNodes.map(node => (
                              <div 
                                  key={node.id}
                                  className="absolute bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"
                                  style={{
                                      left: `${node.x}%`,
                                      top: `${node.y}%`,
                                      width: `${node.size}px`,
                                      height: `${node.size}px`,
                                  }}
                              ></div>
                          ))}

                          <div className={`z-10 bg-black/80 px-6 py-2 rounded-full border border-indigo-500/50 backdrop-blur-md transition-all duration-300 ${
                              scanState === 'PROVING' ? 'shadow-[0_0_30px_rgba(79,70,229,0.6)] scale-110' : ''
                          }`}>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                  scanState === 'PROVING' ? 'text-indigo-400' : 'text-slate-600'
                              }`}>
                                  {scanState === 'PROVING' ? 'C(x, w) == 0' : 'ZKP Circuit'}
                              </span>
                          </div>
                      </div>

                      {/* Verifier Side (Checkpoint) */}
                      <div className="w-full h-1/3 border-t border-slate-700 flex items-center justify-between px-4">
                          <div className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                              scanState === 'VERIFIED' ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
                              scanState === 'REJECTED' ? 'bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-slate-900 border-slate-700'
                          }`}>
                              <span className="text-2xl mb-1">🛡️</span>
                              <span className="text-[8px] font-black uppercase text-slate-400">Scanner</span>
                          </div>

                          <div className="flex-1 flex flex-col justify-center items-end text-right">
                              <span className="text-[8px] text-slate-500 uppercase block mb-1">Revealed Identity</span>
                              <span className={`font-mono text-sm font-bold ${
                                  scanState === 'VERIFIED' ? 'text-emerald-400' :
                                  scanState === 'REJECTED' ? 'text-red-500' : 'text-slate-600'
                              }`}>{actorIdentity}</span>
                          </div>
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050912] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate ZKP Assertions</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerScan('VALID_VIP')}
                   disabled={!systemActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   ✅ Scan Valid VIP
                 </button>

                 <button 
                   onClick={() => triggerScan('INVALID')}
                   disabled={!systemActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   ❌ Scan Normal Ticket
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ZkpAccessControl;
