/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartContractPayouts = () => {
  const [treasuryBalance, setTreasuryBalance] = useState(2500000); // USDC
  const [processingId, setProcessingId] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:45:00', type: 'SYS', msg: 'Escrow Smart Contract deployed to Ethereum mainnet.' },
    { id: 2, time: '23:45:05', type: 'SYS', msg: 'Treasury funded with 2,500,000 USDC.' }
  ]);

  const [artists, setArtists] = useState([
    { id: 'a1', name: 'Odesza', stage: 'Main Stage', time: '22:00 - 23:30', fee: 850000, status: 'PENDING', wallet: '0x7F5...3bA1' },
    { id: 'a2', name: 'Rufus Du Sol', stage: 'Neon Tent', time: '23:00 - 00:30', fee: 400000, status: 'PENDING', wallet: '0x1A2...9cD4' },
    { id: 'a3', name: 'John Summit', stage: 'Bass Pod', time: '00:00 - 01:30', fee: 250000, status: 'PENDING', wallet: '0x9E8...4fF2' }
  ]);

  const triggerSetComplete = (artistId) => {
    setProcessingId(artistId);
    const artist = artists.find(a => a.id === artistId);
    
    addLog('ACTION', `Stage Manager signed off [${artist.name}] set completion.`);
    
    setTimeout(() => {
        addLog('AI', `Oracle API verifying Stage Manager cryptographic signature...`);
        
        setTimeout(() => {
            addLog('SYS', `Signature verified. Smart contract executing transfer of ${artist.fee.toLocaleString()} USDC.`);
            
            setTimeout(() => {
                setTreasuryBalance(prev => prev - artist.fee);
                setArtists(prev => prev.map(a => a.id === artistId ? { ...a, status: 'PAID' } : a));
                setProcessingId(null);
                addLog('SUCCESS', `Tx Hash 0x${Math.random().toString(16).substr(2, 12)}... Confirmed on-chain. payout complete.`);
            }, 1500);
            
        }, 1200);
        
    }, 800);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060d09] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 DeFi & Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Artist Payouts <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">via Stablecoin Escrow</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            International artists wait 30 to 90 days after a festival to receive their performance fee due to slow bank wires, currency conversion fees, and bureaucratic accounting delays. Eventra solves this by replacing traditional wire transfers with a treasury smart contract backend. Exactly 60 minutes after the artist's set concludes (verified via an API call from the stage manager's app), the smart contract automatically executes, transferring the agreed-upon USDC (Stablecoin) directly to the artist's Web3 wallet instantly.
          </p>

          <div className="bg-[#0b140f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🏦</span> DAO Treasury Vault
               </h3>
               
               <div className="flex space-x-2">
                 <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-900 border border-slate-800 text-slate-500 flex items-center">
                   Network: Ethereum Mainnet
                 </span>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Treasury Balance */}
               <div className={`col-span-3 p-6 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-1000 ${
                 processingId ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Locked Escrow Liquidity
                 </span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono leading-none transition-colors duration-300 text-emerald-400">
                     {treasuryBalance.toLocaleString()}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-2 pb-1">USDC</span>
                 </div>
                 
                 {/* Decorative graphic */}
                 <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center justify-end pr-4">
                     <span className="text-8xl">🪙</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#060a08] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Etherscan Transaction Log</span>
                 {processingId && <span className="text-emerald-400 font-black animate-pulse">MINING BLOCK...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-300 font-bold' :
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' :
                       log.type === 'AI' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Stage Manager iPad App Simulator */}
            <div className={`w-full bg-[#0a110d] rounded-[1.5rem] border-[4px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Stage Manager Pro</span>
                      <span className="text-xs text-white font-bold">Artist Settlements</span>
                  </div>
                  <span className="text-2xl">📋</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a110d]">
                  
                  {artists.map((artist) => (
                      <div key={artist.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
                          
                          {/* Paid Overlay */}
                          {artist.status === 'PAID' && (
                              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-fade-in text-emerald-400">
                                  <span className="text-4xl mb-2">✅</span>
                                  <span className="font-black tracking-widest uppercase text-xs">USDC Transferred</span>
                                  <span className="font-mono text-[10px] mt-1 text-emerald-500/70">{artist.wallet}</span>
                              </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-3">
                              <div>
                                  <h4 className="text-lg font-black text-white">{artist.name}</h4>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{artist.stage} • {artist.time}</p>
                              </div>
                              <div className="text-right">
                                  <span className="text-sm font-bold text-emerald-400 block">${(artist.fee/1000).toFixed(0)}k</span>
                                  <span className="text-[10px] font-mono text-slate-600">{artist.wallet}</span>
                              </div>
                          </div>
                          
                          <div className="pt-3 border-t border-slate-800/50 flex justify-end">
                              <button
                                  onClick={() => triggerSetComplete(artist.id)}
                                  disabled={processingId !== null || artist.status === 'PAID'}
                                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center ${
                                      processingId === artist.id ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 cursor-wait' :
                                      'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                  }`}
                              >
                                  {processingId === artist.id ? (
                                      <>
                                          <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                                          Executing Smart Contract...
                                      </>
                                  ) : (
                                      'Sign Off Set Completed'
                                  )}
                              </button>
                          </div>
                      </div>
                  ))}
                  
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a140f] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-500 uppercase block mb-1">Decentralized Finance Engine:</span>
               Click <span className="text-slate-300 font-bold bg-slate-800 px-1 rounded">Sign Off Set Completed</span> on an artist's card. This simulates the Stage Manager cryptographically signing a payload that triggers the Escrow Smart Contract to release the USDC instantly on-chain.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartContractPayouts;
