/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VIPSmartContractRevocation = () => {
  const [isExpired, setIsExpired] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // null, 'VALID', 'INVALID'
  const [nonceCounter, setNonceCounter] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:55:00', type: 'SYS', msg: 'Ethereum Virtual Machine connected. VIP Ticket Contract initialized.' }
  ]);

  // Simulate dynamic QR generation (nonce rotation)
  useEffect(() => {
      const interval = setInterval(() => {
          setNonceCounter(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  const scanTicket = () => {
      setIsScanning(true);
      setValidationResult(null);
      addLog('ACTION', 'Scanner requested validation of cryptographic payload...');
      
      setTimeout(() => {
          addLog('SYS', `Verifying wallet signature against Nonce #884${nonceCounter}...`);
          
          setTimeout(() => {
              setIsScanning(false);
              
              if (!isExpired) {
                  setValidationResult('VALID');
                  addLog('SUCCESS', 'Block timestamp valid (Before Midnight). Signature verified. Access GRANTED.');
              } else {
                  setValidationResult('INVALID');
                  addLog('CRIT', 'Block timestamp (00:01 AM) exceeds contract limit. Transaction REVERTED.');
                  addLog('WARN', 'Screenshot spoofing prevented. Access DENIED.');
              }
          }, 1500);
      }, 1000);
  };

  const toggleTime = () => {
      const newState = !isExpired;
      setIsExpired(newState);
      setValidationResult(null);
      if (newState) {
          addLog('WARN', 'Time warp simulated: Block Timestamp advanced to Saturday 00:01 AM.');
      } else {
          addLog('SYS', 'Time warp simulated: Block Timestamp reverted to Friday 23:58 PM.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060208] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 & Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated VIP Access <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500">Contract Revocation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Single-day VIP ticket holders frequently screenshot their QR codes and use them the next day, resulting in thousands of unauthorized attendees in restricted areas. Checking static database timestamps is easily bypassed by changing the device's local clock. Eventra solves this by deploying a time-bound Web3 smart contract for VIP access. The QR code dynamically regenerates every few seconds using a cryptographic nonce. Once the blockchain's unalterable timestamp exceeds midnight, the contract instantly revokes access.
          </p>

          <div className="bg-[#0b0312] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Web3 Validation Node
               </h3>
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Blockchain Clock Simulator */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Global Block Timestamp (Unalterable)</span>
                         <span className={`text-xl font-mono font-bold transition-colors ${isExpired ? 'text-rose-500' : 'text-emerald-400'}`}>
                             {isExpired ? 'SATURDAY 00:01 AM' : 'FRIDAY 23:58 PM'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleTime}
                         className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                             isExpired ? 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700' : 'bg-purple-900/50 text-purple-400 border-purple-500 hover:bg-purple-800/50'
                         }`}
                     >
                         {isExpired ? 'Rewind to Friday' : 'Fast-Forward to Midnight'}
                     </button>
                 </div>

                 <button 
                     onClick={scanTicket}
                     disabled={isScanning || validationResult !== null}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         validationResult === 'VALID' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500 cursor-not-allowed' :
                         validationResult === 'INVALID' ? 'bg-rose-900/40 text-rose-400 border-rose-500 cursor-not-allowed' :
                         isScanning ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                     }`}
                 >
                     {isScanning ? 'Verifying Smart Contract...' : validationResult ? 'Scan Complete' : 'Scan Dynamic Ticket QR'}
                 </button>

                 {validationResult && (
                      <button onClick={() => setValidationResult(null)} className="mt-4 text-[10px] text-center w-full uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Scan Next Attendee</button>
                 )}

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040106] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ethereum Virtual Machine Logs</span>
                 {isScanning && <span className="text-purple-400 font-black animate-pulse">VALIDATING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' :
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
          
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile App Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-30"></div>
              
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-10 px-4">
                  
                  <div className="flex justify-between items-center mb-6">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">◁</div>
                      <span className="text-white font-bold text-sm">VIP Pass</span>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">⚙️</div>
                  </div>

                  {/* Ticket UI */}
                  <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col relative overflow-hidden">
                      
                      {/* Holographic Header */}
                      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500"></div>
                      
                      <div className="relative z-10 flex flex-col items-center mt-4">
                          <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">Friday Only</span>
                          <h2 className="text-2xl font-black text-white mix-blend-overlay">VIP ACCESS</h2>
                      </div>

                      {/* Dynamic QR Box */}
                      <div className="mt-12 flex-1 flex flex-col items-center justify-center relative">
                          
                          {/* Scanning Laser */}
                          {isScanning && (
                              <div className="absolute top-0 left-4 right-4 h-1 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,1)] z-20 animate-[scan_1.5s_linear_infinite]"></div>
                          )}

                          <div className={`w-48 h-48 border-4 rounded-xl flex items-center justify-center relative bg-white transition-all duration-300 ${
                              validationResult === 'VALID' ? 'border-emerald-500' :
                              validationResult === 'INVALID' ? 'border-rose-500' :
                              'border-slate-200'
                          }`}>
                              
                              {/* Fake QR Pattern (changes with nonce) */}
                              <div className="grid grid-cols-5 grid-rows-5 gap-1 w-40 h-40 opacity-80 mix-blend-multiply transition-all duration-300">
                                  {Array.from({ length: 25 }).map((_, i) => (
                                      <div key={i} className={`bg-black rounded-sm transition-colors duration-500 ${
                                          (i * nonceCounter) % 3 === 0 ? 'opacity-100' : 'opacity-0'
                                      }`}></div>
                                  ))}
                              </div>

                              {/* Target corners */}
                              <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-black"></div>
                              <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-black"></div>
                              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-black"></div>
                              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-black"></div>

                              {/* Validation Overlays */}
                              {validationResult === 'VALID' && (
                                  <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in-up">
                                      <span className="text-4xl mb-2">✅</span>
                                      <span className="text-xs font-black uppercase tracking-widest">Access Granted</span>
                                  </div>
                              )}
                              {validationResult === 'INVALID' && (
                                  <div className="absolute inset-0 bg-rose-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in-up">
                                      <span className="text-4xl mb-2">⛔</span>
                                      <span className="text-xs font-black uppercase tracking-widest text-center">Contract<br/>Expired</span>
                                  </div>
                              )}

                          </div>

                          <div className="mt-4 text-center">
                              <span className="text-[9px] font-bold text-slate-400 block mb-1">Cryptographic Nonce</span>
                              <span className="text-xs font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded">0x884{nonceCounter}</span>
                          </div>

                      </div>

                      <div className="mt-auto border-t border-slate-200 pt-4 text-center">
                          <span className="text-[8px] text-slate-400">Secured by Ethereum Smart Contract</span>
                      </div>

                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0312] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">Cryptographic Spoof Prevention:</span>
               Ensure the block timestamp is on <span className="text-white font-bold">Friday</span> and click Scan. The changing QR (nonce) validates successfully. <br/><br/>Now, click <span className="text-white font-bold bg-purple-900/50 px-1 rounded border border-purple-500">Fast-Forward to Midnight</span>. A user who took a screenshot of Friday's ticket tries to scan it on Saturday. Even if they change their phone's local time, the backend checks the immutable blockchain timestamp. The Smart Contract instantly reverts the transaction and denies access.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default VIPSmartContractRevocation;
