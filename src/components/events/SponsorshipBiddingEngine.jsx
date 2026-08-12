/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SponsorshipBiddingEngine = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [biddingState, setBiddingState] = useState('AUCTION_OPEN'); // AUCTION_OPEN, BIDDING_WAR, AD_DELIVERED
  
  // CV & Demographic Data
  const [dominantDemographic, setDominantDemographic] = useState('Mixed');
  const [averageAge, setAverageAge] = useState(24);
  const [crowdEnergy, setCrowdEnergy] = useState(50); // %
  
  // RTB Auction State
  const [currentWinner, setCurrentWinner] = useState('Eventra Promo');
  const [winningBid, setWinningBid] = useState(15.50); // CPM
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Programmatic Ad-Tech Engine online.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Computer Vision nodes capturing anonymized demographics.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (engineActive && biddingState === 'AUCTION_OPEN') {
      loop = setInterval(() => {
        // Base idle auction
        setWinningBid(prev => Math.max(10, Math.min(25, prev + (Math.random() * 2 - 1))));
      }, 1000);
    } else if (engineActive && biddingState === 'BIDDING_WAR') {
      loop = setInterval(() => {
        // High frequency algorithmic bidding war
        setWinningBid(prev => Math.min(450, prev + (Math.random() * 30 + 10)));
        
        if (winningBid > 350) {
          setBiddingState('AD_DELIVERED');
          addLog('SUCCESS', `Auction Closed. Winner: ${currentWinner} at $${winningBid.toFixed(2)} CPM.`);
          
          setTimeout(() => {
            addLog('SYS', 'Pushing high-res 4K MP4 asset to physical LED Totem #14.');
          }, 800);
        }
      }, 200);
    } else if (engineActive && biddingState === 'AD_DELIVERED') {
      // Ad plays for 5 seconds then resets auction
      loop = setTimeout(() => {
        resetAuction();
      }, 5000);
    }
    
    return () => { if (loop) clearTimeout(loop); clearInterval(loop); };
  }, [engineActive, biddingState, winningBid, currentWinner]);

  const triggerGenZSurge = () => {
    if (engineActive && biddingState === 'AUCTION_OPEN') {
      setDominantDemographic('Gen Z / Bass Fans');
      setAverageAge(21);
      setCrowdEnergy(95);
      setCurrentWinner('Red Bull / Monster');
      setBiddingState('BIDDING_WAR');
      addLog('CV', 'Demographic Shift: High-Energy youth crowd detected near Totem 14.');
      addLog('ACTION', 'RTB Demand Spike: Energy Drink brands initiating bidding war.');
    }
  };

  const triggerLuxurySurge = () => {
    if (engineActive && biddingState === 'AUCTION_OPEN') {
      setDominantDemographic('High-Net VIP');
      setAverageAge(38);
      setCrowdEnergy(40);
      setCurrentWinner('Rolex / Amex Centurion');
      setBiddingState('BIDDING_WAR');
      addLog('CV', 'Demographic Shift: Mature, affluent crowd detected near VIP Lounge.');
      addLog('ACTION', 'RTB Demand Spike: Luxury brands initiating bidding war.');
    }
  };

  const resetAuction = () => {
    setBiddingState('AUCTION_OPEN');
    setCurrentWinner('Eventra Default');
    setWinningBid(15.50);
    setDominantDemographic('Mixed');
    setAverageAge(24);
    setCrowdEnergy(50);
    addLog('SYS', 'Ad cycle complete. Re-opening header bidding auction for next impression.');
  };

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      addLog('SYS', 'Real-Time Bidding Engine Armed. Exposing LED inventory to SSPs.');
    } else {
      setEngineActive(false);
      resetAuction();
      addLog('WARN', 'Programmatic engine offline. Defaulting to flat-rate static loop.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: AdTech Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Programmatic Ad-Tech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Sponsorship <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500">Header Bidding Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Digital signage across festivals is traditionally sold at fixed, flat rates, failing to capitalize on massive demographic shifts as different crowds migrate between stages. Eventra solves this by implementing an ad-tech header bidding engine for the physical LED totems. It uses anonymized edge-compute computer vision to detect the age and vibe of the crowd currently standing near a screen. Brands programmatically bid in real-time on our ad exchange to display their targeted creative to that specific audience, maximizing CPM revenue.
          </p>

          <div className="bg-[#121326] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">💱</span> RTB Exchange Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Disable RTB Engine' : 'Open Ad Exchange'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Winning Bid */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 biddingState === 'AD_DELIVERED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                 biddingState === 'BIDDING_WAR' ? 'bg-pink-950/40 border-pink-500/50 shadow-inner' :
                 engineActive ? 'bg-violet-950/20 border-violet-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Auction (CPM)
                 </span>
                 <div className="flex flex-col">
                   <div className="flex items-end">
                     <span className="text-xl font-bold text-slate-500 mr-1 pb-1">$</span>
                     <span className={`text-4xl font-black font-mono leading-none ${
                       biddingState === 'AD_DELIVERED' ? 'text-emerald-400' :
                       biddingState === 'BIDDING_WAR' ? 'text-pink-400 animate-pulse' :
                       engineActive ? 'text-violet-400' : 'text-slate-600'
                     }`}>
                       {engineActive ? winningBid.toFixed(2) : '0.00'}
                     </span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest font-mono text-ellipsis overflow-hidden whitespace-nowrap">
                     {engineActive ? `Highest Bidder: ${currentWinner}` : 'Exchange Closed'}
                   </span>
                 </div>
               </div>

               {/* CV Demographics */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 biddingState === 'BIDDING_WAR' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 engineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   CV Crowd Profile (Local)
                 </span>
                 <div className="flex flex-col text-[10px] font-mono text-slate-400 space-y-1 mt-1">
                   <div className="flex justify-between border-b border-slate-700 pb-1">
                     <span>Demo:</span>
                     <span className={biddingState === 'BIDDING_WAR' ? 'text-cyan-400 font-bold' : ''}>{dominantDemographic}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-700 pb-1 pt-1">
                     <span>Est. Age:</span>
                     <span className={biddingState === 'BIDDING_WAR' ? 'text-cyan-400 font-bold' : ''}>{averageAge} yrs</span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span>Energy:</span>
                     <span className={biddingState === 'BIDDING_WAR' ? 'text-pink-400 font-bold' : ''}>{crowdEnergy}%</span>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05060d] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ad Server Log</span>
                 {biddingState === 'BIDDING_WAR' && <span className="text-pink-400 animate-pulse">Algorithm Bidding...</span>}
                 {biddingState === 'AD_DELIVERED' && <span className="text-emerald-400 animate-pulse">Asset Rendered</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'CV' ? 'text-cyan-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 'text-slate-400'
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
            
            {/* LED Screen & CV Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">LED TOTEM #14</span>
                <span className="text-[8px] font-mono text-slate-400">CV & AD RENDER</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center pt-8">
                
                {/* Physical LED Screen Stand */}
                <div className="absolute bottom-0 w-8 h-24 bg-slate-800 border-x-2 border-slate-600"></div>
                <div className="absolute bottom-0 w-32 h-4 bg-slate-700 rounded-t border-t-2 border-slate-500"></div>

                {/* The Digital Ad Screen */}
                <div className={`relative w-40 h-64 border-4 bg-black rounded z-10 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                  biddingState === 'AD_DELIVERED' ? 'border-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.5)]' :
                  engineActive ? 'border-slate-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-slate-700'
                }`}>
                  
                  {/* Glare/Reflection */}
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent z-20 pointer-events-none"></div>

                  {/* Ad Content */}
                  {!engineActive ? (
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">OFFLINE</span>
                  ) : biddingState === 'BIDDING_WAR' ? (
                    <div className="flex flex-col items-center">
                       <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest mt-4 animate-pulse">RTB AUCTION...</span>
                       <span className="text-[12px] font-mono text-white mt-2">${winningBid.toFixed(2)}</span>
                    </div>
                  ) : biddingState === 'AD_DELIVERED' && currentWinner.includes('Red Bull') ? (
                    <div className="w-full h-full bg-blue-900 flex flex-col items-center justify-center animate-fade-in-up">
                       <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_#facc15]">
                         <span className="text-red-600 text-2xl font-black">RB</span>
                       </div>
                       <span className="text-white font-black italic tracking-wider">ENERGY</span>
                       <span className="text-[6px] text-blue-200 mt-1 uppercase">Targeted: Gen Z</span>
                    </div>
                  ) : biddingState === 'AD_DELIVERED' && currentWinner.includes('Rolex') ? (
                    <div className="w-full h-full bg-emerald-900 flex flex-col items-center justify-center animate-fade-in-up">
                       <span className="text-yellow-500 text-4xl mb-2 drop-shadow-[0_0_10px_#eab308]">♕</span>
                       <span className="text-white font-serif tracking-[0.3em] text-sm">LUXURY</span>
                       <span className="text-[6px] text-emerald-200 mt-2 uppercase">Targeted: VIP</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-30">
                       <span className="text-4xl text-slate-400 mb-2">✦</span>
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">EVENTRA PROMO</span>
                    </div>
                  )}

                  {/* CV Camera Node */}
                  <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full border border-slate-700 flex items-center justify-center z-30">
                    <div className={`w-1 h-1 rounded-full ${engineActive ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 'bg-slate-800'}`}></div>
                  </div>

                </div>
                
                {/* Simulated Crowd in front of screen */}
                {engineActive && (
                  <div className="absolute bottom-6 flex space-x-2 z-20">
                     <div className="flex flex-col items-center">
                       {/* Bounding box UI from CV perspective */}
                       <div className={`w-8 h-12 border border-cyan-400/50 rounded-sm relative ${biddingState === 'BIDDING_WAR' ? 'animate-pulse bg-cyan-400/20' : ''}`}>
                         <div className="absolute -top-3 left-0 bg-cyan-400 text-black text-[5px] font-black px-1 rounded-sm">
                           {averageAge}y
                         </div>
                       </div>
                     </div>
                     <div className="flex flex-col items-center">
                       <div className={`w-6 h-10 border border-cyan-400/50 rounded-sm relative ${biddingState === 'BIDDING_WAR' ? 'animate-pulse bg-cyan-400/20' : ''}`}></div>
                     </div>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerGenZSurge}
                disabled={!engineActive || biddingState !== 'AUCTION_OPEN'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !engineActive || biddingState !== 'AUCTION_OPEN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-blue-950/40 border-blue-900 text-blue-400 hover:bg-blue-900/60'
                }`}
              >
                Inject Gen Z Crowd
              </button>
              
              <button 
                onClick={triggerLuxurySurge}
                disabled={!engineActive || biddingState !== 'AUCTION_OPEN'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !engineActive || biddingState !== 'AUCTION_OPEN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Inject VIP/Affluent Crowd
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SponsorshipBiddingEngine;
