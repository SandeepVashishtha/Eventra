/* eslint-disable */
import React, { useState, useEffect } from 'react';

const OnChainTicketingRoyalties = () => {
  const [contractActive, setContractActive] = useState(false);
  const [artistWallet, setArtistWallet] = useState(0.00); // ETH
  const [scalperWallet, setScalperWallet] = useState(0.00); // ETH
  const [transactionPending, setTransactionPending] = useState(false);
  
  const [chainLog, setChainLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Eventra L2 Ticketing Node initialized on Polygon Mainnet.' },
    { id: 2, time: '10:00:05', type: 'SYS', msg: 'ERC-721 Smart Contract deployed. Royalty enforcement set to 10%.' }
  ]);

  const FACE_VALUE = 0.05; // ETH (~$150)
  const SCALPER_PRICE = 0.25; // ETH (~$750) 500% markup

  const simulateResale = () => {
    if (!contractActive && !transactionPending) {
      setContractActive(true);
      setTransactionPending(true);
      
      addLog('TX', `Initiating secondary transfer: Token ID #44921.`);
      addLog('MARKET', `Resale Price: ${SCALPER_PRICE} ETH (500% markup from Face Value).`);
      
      setTimeout(() => {
        addLog('CONTRACT', `Executing EIP-2981 royalty standard. Capturing 10% from gross transfer.`);
        
        setTimeout(() => {
          const royaltyCut = SCALPER_PRICE * 0.10; // 10%
          const scalperCut = SCALPER_PRICE - royaltyCut; // 90%
          
          setArtistWallet(prev => prev + royaltyCut);
          setScalperWallet(prev => prev + scalperCut);
          
          addLog('SUCCESS', `Royalty routed. Artist received ${royaltyCut.toFixed(3)} ETH automatically.`);
          setTransactionPending(false);
          
          setTimeout(() => {
            setContractActive(false);
          }, 3000);

        }, 1200);
      }, 800);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setChainLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            On-Chain Ticketing & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">Secondary Royalties</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Scalping is the oldest problem in live events. Third parties buy tickets and resell them at a 500% markup, while the artist and organizer see exactly zero dollars of that profit. Trying to legally ban scalping has proven entirely ineffective. Eventra solves this via Web3. By issuing tickets as NFTs on a Layer-2 blockchain (like Polygon), a smart contract enforces a strict, un-bypassable 10% royalty on all secondary transfers. When a scalper resells a ticket, the blockchain automatically routes 10% of the gross profit directly to the artist's crypto wallet.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">📜</span> EIP-2981 Royalty Contract
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={simulateResale}
                   disabled={transactionPending}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     transactionPending ? 'bg-purple-100 text-purple-500 border border-purple-200 cursor-not-allowed' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {transactionPending ? 'Awaiting Block...' : 'Simulate Scalper Resale'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Artist Wallet */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 contractActive ? 'bg-emerald-50 border-emerald-200 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Artist DAO Wallet</span>
                 <div className="flex flex-col">
                   <div className="flex items-end">
                     <span className={`text-4xl font-black font-mono leading-none ${
                       contractActive ? 'text-emerald-600' : 'text-slate-700'
                     }`}>
                       {artistWallet.toFixed(3)}
                     </span>
                     <span className="text-sm font-bold text-slate-400 ml-2 pb-1">ETH</span>
                   </div>
                   <span className="text-[10px] font-mono text-emerald-500 mt-2">
                     +10% Perpetual Royalty
                   </span>
                 </div>
               </div>

               {/* Scalper Wallet */}
               <div className="p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-50 border-slate-200">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Secondary Market Seller</span>
                 <div className="flex flex-col">
                   <div className="flex items-end">
                     <span className="text-4xl font-black font-mono leading-none text-slate-700">
                       {scalperWallet.toFixed(3)}
                     </span>
                     <span className="text-sm font-bold text-slate-400 ml-2 pb-1">ETH</span>
                   </div>
                   <span className="text-[10px] font-mono text-slate-500 mt-2">
                     Gross minus royalties
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Polygon L2 Execution Log</span>
                 {transactionPending && <span className="text-purple-400 animate-pulse">Mining...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {chainLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CONTRACT' ? 'text-purple-400 font-bold' :
                       log.type === 'MARKET' ? 'text-orange-300' :
                       log.type === 'TX' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Blockchain Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-3xl border border-slate-200 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-slate-50 border-b border-slate-200">
              <span className="text-slate-800 text-[10px] font-black uppercase tracking-widest flex items-center">
                Mempool Explorer
              </span>
              <span className="text-[10px] font-mono text-purple-600">
                L2: POLYGON
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-100 overflow-hidden pt-12 items-center justify-center p-6">
               
               {/* Blockchain Background */}
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50 z-0"></div>

               {/* NFT Ticket Asset */}
               <div className={`w-full max-w-[240px] bg-white rounded-xl shadow-lg border border-slate-200 z-10 flex flex-col overflow-hidden transition-transform duration-500 ${transactionPending ? 'scale-95' : 'scale-100'}`}>
                 <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-900 relative">
                   <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
                     <span className="text-white text-3xl font-black uppercase tracking-widest drop-shadow-md">VIP</span>
                     <span className="text-purple-200 text-[10px] font-mono mt-1">TOKEN #44921</span>
                   </div>
                 </div>
                 <div className="p-4 flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smart Contract Address</span>
                   <span className="text-xs font-mono text-slate-800 break-all bg-slate-50 p-1 rounded border border-slate-100 mt-1">
                     0x8f3C9...4bE1
                   </span>
                 </div>
               </div>

               {/* Transaction Flow Animation */}
               <div className={`w-full max-w-[240px] mt-6 bg-white rounded-xl p-4 shadow-lg border relative z-10 transition-all duration-500 ${
                 transactionPending ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-slate-200'
               }`}>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                   Transaction Router
                 </div>
                 
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-mono text-slate-600">Total Paid:</span>
                   <span className="text-sm font-black text-slate-800">{transactionPending || artistWallet > 0 ? SCALPER_PRICE.toFixed(2) : '0.00'} ETH</span>
                 </div>

                 {/* Routing Logic Visual */}
                 <div className="relative h-16 mt-4 border-l-2 border-slate-200 ml-2">
                   
                   {/* Route to Scalper */}
                   <div className="absolute top-0 -left-[5px] w-full flex items-center">
                     <div className={`w-2 h-2 rounded-full ${transactionPending ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                     <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                     <div className="flex flex-col items-end min-w-[80px]">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Seller (90%)</span>
                       <span className={`text-xs font-mono font-bold ${transactionPending ? 'text-slate-800' : 'text-slate-400'}`}>
                         {transactionPending || artistWallet > 0 ? (SCALPER_PRICE * 0.90).toFixed(3) : '0.000'}
                       </span>
                     </div>
                   </div>

                   {/* Route to Artist */}
                   <div className="absolute bottom-0 -left-[5px] w-full flex items-center">
                     <div className={`w-2 h-2 rounded-full ${transactionPending ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                     <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                     <div className="flex flex-col items-end min-w-[80px]">
                       <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1 rounded">Royalty (10%)</span>
                       <span className={`text-xs font-mono font-black ${transactionPending ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {transactionPending || artistWallet > 0 ? (SCALPER_PRICE * 0.10).toFixed(3) : '0.000'}
                       </span>
                     </div>
                   </div>

                   {/* Flow animation */}
                   {transactionPending && (
                     <div className="absolute top-0 bottom-0 left-[-5px] w-2 overflow-hidden">
                       <div className="w-2 h-4 bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-[flowDown_1s_linear_infinite]"></div>
                     </div>
                   )}
                   
                   <style dangerouslySetInnerHTML={{__html: `
                     @keyframes flowDown {
                       0% { transform: translateY(-100%); }
                       100% { transform: translateY(400%); }
                     }
                   `}} />

                 </div>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OnChainTicketingRoyalties;
