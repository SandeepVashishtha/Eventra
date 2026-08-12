/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DIDAlcoholSales = () => {
  const [terminalActive, setTerminalActive] = useState(false);
  const [authStatus, setAuthStatus] = useState('IDLE'); // IDLE, SCANNING, ZKP_VERIFY, APPROVED, REJECTED
  
  const [zkpLog, setZkpLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'POS Terminal 04 online. NFC Reader active.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting Decentralized Identity (DID) payload.' }
  ]);

  const initiateNFCScan = (isUnderage = false) => {
    if (terminalActive && authStatus === 'IDLE') {
      setAuthStatus('SCANNING');
      addLog('ACTION', 'NFC Tap detected. Establishing secure handshake with Apple Wallet.');
      
      setTimeout(() => {
        setAuthStatus('ZKP_VERIFY');
        addLog('WEB3', 'Receiving Zero-Knowledge Proof (zk-SNARK) payload.');
        addLog('SYS', 'Executing cryptographic verification: (Age >= 21) == TRUE?');
        
        setTimeout(() => {
          if (isUnderage) {
            setAuthStatus('REJECTED');
            addLog('CRIT', 'ZKP Validation Failed. Cryptographic proof denies age requirement.');
          } else {
            setAuthStatus('APPROVED');
            addLog('SUCCESS', 'ZKP Validated! Attendee proven > 21 without revealing birthdate.');
          }
          
          setTimeout(() => {
            setAuthStatus('IDLE');
          }, 4000);
          
        }, 1500);
      }, 1000);
    }
  };

  const toggleTerminal = () => {
    if (!terminalActive) {
      setTerminalActive(true);
      addLog('SYS', 'NFC hardware engaged. Ready for high-volume verification.');
    } else {
      setTerminalActive(false);
      setAuthStatus('IDLE');
      addLog('WARN', 'Terminal locked. Reverting to physical ID checks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setZkpLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: ZKP Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Zero-Knowledge Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Identity (DID) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">for Alcohol Sales</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Checking physical IDs at festival bars slows down retail velocity massively, and fake IDs are incredibly common, constantly risking the organizer's liquor license. Eventra integrates with Decentralized Identity (DID) wallets (like Apple Wallet IDs or CLEAR). At the bar, attendees simply tap their phone to the NFC reader. A cryptographic Zero-Knowledge Proof (ZKP) is instantly executed, verifying the attendee is strictly over 21 without ever revealing their actual birthdate, address, or full name to the bartender.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">💳</span> ZKP Retail Terminal
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleTerminal}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     terminalActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {terminalActive ? 'Lock Terminal' : 'Unlock NFC Reader'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Verification Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 authStatus === 'ZKP_VERIFY' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 authStatus === 'APPROVED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 authStatus === 'REJECTED' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Cryptographic Result</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     authStatus === 'APPROVED' ? 'text-emerald-400' :
                     authStatus === 'REJECTED' ? 'text-red-500' :
                     authStatus === 'ZKP_VERIFY' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {authStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {authStatus === 'IDLE' ? 'Awaiting NFC Tap' : 
                      authStatus === 'SCANNING' ? 'Reading Payload' : 
                      authStatus === 'ZKP_VERIFY' ? 'Solving zk-SNARK Math' :
                      authStatus === 'APPROVED' ? '21+ Confirmed. Allow Sale.' : 'Underage Detected. Refuse Sale.'}
                   </span>
                 </div>
               </div>

               {/* PII Exposure Data */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center space-y-3">
                 
                 <div>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Birthdate Exposed</span>
                   <span className="text-xs font-mono font-bold text-slate-600">NULL (Zero-Knowledge)</span>
                 </div>

                 <div>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Address / ID# Exposed</span>
                   <span className="text-xs font-mono font-bold text-slate-600">NULL (Zero-Knowledge)</span>
                 </div>

                 <div>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Cryptographic Proof Valid</span>
                   <span className={`text-xs font-mono font-bold ${authStatus === 'APPROVED' ? 'text-emerald-400' : authStatus === 'REJECTED' ? 'text-red-500' : 'text-slate-600'}`}>
                     {authStatus === 'APPROVED' ? 'TRUE' : authStatus === 'REJECTED' ? 'FALSE' : 'PENDING'}
                   </span>
                 </div>

               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ZKP Terminal Log</span>
                 {authStatus === 'ZKP_VERIFY' && <span className="text-blue-400 animate-pulse">Computing Math...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {zkpLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'WEB3' ? 'text-blue-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Bartender POS & Phone Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Bartender iPad POS Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-slate-800 shadow-2xl relative flex flex-col h-[300px] overflow-hidden font-sans mb-8 bg-slate-100 transition-all duration-300 ${
              authStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
              authStatus === 'REJECTED' ? 'bg-red-50 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : ''
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 bg-white border-b border-slate-200 flex justify-between items-center z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Eventra POS • Main Bar</span>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Cart: $24.00</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-6 mt-8">
                
                {authStatus === 'IDLE' ? (
                  <div className="text-center opacity-60">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl text-slate-400">📡</span>
                    </div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Awaiting NFC Tap</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Alcohol purchase requires ID verification.</p>
                  </div>
                ) : authStatus === 'SCANNING' || authStatus === 'ZKP_VERIFY' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Verifying Identity</p>
                    <p className="text-[10px] font-bold text-blue-400 uppercase animate-pulse">Running Zero-Knowledge Proof...</p>
                  </div>
                ) : authStatus === 'APPROVED' ? (
                  <div className="text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform scale-110">
                      <span className="text-5xl text-white">✓</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 uppercase tracking-widest mb-1">APPROVED</p>
                    <p className="text-xs font-bold text-emerald-500 uppercase bg-emerald-100 px-3 py-1 rounded-full inline-block">Over 21 Verified</p>
                  </div>
                ) : (
                  <div className="text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform scale-110">
                      <span className="text-5xl text-white">✕</span>
                    </div>
                    <p className="text-2xl font-black text-red-600 uppercase tracking-widest mb-1">REJECTED</p>
                    <p className="text-xs font-bold text-red-500 uppercase bg-red-100 px-3 py-1 rounded-full inline-block">Under 21 Detected</p>
                  </div>
                )}

              </div>
            </div>

            {/* Attendee Phone NFC Simulator */}
            <div className="w-full bg-slate-900 p-5 rounded-[2rem] border-4 border-slate-700 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Attendee Digital Wallet</span>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => initiateNFCScan(false)}
                  disabled={!terminalActive || authStatus !== 'IDLE'}
                  className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                    !terminalActive || authStatus !== 'IDLE' ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 
                    'bg-slate-800 border-emerald-900 text-emerald-500 hover:bg-slate-700 hover:border-emerald-700'
                  }`}
                >
                  <span className="text-lg block mb-1">📱</span>
                  Tap Phone (Adult)
                </button>

                <button 
                  onClick={() => initiateNFCScan(true)}
                  disabled={!terminalActive || authStatus !== 'IDLE'}
                  className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                    !terminalActive || authStatus !== 'IDLE' ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 
                    'bg-slate-800 border-red-900 text-red-500 hover:bg-slate-700 hover:border-red-700'
                  }`}
                >
                  <span className="text-lg block mb-1">📱</span>
                  Tap Phone (Underage)
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DIDAlcoholSales;
