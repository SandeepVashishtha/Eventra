/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const SmartContractSplitPayments = () => {
  const [isContractDeployed, setIsContractDeployed] = useState(false);
  const [splitRatio, setSplitRatio] = useState({ a: 60, b: 40 }); // Promoter A, Promoter B
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [walletA, setWalletA] = useState(0);
  const [walletB, setWalletB] = useState(0);
  
  const [transactions, setTransactions] = useState([]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'FinTech payment gateway standing by. Smart Contract inactive.' }
  ]);
  
  // Ref for auto-scrolling transactions
  const txContainerRef = useRef(null);

  const deployContract = () => {
      if (isContractDeployed) return;
      setIsContractDeployed(true);
      addLog('ACTION', 'Compiling Solidity Contract (Splitter.sol)...');
      setTimeout(() => {
          addLog('SUCCESS', `Contract Deployed to EVM. Immutable Split Enforced: [A: ${splitRatio.a}%] | [B: ${splitRatio.b}%]`);
      }, 800);
  };

  const resetContract = () => {
      setIsContractDeployed(false);
      setTotalRevenue(0);
      setWalletA(0);
      setWalletB(0);
      setTransactions([]);
      addLog('WARN', 'Contract Terminated. Vaults emptied.');
  };

  const simulateSale = () => {
      if (!isContractDeployed) {
          addLog('CRIT', 'Transaction Failed: Payment routing contract not deployed.');
          return;
      }
      
      const ticketPrices = [150, 250, 500, 1000];
      const amount = ticketPrices[Math.floor(Math.random() * ticketPrices.length)];
      
      const txId = '0x' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      
      // Calculate splits
      const splitA = amount * (splitRatio.a / 100);
      const splitB = amount * (splitRatio.b / 100);
      
      const newTx = {
          id: txId,
          amount: amount,
          splitA: splitA,
          splitB: splitB,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })
      };
      
      setTransactions(prev => [...prev, newTx].slice(-5)); // Keep last 5 visually
      
      setTotalRevenue(prev => prev + amount);
      setWalletA(prev => prev + splitA);
      setWalletB(prev => prev + splitB);
      
      addLog('SYS', `Sale [$${amount}] routed to Contract. Split executed instantly.`);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050b0f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💸</span> FinTech & Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Smart Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500">Revenue Splitter</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Multiple promotional companies often co-host a stage. Splitting the ticket revenue requires weeks of auditing, arguing over spreadsheets, and manual wire transfers. Eventra solves this by integrating a simulated Web3 Smart Contract engine. As digital tickets are sold via the frontend payment gateway, the backend instantly routes the fiat or stablecoin revenue through a programmatic splitter, automatically depositing funds to Co-Promoters in real-time.
          </p>

          <div className="bg-[#0b151a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Contract Configuration
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={isContractDeployed ? resetContract : deployContract}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isContractDeployed ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50' :
                     'bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {isContractDeployed ? 'Terminate Contract' : 'Deploy Splitter Contract'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Split Ratio Slider */}
               <div className="col-span-2 p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center">
                   <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                       <span className="text-blue-400">Promoter A ({splitRatio.a}%)</span>
                       <span className="text-purple-400">Promoter B ({splitRatio.b}%)</span>
                   </div>
                   
                   <input 
                       type="range" min="10" max="90" step="5" 
                       value={splitRatio.a} 
                       onChange={(e) => setSplitRatio({ a: Number(e.target.value), b: 100 - Number(e.target.value) })}
                       disabled={isContractDeployed}
                       className="w-full accent-emerald-500 mb-1 opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                   />
                   
                   {isContractDeployed && (
                       <span className="text-[8px] text-emerald-500 font-mono text-center uppercase tracking-widest mt-1 animate-pulse">
                           Contract Locked (Immutable)
                       </span>
                   )}
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#04090c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>EVM Transaction Ledger</span>
                 {isContractDeployed && <span className="text-emerald-400 font-black animate-pulse">LISTENING ON-CHAIN...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* FinTech Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Web3 Payment Gateway</span>
                      <span className="text-xs text-white font-bold">Live Ticket Sales Routing</span>
                  </div>
                  <button 
                      onClick={simulateSale}
                      className="bg-white text-slate-900 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-md flex items-center"
                  >
                      <span className="mr-1">💳</span> Buy Ticket
                  </button>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Total Revenue */}
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center mb-6">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Total Gross Revenue</span>
                      <span className="text-4xl font-black font-mono text-white">${totalRevenue.toLocaleString()}</span>
                  </div>

                  {/* Vaults */}
                  <div className="flex space-x-4 mb-6">
                      
                      <div className="flex-1 bg-blue-900/10 border border-blue-900/50 p-4 rounded-xl flex flex-col items-center relative overflow-hidden">
                          <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-1 z-10">Promoter A Vault</span>
                          <span className="text-xl font-black font-mono text-blue-400 z-10">${walletA.toLocaleString()}</span>
                          {/* Simulated fill level */}
                          <div className="absolute bottom-0 left-0 w-full bg-blue-900/30 transition-all duration-500" style={{ height: `${totalRevenue ? (walletA/totalRevenue)*100 : 0}%`}}></div>
                      </div>
                      
                      <div className="flex-1 bg-purple-900/10 border border-purple-900/50 p-4 rounded-xl flex flex-col items-center relative overflow-hidden">
                          <span className="text-[9px] text-purple-500 font-black uppercase tracking-widest mb-1 z-10">Promoter B Vault</span>
                          <span className="text-xl font-black font-mono text-purple-400 z-10">${walletB.toLocaleString()}</span>
                          <div className="absolute bottom-0 left-0 w-full bg-purple-900/30 transition-all duration-500" style={{ height: `${totalRevenue ? (walletB/totalRevenue)*100 : 0}%`}}></div>
                      </div>

                  </div>

                  {/* Transaction Flow Animation Area */}
                  <div className="flex-1 border-t border-slate-800 pt-4 relative overflow-hidden">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-3">Live Split Streams</span>
                      
                      <div className="space-y-2" ref={txContainerRef}>
                          {transactions.map((tx, i) => (
                              <div key={i} className="flex justify-between items-center text-[10px] font-mono animate-fade-in-up bg-slate-900/50 p-2 rounded border border-slate-800">
                                  <div className="flex flex-col">
                                      <span className="text-emerald-400">+${tx.amount}</span>
                                      <span className="text-slate-600">TX: {tx.id}</span>
                                  </div>
                                  
                                  <div className="flex space-x-2 text-slate-400">
                                      <span className="text-blue-400 mr-2">A: +${tx.splitA}</span>
                                      <span className="text-purple-400">B: +${tx.splitB}</span>
                                  </div>
                              </div>
                          ))}
                      </div>

                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b151a] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Algorithmic Settlement:</span>
               Adjust the split ratio and click <span className="text-white font-bold bg-emerald-600 px-1 rounded">Deploy Splitter Contract</span>. The configuration is locked (immutable). Click <span className="text-slate-900 font-bold bg-white px-1 rounded">Buy Ticket</span> to simulate live checkout traffic. The smart contract intercepts the fiat payment and automatically divides and deposits the exact percentage directly into Promoter A and Promoter B's respective vaults in real-time.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartContractSplitPayments;
