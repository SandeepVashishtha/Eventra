import React, { useState, useEffect } from 'react';

const NFTTicketRoyalties = () => {
  const [simulationState, setSimulationState] = useState('idle'); // idle, listed, bought, executed
  
  const [organizerWallet, setOrganizerWallet] = useState(45200.00); // USD
  const [scalperWallet, setScalperWallet] = useState(0.00);
  
  const basePrice = 500;
  const resalePrice = 2500;
  const markup = resalePrice - basePrice;
  const royaltyPercent = 20;
  const royaltyAmount = markup * (royaltyPercent / 100);

  const simulateTransaction = () => {
    setSimulationState('listed');
    
    setTimeout(() => {
      setSimulationState('bought');
      
      setTimeout(() => {
        setSimulationState('executed');
        
        // Execute Smart Contract Logic
        setOrganizerWallet(prev => prev + royaltyAmount);
        setScalperWallet(markup - royaltyAmount);
        
        setTimeout(() => {
          setSimulationState('idle');
        }, 5000);
        
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Blockchain Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            NFT-Based Secondary <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Royalty Enforcement</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Scalpers buy premium tickets and resell them for massive profits, while the original creator sees zero revenue from the markup. Eventra mints high-tier VIP tickets as smart contracts on Polygon. If a ticket is resold on a secondary market, the hardcoded contract instantly enforces a 20% royalty fee on the markup, automatically routing funds back to the event organizer.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🏦</span> Organizer Treasury Wallet
               </h3>
               <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded text-[10px] font-mono">Polygon Network</span>
             </div>

             <div className="mb-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white flex flex-col justify-center">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Total Recovered Royalties</span>
               <div className="flex items-baseline space-x-2">
                 <span className="text-4xl font-black font-mono transition-all duration-500">
                   ${organizerWallet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </span>
                 <span className="text-sm font-bold text-emerald-400">USD</span>
               </div>
               {simulationState === 'executed' && (
                 <span className="text-xs text-emerald-400 font-bold mt-2 animate-fade-in-up">
                   + ${royaltyAmount.toFixed(2)} received from contract execution
                 </span>
               )}
             </div>

             <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-400 uppercase font-bold tracking-widest text-[10px] block mb-2">Smart Contract Execution Log</span>
               
               <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                 {simulationState === 'idle' && (
                   <div className="text-slate-500">Monitoring Polygon mempool for EIP-2981 royalty transfers...</div>
                 )}
                 {simulationState === 'listed' && (
                   <div className="text-amber-600 animate-fade-in-up">
                     &gt; ALERT: Eventra VIP Token #8492 listed on OpenSea.
                     <br/>&gt; Listing Price: $2,500.00
                   </div>
                 )}
                 {simulationState === 'bought' && (
                   <div className="text-sky-600 animate-fade-in-up">
                     &gt; Transaction detected. Token #8492 purchased.
                     <br/>&gt; Triggering Eventra_Royalty_V1.sol contract...
                     <br/>&gt; Calculating 20% royalty on $2,000 markup...
                   </div>
                 )}
                 {simulationState === 'executed' && (
                   <div className="text-emerald-600 animate-fade-in-up font-bold bg-emerald-50 p-2 rounded">
                     &gt; SPLIT EXECUTED SUCCESSFULLY
                     <br/>&gt; Routing $400.00 to Organizer Treasury
                     <br/>&gt; Routing $1,600.00 to Scalper Wallet
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Secondary Market Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-slate-900 rounded-[2rem] border-[8px] border-slate-950 shadow-2xl relative flex flex-col h-[600px] overflow-hidden text-white">
            
            {/* Fake OpenSea Header */}
            <div className="h-12 bg-slate-800 border-b border-slate-700 px-4 flex items-center justify-between z-20">
              <span className="font-bold text-sm flex items-center"><span className="text-indigo-400 text-lg mr-2">⛵</span> Secondary Market</span>
              <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 relative flex flex-col">
              
              {/* NFT Image */}
              <div className="w-full aspect-square bg-black rounded-2xl border border-slate-700 mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter contrast-125 saturate-150 mix-blend-screen opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-violet-600/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                   <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-lg mb-2">Eventra 2026</h2>
                   <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-mono border border-white/20">VIP All-Access Pass</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Token #8492</div>
              </div>

              {/* Listing Details */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Current Price</span>
                    <span className="text-2xl font-black">${resalePrice.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Original Mint</span>
                    <span className="text-sm font-bold text-slate-300 line-through">${basePrice.toLocaleString()}</span>
                  </div>
                </div>

                {simulationState === 'idle' ? (
                  <button 
                    onClick={simulateTransaction}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-lg text-sm uppercase tracking-widest transition shadow-lg mt-auto"
                  >
                    Simulate Purchase
                  </button>
                ) : simulationState === 'listed' ? (
                  <div className="w-full bg-slate-700 text-slate-300 font-black py-3 rounded-lg text-sm uppercase tracking-widest text-center mt-auto flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin mr-2"></div>
                    Processing TX...
                  </div>
                ) : (
                  <div className="w-full bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-black py-3 rounded-lg text-sm uppercase tracking-widest text-center mt-auto flex items-center justify-center">
                    <span className="mr-2">✓</span> Item Sold
                  </div>
                )}
              </div>
            </div>

            {/* Scalper Wallet Overlay (To show the split) */}
            <div className={`absolute top-16 right-4 bg-slate-800/90 backdrop-blur border border-slate-600 p-3 rounded-xl shadow-2xl transition-all duration-500 z-30 transform ${
              simulationState === 'executed' ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'
            }`}>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Scalper Profit</span>
              <span className="text-lg font-black font-mono text-rose-400">
                +${scalperWallet.toLocaleString()}
              </span>
              <span className="block text-[8px] text-slate-500 mt-1">-20% Enforced Royalty</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default NFTTicketRoyalties;
