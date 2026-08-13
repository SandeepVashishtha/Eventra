/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DecentralizedAMMTicketExchange = () => {
  const [isDefiEnabled, setIsDefiEnabled] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  
  // AMM State (Constant Product Formula: x * y = k)
  const initialTickets = 100;
  const initialUSDC = 10000;
  const k = initialTickets * initialUSDC; // 1,000,000
  
  const [poolTickets, setPoolTickets] = useState(initialTickets);
  const [poolUSDC, setPoolUSDC] = useState(initialUSDC);
  
  // Legacy State
  const [scalperPrice, setScalperPrice] = useState(100);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Secondary market initialized. Ready for transactions.' }
  ]);

  // Calculate current AMM price based on x*y=k
  // Price of next 1 ticket = (k / (poolTickets - 1)) - poolUSDC
  const getAMMPrice = () => {
      if (poolTickets <= 1) return 0; // Prevent divide by zero/depletion
      const newUSDC = k / (poolTickets - 1);
      return newUSDC - poolUSDC;
  };
  
  const currentAMMPrice = getAMMPrice();

  const executeTransaction = () => {
      setIsTransacting(true);
      
      if (isDefiEnabled) {
          addLog('ACTION', 'User interacting with AMM Smart Contract...');
          
          setTimeout(() => {
              addLog('SYS', `Calculating Constant Product bonding curve (x * y = ${k}).`);
              
              setTimeout(() => {
                  if (poolTickets > 1) {
                      const pricePaid = currentAMMPrice;
                      setPoolTickets(prev => prev - 1);
                      setPoolUSDC(prev => prev + pricePaid);
                      addLog('SUCCESS', `Smart Contract executed. User paid $${pricePaid.toFixed(2)} USDC.`);
                      addLog('WARN', 'Liquidity Pool automatically adjusted new algorithmic price.');
                  }
                  setIsTransacting(false);
              }, 1200);
          }, 800);
          
      } else {
          // Legacy Scalper Market
          addLog('ACTION', 'User attempting to buy ticket from P2P marketplace...');
          
          setTimeout(() => {
              addLog('CRIT', 'Scalper manually adjusted listing price based on high demand.');
              setScalperPrice(900); // Scalper price gouging
              
              setTimeout(() => {
                  addLog('CRIT', 'Predatory pricing executed. User forced to pay $900.00 for a $100 ticket.');
                  setIsTransacting(false);
              }, 1500);
          }, 800);
      }
  };

  const toggleDefi = () => {
      const newState = !isDefiEnabled;
      setIsDefiEnabled(newState);
      setIsTransacting(false);
      
      // Reset states
      setPoolTickets(initialTickets);
      setPoolUSDC(initialUSDC);
      setScalperPrice(100);
      
      if (newState) {
          addLog('SUCCESS', 'Web3 DeFi initialized. Market controlled by AMM Smart Contract.');
      } else {
          addLog('CRIT', 'DeFi disabled. Market reverted to unregulated P2P Scalping.');
      }
  };
  
  const resetMarket = () => {
      setIsTransacting(false);
      setPoolTickets(initialTickets);
      setPoolUSDC(initialUSDC);
      setScalperPrice(100);
      addLog('SYS', 'Market liquidity and prices reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🪙</span> Web3 & Decentralized Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Market Maker <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">(AMM) Ticket Exchange</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Ticket resale markets are traditionally dominated by scalpers who set arbitrary, predatory prices, making last-minute tickets completely unaffordable for real fans. Eventra solves this by building a Web3 Automated Market Maker (AMM) liquidity pool. Instead of Peer-to-Peer selling, users deposit tickets into a smart contract. Buyers purchase directly from the pool. The exact price is determined algorithmically by a mathematical bonding curve (x * y = k) based purely on supply and demand, mathematically eliminating price gouging.
          </p>

          <div className="bg-[#120a03] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Market Architecture Configuration
               </h3>
               {(poolTickets !== initialTickets || scalperPrice !== 100) && (
                   <button onClick={resetMarket} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Market</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Protocol Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Exchange Protocol</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isDefiEnabled ? 'Active: Web3 Algorithmic Liquidity Pool' : 'Inactive: Unregulated Peer-to-Peer Market'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleDefi}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isDefiEnabled ? 'bg-yellow-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isDefiEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeTransaction}
                     disabled={isTransacting || poolTickets <= 1}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center ${
                         isTransacting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         isDefiEnabled ? 'bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' :
                         'bg-rose-900 hover:bg-rose-800 text-rose-300 border-rose-500'
                     }`}
                 >
                     {isTransacting ? (
                         <span className="animate-pulse">Processing Transaction...</span>
                     ) : isDefiEnabled ? (
                         <>Execute Smart Contract Buy: <span className="ml-2 font-mono">${currentAMMPrice.toFixed(2)}</span></>
                     ) : (
                         <>Buy from Scalper: <span className="ml-2 font-mono">${scalperPrice.toFixed(2)}</span></>
                     )}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Market Execution Logs</span>
                 {isTransacting && <span className="text-yellow-400 font-black animate-pulse">EXECUTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
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
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Market Dynamics Visualizer</span>
                      <span className="text-xs text-white font-bold">Price Determination Engine</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {isDefiEnabled ? (
                      // Web3 AMM View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-white font-bold text-sm">AMM Liquidity Pool</span>
                              <span className="text-[9px] font-mono bg-indigo-900/50 text-indigo-300 border border-indigo-500 px-2 py-1 rounded">Smart Contract: 0x7a2...2f1</span>
                          </div>
                          
                          {/* Pool Balances */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                                  <span className="text-2xl mb-1 z-10">🎫</span>
                                  <span className="text-xl font-black text-white font-mono z-10">{poolTickets}</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest z-10">Tickets (x)</span>
                              </div>
                              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                                  <span className="text-2xl mb-1 z-10">💵</span>
                                  <span className="text-xl font-black text-white font-mono z-10">${poolUSDC.toFixed(0)}</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest z-10">USDC (y)</span>
                              </div>
                          </div>

                          {/* Bonding Curve Equation */}
                          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner flex flex-col items-center mb-6 relative">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest absolute top-2 left-3">Constant Product Formula</span>
                              <div className="mt-4 font-mono text-lg text-white">
                                  <span className="text-blue-400">x</span> * <span className="text-emerald-400">y</span> = <span className="text-yellow-400">k</span>
                              </div>
                              <div className="mt-2 text-[10px] text-slate-400 font-mono">
                                  {poolTickets} * {poolUSDC.toFixed(2)} = {k}
                              </div>
                          </div>

                          {/* Current Price Output */}
                          <div className={`mt-auto bg-black/40 border p-4 rounded-xl flex items-center justify-between transition-colors duration-500 ${
                              isTransacting ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-900/20' : 'border-slate-800'
                          }`}>
                              <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Algorithmic Price</span>
                                  <span className="text-xs text-slate-500">Based purely on supply/demand</span>
                              </div>
                              <span className="text-2xl font-black text-yellow-400 font-mono">${currentAMMPrice.toFixed(2)}</span>
                          </div>
                      </div>
                  ) : (
                      // Legacy P2P Scalper View
                      <div className="flex flex-col h-full animate-fade-in-up justify-center items-center">
                          
                          <div className="w-full bg-rose-950/20 border-2 border-rose-900 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                              
                              <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-rose-500 flex items-center justify-center text-3xl mb-4 z-10 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                  👹
                              </div>
                              <span className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1 z-10">Anonymous Scalper</span>
                              <span className="text-[10px] text-slate-400 mb-6 z-10">"Ticketmaster_Bot_99"</span>

                              <div className="bg-black/50 p-4 rounded-lg border border-rose-500/50 w-full z-10">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Asking Price</span>
                                  <span className="text-4xl font-black text-rose-400 font-mono block transition-all duration-500">${scalperPrice.toFixed(2)}</span>
                                  
                                  {scalperPrice > 100 && (
                                      <span className="text-[9px] text-rose-500 font-bold bg-rose-950 px-2 py-0.5 rounded mt-2 inline-block">
                                          +800% Predatory Markup
                                      </span>
                                  )}
                              </div>
                          </div>

                          <div className="mt-8 text-center px-4">
                              <span className="text-[10px] text-slate-500 leading-relaxed block">
                                  In a traditional Peer-to-Peer market, humans control the listings. When demand spikes, scalpers arbitrarily jack up prices to extort real fans.
                              </span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120a03] p-4 rounded-xl border border-yellow-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-yellow-400 uppercase block mb-1">DeFi Bonding Curves:</span>
               With the AMM disabled, click <span className="text-rose-400 font-bold bg-slate-800 px-1 rounded">Buy from Scalper</span>. An anonymous human controls the price, arbitrarily gouging the fan for $900.<br/><br/>Now, toggle <span className="text-yellow-400 font-bold bg-slate-800 px-1 rounded">Exchange Protocol</span> ON. The market is replaced by a decentralized liquidity pool governed by `x * y = k`. Click Execute. The smart contract calculates the exact price mathematically. As supply (Tickets) drops, price rises exponentially, but completely transparently and without predatory human scalpers involved.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DecentralizedAMMTicketExchange;
