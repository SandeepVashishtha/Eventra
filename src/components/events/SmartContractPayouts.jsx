/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartContractPayouts = () => {
  const [setStatus, setSetStatus] = useState('SCHEDULED'); // SCHEDULED, PLAYING, COMPLETED
  const [contractState, setContractState] = useState('ESCROW'); // ESCROW, EXECUTING, SETTLED
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Ethereum Smart Contract [0x7a...4f] deployed. $50,000 USDC locked in escrow.' }
  ]);

  const artist = {
      name: 'Odesza',
      stage: 'Main Stage',
      wallet: '0x4F92...B31A',
      amount: '$50,000.00 USDC'
  };

  const startSet = () => {
      setSetStatus('PLAYING');
      addLog('ACTION', `Stage Manager marked ${artist.name} set as STARTED.`);
  };

  const endSet = () => {
      setSetStatus('COMPLETED');
      addLog('ACTION', `Stage Manager marked ${artist.name} set as COMPLETED.`);
      addLog('SYS', `Pushing cryptographically signed state payload to Web3 Oracle...`);
      
      setContractState('EXECUTING');
      
      setTimeout(() => {
          addLog('WARN', `Oracle verified set completion. Smart Contract [0x7a...4f] conditions met.`);
          
          setTimeout(() => {
              setContractState('SETTLED');
              addLog('SUCCESS', `Smart Contract Executed. ${artist.amount} routed to wallet ${artist.wallet}.`);
              addLog('ACTION', `Transaction confirmed on blockchain block #18492041. Zero accounting delay.`);
          }, 2000);
      }, 1500);
  };
  
  const resetDemo = () => {
      setSetStatus('SCHEDULED');
      setContractState('ESCROW');
      addLog('SYS', 'Demo reset. Contract re-funded and locked in Escrow.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06030a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-violet-900/40 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔗</span> Web3 & Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Smart Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-500 to-indigo-500">Artist Payouts</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Paying 150 different DJs takes weeks of manual accounting, wire transfers, and arguments over whether the artist played their full contracted set time. Eventra solves this by integrating a Web3 Smart Contract payout engine. The contract holds the fiat/stablecoin in escrow. When the stage manager clicks "Set Completed", a backend oracle triggers the smart contract, programmatically routing the funds to the artist's digital wallet in real-time.
          </p>

          <div className="bg-[#0b0512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-violet-500 text-lg mr-2">🎛️</span> Stage Manager iPad UI
               </h3>
               {contractState === 'SETTLED' && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex justify-center items-center mb-4">
                 
                 {/* iPad Mockup */}
                 <div className="w-[320px] h-[220px] bg-black border-8 border-slate-800 rounded-[2rem] p-4 flex flex-col relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                     
                     <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                         <span className="text-white font-bold">{artist.stage}</span>
                         <span className="text-xs text-slate-400">20:00 - 21:30</span>
                     </div>
                     
                     <div className="flex items-center mb-6">
                         <div className="w-12 h-12 bg-violet-900/50 border border-violet-500 rounded-full flex items-center justify-center text-xl mr-4">🎵</div>
                         <div className="flex flex-col">
                             <span className="text-white font-black text-xl">{artist.name}</span>
                             <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded w-max mt-1 ${
                                 setStatus === 'SCHEDULED' ? 'bg-slate-800 text-slate-400' :
                                 setStatus === 'PLAYING' ? 'bg-rose-900/50 text-rose-500 animate-pulse' :
                                 'bg-emerald-900/50 text-emerald-500'
                             }`}>
                                 {setStatus === 'PLAYING' ? '▶ LIVE' : setStatus}
                             </span>
                         </div>
                     </div>
                     
                     <div className="mt-auto grid grid-cols-2 gap-3">
                         <button 
                             onClick={startSet}
                             disabled={setStatus !== 'SCHEDULED'}
                             className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition-colors"
                         >
                             Start Set
                         </button>
                         <button 
                             onClick={endSet}
                             disabled={setStatus !== 'PLAYING'}
                             className={`py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
                                 setStatus === 'PLAYING' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'bg-slate-800 text-slate-500'
                             }`}
                         >
                             Complete Set
                         </button>
                     </div>
                 </div>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040208] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Oracle Logs</span>
                 {contractState === 'EXECUTING' && <span className="text-violet-400 font-black animate-pulse">SIGNING TX...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-violet-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
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
            
            {/* Blockchain Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Blockchain Explorer</span>
                      <span className="text-xs text-white font-bold">Smart Contract Engine</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Smart Contract Box */}
                  <div className={`w-full border-2 rounded-xl p-4 flex flex-col mb-12 relative z-10 transition-all duration-1000 ${
                      contractState === 'SETTLED' ? 'bg-slate-900 border-slate-800 opacity-50' : 
                      contractState === 'EXECUTING' ? 'bg-violet-950/40 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]' :
                      'bg-slate-900 border-slate-700'
                  }`}>
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-white">Eventra Escrow Contract</span>
                          <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">0x7a...4f</span>
                      </div>
                      
                      <div className="bg-black/50 p-3 rounded font-mono text-[9px] text-slate-400 space-y-1">
                          <div><span className="text-fuchsia-400">require</span>(oracle.setCompleted == <span className="text-emerald-400">true</span>);</div>
                          <div><span className="text-fuchsia-400">transfer</span>(artistWallet, <span className="text-amber-400">50000_USDC</span>);</div>
                      </div>

                      <div className="mt-4 flex justify-between items-end">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Locked Funds</span>
                          <span className={`text-xl font-black font-mono transition-colors ${
                              contractState === 'SETTLED' ? 'text-slate-600 line-through' : 'text-emerald-400'
                          }`}>
                              {artist.amount}
                          </span>
                      </div>
                      
                      {contractState === 'EXECUTING' && (
                          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
                              <div className="w-1 h-6 bg-violet-500/50 mb-1"></div>
                              <span className="text-xl animate-bounce text-violet-400">↓</span>
                          </div>
                      )}
                  </div>

                  {/* Artist Wallet Box */}
                  <div className={`w-full border-2 rounded-xl p-4 flex flex-col mt-auto relative z-10 transition-all duration-1000 ${
                      contractState === 'SETTLED' ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800'
                  }`}>
                      
                      {/* Particles for settlement */}
                      {contractState === 'SETTLED' && (
                          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                              <div className="absolute top-0 left-1/4 w-1 h-full bg-emerald-500/20 animate-pulse"></div>
                              <div className="absolute top-0 left-2/4 w-1 h-full bg-emerald-500/10 animate-[pulse_2s_infinite]"></div>
                              <div className="absolute top-0 left-3/4 w-1 h-full bg-emerald-500/30 animate-[pulse_1.5s_infinite]"></div>
                          </div>
                      )}

                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-white">Artist Digital Wallet</span>
                          <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{artist.wallet}</span>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-end">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Balance Received</span>
                          <span className={`text-2xl font-black font-mono transition-colors duration-1000 ${
                              contractState === 'SETTLED' ? 'text-emerald-400' : 'text-slate-600'
                          }`}>
                              {contractState === 'SETTLED' ? artist.amount : '$0.00'}
                          </span>
                      </div>
                  </div>

                  {/* SETTLED Overlay */}
                  {contractState === 'SETTLED' && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up">
                          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex flex-col items-center text-center max-w-[80%]">
                              <span className="text-4xl mb-3">✅</span>
                              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Automated Payout Complete</span>
                              <span className="text-[10px] text-slate-300">The smart contract successfully executed without human intervention. Zero accounting delay.</span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0512] p-4 rounded-xl border border-violet-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-violet-400 uppercase block mb-1">Programmable Money Escrow:</span>
               Click <span className="text-white font-bold bg-slate-800 px-1 rounded">Start Set</span> then <span className="text-white font-bold bg-emerald-600 px-1 rounded">Complete Set</span> on the iPad. Instead of a human accountant manually verifying the set time and wiring a check 60 days later, the backend acts as an Oracle. It cryptographically signs the "set completion" state and triggers the Smart Contract. The contract automatically executes its logic and instantly routes the $50,000 to the artist's digital wallet, bypassing the accounting department bottleneck entirely.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartContractPayouts;
