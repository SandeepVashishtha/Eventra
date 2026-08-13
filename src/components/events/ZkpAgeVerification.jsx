/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ZkpAgeVerification = () => {
  const [proofGenerated, setProofGenerated] = useState(false);
  const [proofString, setProofString] = useState('');
  
  // ZKP Metrics
  const [ageProofsVerified, setAgeProofsVerified] = useState(14020); 
  const [piiDataExposed, setPiiDataExposed] = useState(0); // Should always be 0
  const [averageScanTime, setAverageScanTime] = useState(0.4); // Seconds
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'Zero-Knowledge Proof (zk-SNARK) circuit loaded.' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Awaiting local proof generation from attendee device.' }
  ]);

  // Visualizer State
  const [isScanning, setIsScanning] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('WAITING'); // WAITING, SCANNING, VERIFIED, REJECTED

  useEffect(() => {
    let loop;
    
    if (verifyStatus === 'WAITING' || verifyStatus === 'VERIFIED') {
      loop = setInterval(() => {
          setAgeProofsVerified(prev => Math.min(25000, prev + Math.floor(Math.random() * 5)));
      }, 3000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [verifyStatus]);

  const generateProof = () => {
      addLog('ACTION', 'Attendee initiating Age Verification on mobile device...');
      addLog('SYS', 'Prover executing zk-SNARK circuit locally. Input: [DOB, Current_Date, Age_Limit].');
      
      setTimeout(() => {
          // Generate a fake snark string
          let snark = '0x';
          const chars = '0123456789abcdef';
          for(let i=0; i<64; i++) snark += chars[Math.floor(Math.random() * chars.length)];
          
          setProofString(snark);
          setProofGenerated(true);
          addLog('SUCCESS', 'Mathematical proof generated: statement "Age >= 21" is TRUE.');
          addLog('SYS', 'Generating QR Code representing the cryptographic proof.');
      }, 1200);
  };

  const scanQrCode = () => {
      if (!proofGenerated || isScanning) return;
      
      setIsScanning(true);
      setVerifyStatus('SCANNING');
      addLog('ACTION', 'Bartender POS scanning ZKP QR Code...');
      
      setTimeout(() => {
          addLog('SYS', 'Verifier node checking SNARK validity against smart contract constraints...');
          
          setTimeout(() => {
              setVerifyStatus('VERIFIED');
              setIsScanning(false);
              setAgeProofsVerified(prev => prev + 1);
              addLog('SUCCESS', 'Proof mathematically verified. Age >= 21 confirmed.');
              addLog('SUCCESS', 'Zero PII transmitted. Name, exact DOB, and ID # remain hidden.');
              
              setTimeout(() => {
                  // Reset for next customer
                  setVerifyStatus('WAITING');
                  setProofGenerated(false);
                  setProofString('');
                  addLog('SYS', 'Clearing transaction memory. Ready for next scan.');
              }, 4000);
          }, 1500);
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030605] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕵️</span> Cryptography & Data Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Zero-Knowledge Proof (ZKP) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500">Age Verification</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Checking physical IDs at festival bars causes massive lines, and storing scanned IDs in a centralized database creates a massive privacy liability if breached (leaking names, addresses, and birthdates). Eventra solves this by implementing a Zero-Knowledge Proof (ZKP) software protocol. The Attendee app executes a local zk-SNARK circuit to generate a mathematical proof that the user is "over 21" without revealing their actual DOB. The bartender's POS scans the generated QR code to verify the proof instantly, achieving 100% legal compliance with absolutely zero PII transmission.
          </p>

          <div className="bg-[#050a08] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> zk-SNARK Protocol Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={generateProof}
                   disabled={proofGenerated || verifyStatus !== 'WAITING'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     proofGenerated || verifyStatus !== 'WAITING' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-emerald-600 hover:bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {proofGenerated ? 'Cryptographic Proof Generated' : 'Generate Proof on Device'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Proofs Verified */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Proofs Verified
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 text-emerald-400`}>
                     {(ageProofsVerified / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>

               {/* PII Exposed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 piiDataExposed > 0 ? 'bg-red-950/20 border-red-900/50' : 'bg-teal-950/20 border-teal-500/30'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   PII Exposed
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     piiDataExposed > 0 ? 'text-red-400' : 'text-teal-400'
                   }`}>
                     {piiDataExposed}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">bytes</span>
                 </div>
               </div>
               
               {/* Scan Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Verification
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {averageScanTime.toFixed(1)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">s</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ZKP Prover/Verifier Ledger</span>
                 {verifyStatus === 'SCANNING' && <span className="text-teal-400 font-black animate-pulse">CRYPTOGRAPHIC VERIFICATION...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-yellow-500 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* P2P Transaction Simulator */}
            <div className="w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 bg-[#040806]">
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">ZKP TRANSACTION FLOW</span>
                <span className="text-[8px] font-mono text-emerald-500">SECURE</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12">
                  
                  {/* Top Half: Attendee Device (Prover) */}
                  <div className="h-1/2 border-b border-slate-800 p-4 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 to-black">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 absolute top-4 left-4">Attendee App (Prover)</span>
                      
                      {!proofGenerated ? (
                          <div className="w-24 h-24 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-900/50">
                              <span className="text-3xl opacity-50 grayscale">📱</span>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center animate-fade-in-up">
                              {/* Fake QR Code using CSS Grid */}
                              <div className="w-32 h-32 bg-white p-2 rounded-lg flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                  {[...Array(6)].map((_, i) => (
                                      <div key={i} className="flex justify-between w-full h-4">
                                          {[...Array(6)].map((_, j) => (
                                              <div key={j} className={`w-4 h-full ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                                          ))}
                                      </div>
                                  ))}
                                  <div className="absolute top-2 left-2 w-8 h-8 border-4 border-black"></div>
                                  <div className="absolute top-2 right-2 w-8 h-8 border-4 border-black"></div>
                                  <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-black"></div>
                              </div>
                              <span className="text-[8px] font-mono text-emerald-500 mt-2 bg-emerald-900/30 px-1 rounded">zk-SNARK PROOF GENERATED</span>
                          </div>
                      )}
                  </div>

                  {/* Bottom Half: Bartender POS (Verifier) */}
                  <div className="flex-1 bg-[#020504] p-4 relative flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 absolute top-4 left-4">Bartender POS (Verifier)</span>
                      
                      <div className="w-full max-w-[280px] bg-black border border-slate-800 rounded-xl p-4 flex flex-col items-center relative overflow-hidden">
                          
                          {verifyStatus === 'SCANNING' && (
                              <div className="absolute inset-0 bg-teal-500/10 z-10 flex flex-col items-center justify-center">
                                  <div className="w-full h-1 bg-teal-500 shadow-[0_0_15px_#14b8a6] animate-[scan_1s_ease-in-out_infinite_alternate]"></div>
                              </div>
                          )}

                          {verifyStatus === 'WAITING' ? (
                              <div className="text-center opacity-50">
                                  <span className="text-4xl mb-2 block grayscale">🍻</span>
                                  <span className="text-[10px] font-mono text-slate-400">AWAITING QR SCAN</span>
                              </div>
                          ) : verifyStatus === 'SCANNING' ? (
                              <div className="text-center z-20">
                                  <div className="text-[8px] font-mono text-teal-400 break-all leading-tight h-16 overflow-hidden mb-2">
                                      {proofString}
                                  </div>
                                  <span className="text-[10px] font-black text-white animate-pulse">Running Cryptographic Verification...</span>
                              </div>
                          ) : (
                              <div className="text-center animate-fade-in-up w-full">
                                  <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                      <span className="text-3xl">✅</span>
                                  </div>
                                  <span className="text-sm font-black text-emerald-400 uppercase tracking-widest block mb-1">AGE VERIFIED &gt; 21</span>
                                  
                                  <div className="w-full bg-slate-900 border border-slate-800 rounded p-2 mt-4 text-left">
                                      <span className="text-[8px] text-slate-500 font-mono block mb-1">Data Received by Server:</span>
                                      <div className="flex justify-between text-[10px] font-mono border-b border-slate-800 pb-1 mb-1">
                                          <span className="text-slate-400">Full Name:</span>
                                          <span className="text-emerald-500">NULL (Zero-Knowledge)</span>
                                      </div>
                                      <div className="flex justify-between text-[10px] font-mono border-b border-slate-800 pb-1 mb-1">
                                          <span className="text-slate-400">Date of Birth:</span>
                                          <span className="text-emerald-500">NULL (Zero-Knowledge)</span>
                                      </div>
                                      <div className="flex justify-between text-[10px] font-mono">
                                          <span className="text-slate-400">ID Number:</span>
                                          <span className="text-emerald-500">NULL (Zero-Knowledge)</span>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050a08] p-4 rounded-xl border border-slate-800">
               <button 
                   onClick={scanQrCode}
                   disabled={!proofGenerated || verifyStatus !== 'WAITING'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !proofGenerated || verifyStatus !== 'WAITING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-teal-950/40 border-teal-600 text-teal-400 hover:bg-teal-900/60 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                   }`}
                 >
                   📸 Scan QR Code (Bartender POS)
               </button>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
            0% { transform: translateY(-30px); }
            100% { transform: translateY(30px); }
        }
      `}} />
      
    </div>
  );
};

export default ZkpAgeVerification;
