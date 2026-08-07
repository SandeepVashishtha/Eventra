/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CarbonOffsetBidding = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [emissionsTotal, setEmissionsTotal] = useState(125.4); // Tons of CO2
  const [offsetsPurchased, setOffsetsPurchased] = useState(85.2); // Tons of CO2
  const [currentPowerLoad, setCurrentPowerLoad] = useState(1.2); // MW
  
  const [transactions, setTransactions] = useState([]);
  
  const [ecoLog, setEcoLog] = useState([
    { id: 1, time: '18:00:00', type: 'IOT', msg: 'Smart meters connected to Main Stage Diesel Generators.' },
    { id: 2, time: '18:00:05', type: 'API', msg: 'Carbon Credit API (Patch.io) initialized. Offset price: $45/ton.' }
  ]);

  useEffect(() => {
    let loop;
    if (systemActive) {
      loop = setInterval(() => {
        // Power fluctuates
        setCurrentPowerLoad(prev => Math.max(0.5, prev + (Math.random() * 0.4 - 0.2)));
        
        // Emissions tick up based on power load
        setEmissionsTotal(prev => prev + (currentPowerLoad * 0.05));
        
      }, 800);
    }
    return () => clearInterval(loop);
  }, [systemActive, currentPowerLoad]);

  useEffect(() => {
    // Simulate attendees randomly buying offsets
    let txLoop;
    if (systemActive) {
      txLoop = setInterval(() => {
        if (Math.random() > 0.6) {
          const amount = Math.random() * 2 + 0.1; // Random ton amount
          const user = ['Alex M.', 'Sam T.', 'Jordan P.', 'Casey L.', 'Taylor R.'][Math.floor(Math.random()*5)];
          
          setOffsetsPurchased(prev => prev + amount);
          
          const newTx = {
            id: Date.now(),
            user,
            amount,
            cost: amount * 45 // $45 per ton
          };
          
          setTransactions(prev => [newTx, ...prev].slice(0, 4));
          addLog('TX', `Micro-donation processed: ${user} purchased ${amount.toFixed(2)} tons ($${newTx.cost.toFixed(2)}).`);
        }
      }, 1500);
    }
    return () => clearInterval(txLoop);
  }, [systemActive]);

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Festival gates open. Real-time emissions tracking engaged.');
    } else {
      setSystemActive(false);
      addLog('SYS', 'Tracking paused. Calculating final offset deficit.');
    }
  };

  const simulateLargeDonation = () => {
    if (systemActive) {
      const amount = 25.0; // Big offset
      setOffsetsPurchased(prev => prev + amount);
      
      const newTx = {
        id: Date.now(),
        user: 'Anonymous Whale',
        amount,
        cost: amount * 45
      };
      
      setTransactions(prev => [newTx, ...prev].slice(0, 4));
      addLog('SUCCESS', `MASSIVE OFFSET: Anonymous Whale wiped out 25.0 tons ($${newTx.cost.toFixed(2)}).`);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setEcoLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const netCarbon = Math.max(0, emissionsTotal - offsetsPurchased);
  const percentOffset = Math.min(100, (offsetsPurchased / emissionsTotal) * 100);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌱</span> ESG FinTech Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Carbon <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Offset Bidding</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Massive festivals generate horrific carbon footprints from diesel generators and attendee flights. Currently, post-event carbon offsets are opaque, slow, and often unverified. Eventra merges IoT power metering with FinTech APIs (like Patch). It tracks the live power consumption of the venue, calculates the exact carbon tonnage, and allows attendees to micro-donate directly in the app. This instantly purchases verified carbon offsets, gamifying sustainability and making the festival carbon-neutral in real-time.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🌍</span> Live Emissions Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={simulateLargeDonation}
                   disabled={!systemActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-700 ${
                     !systemActive ? 'opacity-50 cursor-not-allowed bg-slate-900 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                   }`}
                 >
                   Inject Large Donation
                 </button>
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Pause Telemetry' : 'Initialize IoT Grid'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Gross Emissions */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Gross Emissions</span>
                 <div className="flex items-end">
                   <span className="text-2xl font-black font-mono text-red-400 leading-none">
                     {emissionsTotal.toFixed(1)}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-0.5">tCO₂</span>
                 </div>
               </div>

               {/* Purchased Offsets */}
               <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden flex flex-col justify-center shadow-inner">
                 <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest block mb-1">Offsets Purchased</span>
                 <div className="flex items-end">
                   <span className="text-2xl font-black font-mono text-emerald-400 leading-none">
                     {offsetsPurchased.toFixed(1)}
                   </span>
                   <span className="text-xs font-bold text-emerald-700 ml-1 pb-0.5">tCO₂</span>
                 </div>
               </div>
               
               {/* Net Carbon */}
               <div className={`p-3 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-colors ${
                 netCarbon <= 0 ? 'bg-teal-900 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Net Footprint</span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${netCarbon <= 0 ? 'text-white' : 'text-slate-300'}`}>
                     {netCarbon <= 0 ? '0.0' : netCarbon.toFixed(1)}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-0.5">tCO₂</span>
                 </div>
                 {netCarbon <= 0 && <span className="absolute top-2 right-2 text-xs">🎉</span>}
               </div>

             </div>
             
             {/* Goal Progress Bar */}
             <div className="mb-6">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                 <span className="text-slate-500">Carbon Neutrality Goal</span>
                 <span className="text-emerald-400 font-mono">{percentOffset.toFixed(1)}%</span>
               </div>
               <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                 <div 
                   className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300"
                   style={{ width: `${percentOffset}%` }}
                 ></div>
               </div>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">API Integration Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {ecoLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'TX' ? 'text-teal-300' :
                       log.type === 'IOT' ? 'text-orange-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-50 rounded-[2.5rem] border-8 border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                Attendee Mobile App
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-50 pt-16">
               
               <div className="px-6 mb-6">
                 <h2 className="text-2xl font-black text-slate-800 leading-tight">Eco-Tracker</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Neon Desert Festival</p>
               </div>

               {/* Live Dashboard Card */}
               <div className="mx-4 bg-white rounded-2xl p-5 shadow-lg border border-slate-100 mb-6 relative overflow-hidden">
                 
                 {/* Decorative background */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full z-0 opacity-50"></div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-center mb-4">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl shadow-inner">
                       🌳
                     </div>
                     <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Net Footprint</p>
                       <p className={`text-xl font-black font-mono ${netCarbon <= 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                         {netCarbon <= 0 ? 'NEUTRAL' : `${netCarbon.toFixed(1)}t`}
                       </p>
                     </div>
                   </div>

                   {/* Power meter */}
                   <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Power Draw</span>
                       <span className="text-xs font-mono font-bold text-orange-500">{currentPowerLoad.toFixed(2)} MW</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-orange-400 transition-all duration-300"
                         style={{ width: `${(currentPowerLoad / 3) * 100}%` }}
                       ></div>
                     </div>
                   </div>

                   <button className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-md ${
                     systemActive ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                   }`}>
                     Offset 1 Ton ($45)
                   </button>
                 </div>
               </div>

               {/* Live Bidding Feed */}
               <div className="flex-1 bg-white rounded-t-3xl border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-5 flex flex-col relative">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Live Contributions</h3>
                   <span className="flex items-center text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                     <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${systemActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                     Syncing
                   </span>
                 </div>
                 
                 <div className="flex-1 overflow-y-hidden space-y-3 relative">
                   {/* Gradient fade at bottom */}
                   <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent z-10"></div>
                   
                   {transactions.map((tx, i) => (
                     <div key={tx.id} className="flex items-center justify-between animate-fade-in-up" style={{ opacity: 1 - (i * 0.25) }}>
                       <div className="flex items-center">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mr-3">
                           {tx.user.charAt(0)}
                         </div>
                         <div>
                           <p className="text-xs font-bold text-slate-800">{tx.user}</p>
                           <p className="text-[9px] font-mono text-slate-500">{tx.amount.toFixed(2)} tons offset</p>
                         </div>
                       </div>
                       <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                         ${tx.cost.toFixed(2)}
                       </span>
                     </div>
                   ))}
                   
                   {transactions.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                       <span className="text-2xl mb-2">🍃</span>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting contributions</p>
                     </div>
                   )}
                 </div>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarbonOffsetBidding;
