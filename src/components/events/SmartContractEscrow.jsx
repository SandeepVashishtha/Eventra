/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartContractEscrow = () => {
  const [contractActive, setContractActive] = useState(false);
  const [contractState, setContractState] = useState('PENDING'); // PENDING, VERIFYING, BREACH, PAID
  
  // Escrow Data
  const [escrowBalance, setEscrowBalance] = useState(2500000); // $2.5M
  const [artistName, setArtistName] = useState('DJ HEADLINER');
  
  // Telemetry Oracles
  const [rfidArrival, setRfidArrival] = useState('AWAITING');
  const [audioSetLength, setAudioSetLength] = useState(0); // minutes
  const [complianceScore, setComplianceScore] = useState(100); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Web3 Escrow Contract deployed.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting decentralized oracle telemetry.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (contractActive) {
      if (contractState === 'VERIFYING') {
        loop = setInterval(() => {
          setAudioSetLength(prev => {
             const next = prev + 5;
             if (next >= 90) { // 90 min set complete
                clearInterval(loop);
                setContractState('PAID');
                addLog('SUCCESS', 'Performance milestones met (90 min). Escrow funds released automatically.');
                return 90;
             }
             return next;
          });
        }, 300);
      } else if (contractState === 'BREACH') {
         // Contract breached, holding funds
         setComplianceScore(45);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [contractActive, contractState]);

  const triggerOnTime = () => {
    if (contractActive && contractState === 'PENDING') {
      setRfidArrival('VERIFIED ON-TIME');
      setContractState('VERIFYING');
      addLog('WEB3', 'Oracle: RFID Step-On logged exactly at 22:00:00.');
      addLog('ACTION', 'Milestone 1 met. Releasing 20% of funds. Tracking set length...');
      setEscrowBalance(2000000); // 20% released
    }
  };

  const triggerLateBreach = () => {
    if (contractActive && contractState === 'PENDING') {
      setRfidArrival('LATE (45 MINS)');
      setContractState('BREACH');
      setEscrowBalance(2500000); // Funds locked
      addLog('CRIT', 'Oracle: RFID Step-On missed deadline. Breach of Contract.');
      addLog('ACTION', 'Escrow locked. Funds withheld pending automated arbitration.');
    }
  };

  const resetContract = () => {
    setContractState('PENDING');
    setEscrowBalance(2500000);
    setRfidArrival('AWAITING');
    setAudioSetLength(0);
    setComplianceScore(100);
    addLog('SYS', 'Smart Contract reset and fully funded.');
  };

  const toggleContract = () => {
    if (!contractActive) {
      setContractActive(true);
      addLog('SYS', 'Decentralized Oracle Armed. Tracking artist telemetry.');
    } else {
      setContractActive(false);
      resetContract();
      addLog('WARN', 'Contract Offline. Escrow disabled.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📜</span> Decentralized Legal Oracle
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Smart Contract Escrow for <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Performance Payouts</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Artists occasionally show up hours late or play half their allotted time, yet still demand their full multi-million dollar booking fee, leading to massive legal disputes. Eventra solves this by executing artist contracts via Web3 Smart Contracts. Eventra acts as a decentralized oracle, feeding verifiable hardware data (stage step-on time via RFID, set length via audio clock integration) directly into the blockchain. The escrowed funds are programmatically released in tranches based on strict adherence to the performance milestones, removing human emotion from the payout process entirely.
          </p>

          <div className="bg-[#0b120c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">💎</span> Escrow Ledger
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleContract}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     contractActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {contractActive ? 'Suspend Oracle' : 'Fund Smart Contract'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Escrow Balance */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 contractState === 'PAID' ? 'bg-slate-900 border-slate-800' :
                 contractState === 'BREACH' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 contractActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Escrow Vault Balance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     contractState === 'PAID' ? 'text-slate-600' :
                     contractState === 'BREACH' ? 'text-red-400' :
                     contractActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     ${contractActive ? escrowBalance.toLocaleString() : '0'}
                   </span>
                 </div>
               </div>

               {/* Contract Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 contractState === 'PAID' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 contractState === 'BREACH' ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 contractState === 'VERIFYING' ? 'bg-teal-950/40 border-teal-500/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Contract State
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     contractState === 'PAID' ? 'text-emerald-400' :
                     contractState === 'BREACH' ? 'text-red-400 animate-pulse' :
                     contractState === 'VERIFYING' ? 'text-teal-400 animate-pulse' :
                     contractActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {contractActive ? contractState : 'OFFLINE'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ethereum Virtual Machine Log</span>
                 {contractState === 'VERIFYING' && <span className="text-teal-400 animate-pulse">Hashing Telemetry...</span>}
                 {contractState === 'PAID' && <span className="text-emerald-400 animate-pulse">FUNDS DISBURSED</span>}
                 {contractState === 'BREACH' && <span className="text-red-500 animate-pulse">CONTRACT VOIDED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* Oracle Telemetry Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">HARDWARE ORACLE HUB</span>
                <span className="text-[8px] font-mono text-slate-400">BLOCKCHAIN SYNC</span>
              </div>

              <div className="flex-1 relative bg-[#010403] overflow-hidden flex flex-col p-6 pt-12 space-y-4">
                
                {!contractActive ? (
                   <div className="flex-1 flex items-center justify-center">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AWAITING DEPLOYMENT</span>
                   </div>
                ) : (
                  <>
                    <div className="text-center mb-2">
                        <span className="text-sm font-black text-white">{artistName}</span>
                        <span className="text-[8px] font-mono text-slate-400 block">Contract ID: 0x8F9B...3C2</span>
                    </div>

                    {/* Milestone 1: RFID Arrival */}
                    <div className={`p-4 rounded-lg border ${rfidArrival === 'VERIFIED ON-TIME' ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : rfidArrival.includes('LATE') ? 'border-red-500 bg-red-950/20' : 'border-slate-700 bg-slate-900'} transition-all duration-300`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Milestone 1: Stage Arrival</span>
                            <span className="text-[8px] font-mono text-teal-400 bg-teal-950/50 px-2 rounded">Hardware: RFID Mat</span>
                        </div>
                        <span className={`text-[14px] font-bold ${rfidArrival === 'VERIFIED ON-TIME' ? 'text-emerald-400' : rfidArrival.includes('LATE') ? 'text-red-400' : 'text-slate-500'}`}>{rfidArrival}</span>
                    </div>

                    {/* Milestone 2: Audio Set Length */}
                    <div className={`p-4 rounded-lg border ${audioSetLength >= 90 ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : contractState === 'VERIFYING' ? 'border-teal-500 bg-teal-950/10' : 'border-slate-700 bg-slate-900'} transition-all duration-300`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Milestone 2: Performance Length</span>
                            <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/50 px-2 rounded">Hardware: DSP Clock</span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div className="flex items-end">
                                <span className={`text-[20px] font-bold font-mono leading-none ${audioSetLength >= 90 ? 'text-emerald-400' : contractState === 'VERIFYING' ? 'text-teal-400' : 'text-slate-500'}`}>{audioSetLength}</span>
                                <span className="text-[10px] text-slate-500 ml-1 pb-0.5">/ 90 mins</span>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${(audioSetLength / 90) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Contract Breach Overlay */}
                    {contractState === 'BREACH' && (
                        <div className="absolute inset-0 bg-red-950/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                            <div className="border border-red-500 bg-black p-4 rounded-xl flex flex-col items-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                                <span className="text-4xl mb-2">⚖️</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">CONTRACT BREACH DETECTED</span>
                                <span className="text-[8px] font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded">Funds withheld. Arbitration initialized.</span>
                            </div>
                        </div>
                    )}

                    {/* Paid Overlay */}
                    {contractState === 'PAID' && (
                        <div className="absolute inset-0 bg-emerald-950/40 z-20 flex flex-col items-end justify-start p-4 pointer-events-none mix-blend-screen">
                            <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500 bg-black/80 px-3 py-1 rounded shadow-[0_0_15px_#10b981] animate-pulse">TRANSACTION CONFIRMED</span>
                        </div>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerOnTime}
                disabled={!contractActive || contractState !== 'PENDING'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !contractActive || contractState !== 'PENDING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-teal-950/40 border-teal-900 text-teal-400 hover:bg-teal-900/60'
                }`}
              >
                Inject On-Time Arrival
              </button>
              
              <button 
                onClick={triggerLateBreach}
                disabled={!contractActive || contractState !== 'PENDING'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !contractActive || contractState !== 'PENDING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Late Arrival (Breach)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartContractEscrow;
