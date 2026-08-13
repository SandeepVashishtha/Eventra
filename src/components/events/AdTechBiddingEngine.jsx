/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AdTechBiddingEngine = () => {
  const [isAuctioning, setIsAuctioning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [secondPrice, setSecondPrice] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:30:00', type: 'SYS', msg: 'AdTech Engine ready. Awaiting Midnight Exit Surge.' }
  ]);

  const bids = [
      { id: 1, business: 'Luigi\'s Late Night Pizza', bidAmount: 4.50, budget: 500, cpm: 45.0, ad: '🍕 50% Off Slices for Eventra Attendees!' },
      { id: 2, business: 'Downtown Diner', bidAmount: 3.20, budget: 250, cpm: 32.0, ad: '🍔 24/7 Burgers just 2 blocks away.' },
      { id: 3, business: 'City Cab Co.', bidAmount: 4.10, budget: 1000, cpm: 41.0, ad: '🚕 Skip the surge! Flat rate rides home.' }
  ];

  const executeAuction = () => {
      setIsAuctioning(true);
      setWinner(null);
      setSecondPrice(0);
      addLog('ACTION', 'Initiating Real-Time Bidding (RTB) Auction...');
      
      setTimeout(() => {
          addLog('SYS', 'Evaluating Vickrey second-price auction logic for Midnight App Banner.');
          
          setTimeout(() => {
              // Sort bids high to low
              const sorted = [...bids].sort((a, b) => b.bidAmount - a.bidAmount);
              const winningBid = sorted[0];
              const secondHighest = sorted[1];
              
              setWinner(winningBid);
              // Vickrey auction: Winner pays 1 cent more than the second highest bid
              setSecondPrice(secondHighest.bidAmount + 0.01);
              
              setIsAuctioning(false);
              addLog('SUCCESS', `Auction Won by '${winningBid.business}'. Clearing Price: $${(secondHighest.bidAmount + 0.01).toFixed(2)} CPM.`);
              addLog('ACTION', `Serving Ad Creative to 25,000 exiting attendees.`);
          }, 1500);
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0a04] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> AdTech & Algorithmic Bidding
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Micro-Sponsorship <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500">Ad Bidding Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Local businesses want to advertise to the massive festival crowd leaving at midnight, but sales teams only have time to close $50k corporate sponsorships, leaving local ad revenue on the table. Eventra solves this by building an automated AdTech bidding platform. Local businesses set a small budget and bid on app banner space. The backend runs a real-time Vickrey auction, programmatically serving the highest bidder's ad to users as they leave the gates.
          </p>

          <div className="bg-[#140f0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🎛️</span> DSP (Demand-Side Platform)
               </h3>
               <button 
                     onClick={executeAuction}
                     disabled={isAuctioning}
                     className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition shadow-md flex items-center whitespace-nowrap disabled:opacity-50"
                 >
                     <span className="mr-2">⚡</span> {isAuctioning ? 'Running Auction...' : 'Execute RTB Auction'}
                 </button>
             </div>

             <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden mb-4 flex flex-col">
                 <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900 border-b border-slate-800 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                     <div className="col-span-5">Advertiser</div>
                     <div className="col-span-3 text-center">Budget</div>
                     <div className="col-span-4 text-right">Max CPM Bid</div>
                 </div>
                 
                 <div className="p-2 space-y-2">
                     {bids.map(bid => (
                         <div 
                            key={bid.id} 
                            className={`grid grid-cols-12 gap-2 p-3 rounded-lg border transition-all ${
                                winner?.id === bid.id ? 'bg-amber-900/20 border-amber-500/50 shadow-sm' : 'bg-[#111827] border-slate-800'
                            }`}
                         >
                             <div className="col-span-5 flex flex-col justify-center">
                                 <span className={`text-xs font-bold ${winner?.id === bid.id ? 'text-amber-400' : 'text-slate-300'}`}>{bid.business}</span>
                             </div>
                             <div className="col-span-3 flex items-center justify-center">
                                 <span className="text-[10px] font-mono text-slate-400">${bid.budget}</span>
                             </div>
                             <div className="col-span-4 flex items-center justify-end">
                                 <span className={`text-sm font-black font-mono ${winner?.id === bid.id ? 'text-amber-500' : 'text-slate-300'}`}>${bid.cpm.toFixed(2)}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#0a0705] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>SSP Exchange Logs</span>
                 {isAuctioning && <span className="text-amber-400 font-black animate-pulse">EVALUATING BIDS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' : 
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
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
          
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile App Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-20"></div>
              
              {/* App Content */}
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-12 pb-6 px-4">
                  
                  <div className="flex justify-between items-center mb-6">
                      <span className="text-white font-black text-xl">Eventra</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">Day 3</span>
                  </div>

                  {/* Festival Map Mockup */}
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4 relative overflow-hidden flex flex-col items-center justify-center p-4">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIj48ZyBmaWxsPSIjM2I4MmY2IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMjAiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIxMDAiIHI9IjMwIi8+PGNpcmNsZSBjeD0iNjAwIiBjeT0iMTUwIiByPSIyNSIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjMwMCIgcj0iMTUiLz48L2c+PC9zdmc+')] bg-cover bg-no-repeat opacity-30"></div>
                      
                      <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-full flex items-center justify-center text-2xl mb-4 z-10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                          🚶
                      </div>
                      <span className="text-white font-bold text-center z-10">Festival Over</span>
                      <span className="text-slate-400 text-xs text-center z-10 mt-1">Please head to the nearest exit.</span>
                  </div>

                  {/* Ad Banner Slot */}
                  <div className="w-full h-[100px] bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl relative overflow-hidden flex items-center justify-center transition-all duration-500">
                      
                      {isAuctioning ? (
                          <div className="flex flex-col items-center">
                              <span className="text-3xl mb-1 animate-bounce">🔨</span>
                              <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest animate-pulse">Running Auction...</span>
                          </div>
                      ) : winner ? (
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-yellow-900/80 p-3 flex flex-col justify-center animate-fade-in-up">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-[9px] bg-black/50 text-amber-200 px-1 rounded uppercase font-bold tracking-widest">Sponsored</span>
                                  <span className="text-[8px] text-amber-200/50">Ad</span>
                              </div>
                              <span className="text-sm font-black text-white leading-tight mb-1">{winner.business}</span>
                              <span className="text-xs text-amber-100/90">{winner.ad}</span>
                          </div>
                      ) : (
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Ad Slot (320x100)</span>
                      )}

                  </div>
                  
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#140f0a] p-4 rounded-xl border border-amber-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-amber-400 uppercase block mb-1">Vickrey Second-Price Auction:</span>
               Click <span className="text-white font-bold bg-amber-600 px-1 rounded">Execute RTB Auction</span>. The algorithm automatically accepts bids from local businesses. Luigi's Pizza bids the highest ($45 CPM) and wins the slot. However, because it's a Vickrey auction, Luigi's only pays 1 cent more than the second-highest bid (City Cab Co. at $41 CPM). The clearing price is $41.01, ensuring advertisers bid their true valuation without overpaying, and the ad is served to the user's phone instantly.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AdTechBiddingEngine;
