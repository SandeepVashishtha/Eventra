/* eslint-disable */
import React, { useState, useEffect } from 'react';

const LostFoundBounty = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [contractState, setContractState] = useState('IDLE'); // IDLE, LOCKED, VERIFYING, RELEASED
  
  // Smart Contract Metrics
  const [bountiesLocked, setBountiesLocked] = useState(0); // USDC
  const [activeContracts, setActiveContracts] = useState(0);
  const [successfulReturns, setSuccessfulReturns] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Decentralized Escrow Subnet Online.' },
    { id: 2, time: '12:00:02', type: 'SYS', msg: 'Awaiting Lost Item Smart Contract initialization.' }
  ]);

  // Visualizer State
  const [ownerWallet, setOwnerWallet] = useState(1500); // USDC
  const [finderWallet, setFinderWallet] = useState(25); // USDC
  const [escrowBalance, setEscrowBalance] = useState(0); // USDC

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (contractState === 'VERIFYING') {
              // Simulate verification process (QR scan + blockchain confirmation)
              setTimeout(() => {
                  if (contractState === 'VERIFYING') {
                      setContractState('RELEASED');
                      setFinderWallet(prev => prev + escrowBalance);
                      setEscrowBalance(0);
                      setSuccessfulReturns(prev => prev + 1);
                      setActiveContracts(prev => Math.max(0, prev - 1));
                      setBountiesLocked(prev => Math.max(0, prev - 100)); // Remove this contract's 100 USDC from total
                      
                      addLog('SUCCESS', 'Cryptographic Proof verified. Item returned to owner.');
                      addLog('ACTION', 'Escrow unlocked. Releasing 100 USDC bounty to Finder Wallet.');
                      
                      setTimeout(() => {
                          if (systemActive) setContractState('IDLE');
                      }, 3000);
                  }
              }, 2000);
          }

      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, contractState, escrowBalance]);

  const triggerLostItem = () => {
    if (!systemActive || contractState !== 'IDLE') return;
    
    setContractState('LOCKED');
    setOwnerWallet(prev => prev - 100);
    setEscrowBalance(100);
    setActiveContracts(prev => prev + 1);
    setBountiesLocked(prev => prev + 100);
    
    addLog('CRIT', 'User reported [iPhone 15 Pro] Lost in Sector B.');
    addLog('ACTION', 'Deploying Smart Contract. Locking 100 USDC Bounty into Escrow.');
  };

  const triggerFoundItem = () => {
      if (!systemActive || contractState !== 'LOCKED') return;
      
      setContractState('VERIFYING');
      addLog('WARN', 'Finder scanned physical Lock-Screen QR Code at Lost & Found booth.');
      addLog('SYS', 'Generating Zero-Knowledge proof of return...');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setContractState('IDLE');
      setOwnerWallet(1500);
      setFinderWallet(25);
      setEscrowBalance(0);
      setActiveContracts(0);
      setBountiesLocked(0);
      setSuccessfulReturns(0);
      addLog('SYS', 'Web3 Escrow Ledger Armed. Ready for bounty deployments.');
    } else {
      setSystemActive(false);
      setContractState('IDLE');
      addLog('WARN', 'Decentralized Escrow Offline. Relying on human honesty.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔗</span> Web3 Trustless Escrow
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Lost & Found <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Bounty Contracts</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When an attendee loses an expensive item (like a $1,000 phone), they have no reliable way to incentivize strangers to return it rather than stealing it. Eventra solves this via Game Theory Incentivization. If an attendee loses an item, they lock a cryptocurrency bounty (e.g., $100 USDC) into a smart contract. If another attendee finds it and scans the lock-screen QR code at the official Lost & Found, the contract automatically releases the funds to the finder, turning potential theft into a highly profitable, trustless good deed.
          </p>

          <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Smart Contract Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Sever Blockchain Link' : 'Initialize Escrow Network'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Total Locked Value */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bountiesLocked > 0 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Value Locked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     bountiesLocked > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     ${bountiesLocked}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">USDC</span>
                 </div>
               </div>

               {/* Active Contracts */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeContracts > 0 ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active Bounties
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     activeContracts > 0 ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {activeContracts}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Contracts</span>
                 </div>
               </div>
               
               {/* Successful Returns */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 successfulReturns > 0 ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Successful Returns
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     successfulReturns > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {successfulReturns}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Items</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>On-Chain Ledger</span>
                 {contractState === 'LOCKED' && <span className="text-red-500 font-black animate-pulse">FUNDS LOCKED IN ESCROW</span>}
                 {contractState === 'VERIFYING' && <span className="text-yellow-400 font-black animate-pulse">VERIFYING QR PROOF...</span>}
                 {contractState === 'RELEASED' && <span className="text-emerald-400 font-black">BOUNTY DISBURSED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Blockchain Escrow Flow Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0a1a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">SMART CONTRACT ESCROW</span>
                <span className="text-[8px] font-mono text-slate-400">NODE 1184</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-between py-12 px-8 overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NETWORK UNREACHABLE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-between items-center">
                      
                      {/* Connection lines background */}
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-0">
                          {/* Owner to Escrow */}
                          <path d="M 50% 15% L 50% 50%" stroke={contractState === 'LOCKED' ? '#ef4444' : 'rgba(255,255,255,0.05)'} strokeWidth="4" strokeDasharray="5 5" className={contractState === 'LOCKED' ? 'animate-[flowDown_0.5s_linear_infinite]' : ''}/>
                          {/* Escrow to Finder */}
                          <path d="M 50% 50% L 50% 85%" stroke={contractState === 'RELEASED' ? '#10b981' : 'rgba(255,255,255,0.05)'} strokeWidth="4" strokeDasharray="5 5" className={contractState === 'RELEASED' ? 'animate-[flowDown_0.5s_linear_infinite]' : ''}/>
                      </svg>

                      {/* Owner Node */}
                      <div className="w-full bg-[#111] border-2 border-slate-800 rounded-lg p-3 flex justify-between items-center z-10 shadow-lg">
                          <div className="flex items-center">
                              <span className="text-2xl mr-3">🧍‍♂️</span>
                              <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Wallet</span>
                                  <span className="text-xs font-mono text-slate-500">0x7F...9A2B</span>
                              </div>
                          </div>
                          <div className="text-right flex flex-col">
                              <span className="text-lg font-black text-white font-mono">${ownerWallet}</span>
                              <span className="text-[8px] text-slate-500">USDC</span>
                          </div>
                      </div>

                      {/* Escrow Smart Contract Node */}
                      <div className={`w-3/4 bg-[#0a0a1a] border-4 rounded-xl p-4 flex flex-col items-center justify-center z-10 transition-all duration-300 shadow-2xl relative overflow-hidden ${
                          contractState === 'LOCKED' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                          contractState === 'VERIFYING' ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-pulse' :
                          contractState === 'RELEASED' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-slate-800'
                      }`}>
                          
                          {contractState === 'VERIFYING' && (
                              <div className="absolute inset-0 bg-yellow-400/10 animate-ping"></div>
                          )}

                          <span className={`text-4xl mb-2 transition-transform ${contractState === 'VERIFYING' ? 'scale-110' : ''}`}>
                              {contractState === 'IDLE' ? '⛓️' : contractState === 'RELEASED' ? '🔓' : '🔒'}
                          </span>
                          
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Escrow Contract</span>
                          <span className={`text-2xl font-black font-mono transition-colors ${
                              contractState === 'LOCKED' ? 'text-red-400' :
                              contractState === 'VERIFYING' ? 'text-yellow-400' : 'text-slate-600'
                          }`}>
                              ${escrowBalance}
                          </span>
                          
                          {/* QR Scanner overlay */}
                          {contractState === 'VERIFYING' && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                  <div className="w-16 h-16 border-2 border-yellow-400 flex items-center justify-center">
                                      <div className="w-full h-0.5 bg-yellow-400 animate-[scan_1s_ease-in-out_infinite]"></div>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Finder Node */}
                      <div className="w-full bg-[#111] border-2 border-slate-800 rounded-lg p-3 flex justify-between items-center z-10 shadow-lg">
                          <div className="flex items-center">
                              <span className="text-2xl mr-3">🕵️</span>
                              <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finder Wallet</span>
                                  <span className="text-xs font-mono text-slate-500">0x3C...1E84</span>
                              </div>
                          </div>
                          <div className="text-right flex flex-col">
                              <span className={`text-lg font-black font-mono transition-colors ${contractState === 'RELEASED' ? 'text-emerald-400' : 'text-white'}`}>
                                  ${finderWallet}
                              </span>
                              <span className="text-[8px] text-slate-500">USDC</span>
                          </div>
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes flowDown {
                        from { stroke-dashoffset: 10; }
                        to { stroke-dashoffset: 0; }
                    }
                    @keyframes scan {
                        0% { transform: translateY(-16px); }
                        50% { transform: translateY(16px); }
                        100% { transform: translateY(-16px); }
                    }
                `}} />

              </div>
            </div>

            {/* Contract Triggers */}
            <div className="w-full bg-[#0a0a1a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Incident Timeline</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={triggerLostItem}
                   disabled={!systemActive || contractState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || contractState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   🚨 Report Lost Phone<br/>(Lock Bounty)
                 </button>

                 <button 
                   onClick={triggerFoundItem}
                   disabled={!systemActive || contractState !== 'LOCKED'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || contractState !== 'LOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   📱 Scan Found QR<br/>(Verify & Release)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default LostFoundBounty;
