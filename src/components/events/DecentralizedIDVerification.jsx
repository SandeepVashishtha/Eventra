/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DecentralizedIDVerification = () => {
  const [oracleActive, setOracleActive] = useState(false);
  const [scanState, setScanState] = useState('IDLE'); // IDLE, SCANNING, VALID, UNDERAGE, FAKE
  
  // ZKP Metrics
  const [verifications, setVerifications] = useState(0);
  const [fakesBlocked, setFakesBlocked] = useState(0);
  const [privacyScore, setPrivacyScore] = useState(100);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'ZKP DID Oracle connection established.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Bartender POS NFC terminals awaiting taps.' }
  ]);

  const triggerScan = (type) => {
    if (!oracleActive || scanState === 'SCANNING') return;
    
    setScanState('SCANNING');
    addLog('ACTION', 'NFC tap detected. Initiating Zero-Knowledge cryptographic handshake.');
    
    setTimeout(() => {
        setScanState(type);
        
        if (type === 'VALID') {
            addLog('SUCCESS', 'ZK-Proof Valid. Cryptographic claim: User is OVER 21.');
            addLog('WEB3', 'Identity confirmed without revealing Name, DOB, or Address.');
            setVerifications(v => v + 1);
        } else if (type === 'UNDERAGE') {
            addLog('WARN', 'ZK-Proof Valid. Cryptographic claim: User is UNDER 21.');
            addLog('ACTION', 'Transaction denied. POS terminal locked for alcohol purchase.');
            setVerifications(v => v + 1);
        } else if (type === 'FAKE') {
            addLog('CRIT', 'INVALID SIGNATURE. Cryptographic hash mismatch on Oracle ledger.');
            addLog('ACTION', 'Fraudulent credential blocked. Flagging RFID tag in system.');
            setFakesBlocked(f => f + 1);
        }

        setTimeout(() => {
            setScanState('IDLE');
        }, 3000);
    }, 1200);
  };

  const toggleOracle = () => {
    if (!oracleActive) {
      setOracleActive(true);
      addLog('SYS', 'Decentralized Identity (DID) Nodes Synced. Zero-Knowledge proofs active.');
    } else {
      setOracleActive(false);
      setScanState('IDLE');
      addLog('WARN', 'DID Oracle connection lost. Falling back to physical ID checks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06080a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Oracle Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Cryptographic Identity
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized ID (DID) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">Zero-Knowledge Verification</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees frequently lose their physical IDs or use fake IDs at the bar. Checking physical cards creates massive bottlenecks and compromises attendee privacy by exposing their home address to strangers. Eventra fixes this with a Zero-Knowledge Proof (ZKP) Decentralized Identity protocol. Attendees verify their ID once through a secure government oracle before the festival. At the bar, they simply tap their NFC wristband. Eventra mathematically proves the user is "Over 21" without ever revealing their actual name, exact birthdate, or address to the vendor.
          </p>

          <div className="bg-[#0b0c16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🔗</span> ZKP Oracle Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleOracle}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     oracleActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {oracleActive ? 'Disconnect Web3 Oracle' : 'Initialize DID Blockchain Sync'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Total Scans */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 oracleActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Valid Assertions
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     oracleActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {verifications.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Fakes Blocked */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fakesBlocked > 0 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Frauds Blocked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fakesBlocked > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {fakesBlocked}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">scans</span>
                 </div>
               </div>
               
               {/* Privacy Score */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 oracleActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Anonymity Rating
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     oracleActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {privacyScore}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ZKP Verification Ledger</span>
                 {scanState === 'SCANNING' && <span className="text-indigo-400 animate-pulse">COMPUTING HASH...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' :
                       log.type === 'WEB3' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* POS Terminal Simulator */}
            <div className={`w-full rounded-[2rem] border-[12px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!oracleActive ? 'bg-[#0f172a]' : 'bg-[#060810]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">VENDOR POS TERMINAL</span>
                <span className="text-[8px] font-mono text-slate-400">NFC RECEIVER</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Data Privacy HUD */}
                <div className="flex space-x-2 mb-4">
                    <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col items-center">
                        <span className="text-[7px] text-slate-500 uppercase">NAME</span>
                        <span className="text-[10px] font-mono text-slate-700 blur-[2px]">John Doe</span>
                    </div>
                    <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col items-center">
                        <span className="text-[7px] text-slate-500 uppercase">DOB</span>
                        <span className="text-[10px] font-mono text-slate-700 blur-[2px]">05/12/1990</span>
                    </div>
                    <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col items-center">
                        <span className="text-[7px] text-slate-500 uppercase">ADDRESS</span>
                        <span className="text-[10px] font-mono text-slate-700 blur-[2px]">123 Main St</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    
                    {!oracleActive ? (
                       <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest">TERMINAL OFFLINE</span>
                    ) : scanState === 'SCANNING' ? (
                        <div className="flex flex-col items-center w-full">
                            {/* Scanning Animation */}
                            <div className="w-32 h-32 relative mb-4">
                                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
                                <div className="absolute inset-2 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl">📡</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-indigo-400 animate-pulse text-center">Reading NFC tag...<br/>Solving cryptographic proof...</span>
                        </div>
                    ) : scanState === 'VALID' ? (
                        <div className="flex flex-col items-center animate-bounce">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                <span className="text-5xl text-white font-black">+21</span>
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-widest text-emerald-400">AGE VERIFIED: OVER 21</span>
                            <span className="text-[9px] font-mono text-cyan-500 mt-1">✓ ZKP Signature Validated</span>
                        </div>
                    ) : scanState === 'UNDERAGE' ? (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                                <span className="text-5xl text-white font-black">-21</span>
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-widest text-orange-400">ACCESS DENIED: UNDER 21</span>
                            <span className="text-[9px] font-mono text-cyan-500 mt-1">✓ ZKP Signature Validated</span>
                        </div>
                    ) : scanState === 'FAKE' ? (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse">
                                <span className="text-5xl text-white">✖</span>
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-widest text-red-500">INVALID CREDENTIAL</span>
                            <span className="text-[9px] font-mono text-red-400 mt-1">Hash mismatch. Possible spoofing.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center opacity-40">
                            <div className="w-24 h-24 border-4 border-slate-600 border-dashed rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">📳</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">TAP WRISTBAND TO VERIFY</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800">
                    <div className="bg-cyan-950/30 border border-cyan-900/50 p-2 rounded flex flex-col items-center">
                        <span className="text-[8px] font-mono text-cyan-400">PRIVACY SHIELD ACTIVE</span>
                        <span className="text-[6px] font-mono text-slate-500 mt-0.5 text-center">Vendor has zero access to PII. True anonymity preserved.</span>
                    </div>
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b0c16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate NFC Taps</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerScan('VALID')}
                   disabled={!oracleActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !oracleActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-900 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                   }`}
                 >
                   Valid 21+
                 </button>
                 
                 <button 
                   onClick={() => triggerScan('UNDERAGE')}
                   disabled={!oracleActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !oracleActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Under 21
                 </button>

                 <button 
                   onClick={() => triggerScan('FAKE')}
                   disabled={!oracleActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !oracleActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                   }`}
                 >
                   Fake Spoof
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DecentralizedIDVerification;
