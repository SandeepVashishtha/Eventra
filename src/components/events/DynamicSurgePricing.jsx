/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicSurgePricing = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(250.0); // Base price $250
  const [socialMomentum, setSocialMomentum] = useState(50); // 0-100 scale
  const [salesVelocity, setSalesVelocity] = useState(15); // Tickets per minute
  
  const [appLog, setAppLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Pricing Engine Initialized. Base GA Tier 1: $250.00' },
    { id: 2, time: '12:00:05', type: 'API', msg: 'Connected to Spotify API & Twitter Firehose for sentiment analysis.' }
  ]);

  useEffect(() => {
    let loop;
    if (engineActive) {
      loop = setInterval(() => {
        // Naturally drift social momentum up and down a bit
        setSocialMomentum(prev => {
          let next = prev + (Math.random() * 6 - 3);
          return Math.max(10, Math.min(100, next));
        });

        // Drift sales velocity based on momentum
        setSalesVelocity(prev => {
          let next = prev + (socialMomentum > 75 ? Math.random() * 5 : Math.random() * 2 - 1);
          return Math.max(0, next);
        });

        // Calculate dynamic price based on momentum and velocity
        setTicketPrice(prev => {
          let base = 250;
          let surge = 0;
          
          if (socialMomentum > 80 && salesVelocity > 40) {
            surge = (socialMomentum - 80) * 2 + (salesVelocity - 40) * 0.5;
          } else if (socialMomentum < 30 && salesVelocity < 10) {
            surge = -((30 - socialMomentum) * 1.5);
          }
          
          // Smooth the price transition
          let targetPrice = base + surge;
          // Clamp price between $199 and $450
          targetPrice = Math.max(199, Math.min(450, targetPrice));
          
          return prev + (targetPrice - prev) * 0.1;
        });

      }, 1000);
    }
    return () => clearInterval(loop);
  }, [engineActive, socialMomentum, salesVelocity]);

  const simulateViralMoment = () => {
    if (engineActive) {
      setSocialMomentum(98);
      setSalesVelocity(85);
      
      addLog('WARN', 'VIRAL SPIKE DETECTED: Headliner trending #1 on X in host city.');
      addLog('ACTION', 'Engaging extreme surge pricing algorithms to capture demand curve.');
    }
  };

  const simulateLowDemand = () => {
    if (engineActive) {
      setSocialMomentum(15);
      setSalesVelocity(2);
      
      addLog('WARN', 'DEMAND SLUMP DETECTED: Spotify streams down 12% week-over-week.');
      addLog('ACTION', 'Applying algorithmic discount to stimulate slow-moving inventory.');
    }
  };

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      setTicketPrice(250.0);
      setSocialMomentum(50);
      setSalesVelocity(15);
      addLog('SYS', 'Algorithmic dynamic pricing engaged. Monitoring live APIs.');
    } else {
      setEngineActive(false);
      addLog('SYS', 'Engine paused. Freezing current tier prices.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setAppLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050c14] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Finance Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Revenue Optimization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic AI Surge <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Ticket Pricing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Static ticket pricing is inefficient, leaving millions of dollars on the table for highly demanded tiers while leaving slow-moving tiers unsold. Eventra solves this by building an algorithmic pricing engine similar to airline models. The AI analyzes real-time social media momentum on X/Twitter, Spotify streaming spikes in the host city, and live cart checkout velocity to dynamically adjust ticket prices up or down in real-time, automatically maximizing promoter revenue.
          </p>

          <div className="bg-[#0b1320] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🤖</span> Algorithmic Pricing Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Freeze Pricing' : 'Engage Dynamic AI'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Ticket Price Display */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ticketPrice > 260 ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 ticketPrice < 240 ? 'bg-orange-950/30 border-orange-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Live GA Ticket Price</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     ticketPrice > 260 ? 'text-emerald-400' : ticketPrice < 240 ? 'text-orange-400' : 'text-white'
                   }`}>
                     ${ticketPrice.toFixed(2)}
                   </span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   {ticketPrice > 260 ? (
                     <><span className="text-emerald-500 mr-1">↑</span> High Demand Surge</>
                   ) : ticketPrice < 240 ? (
                     <><span className="text-orange-500 mr-1">↓</span> Algorithmic Discount</>
                   ) : (
                     <><span className="text-slate-400 mr-1">—</span> Baseline Stability</>
                   )}
                 </div>
               </div>

               {/* Metrics Panel */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center space-y-3">
                 
                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Social Momentum</span>
                     <span className="text-xs font-mono font-bold text-teal-400">{socialMomentum.toFixed(0)}/100</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${socialMomentum}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Sales Velocity</span>
                     <span className="text-xs font-mono font-bold text-blue-400">{salesVelocity.toFixed(0)} tkt/m</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, (salesVelocity/100)*100)}%` }}></div>
                   </div>
                 </div>

               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Data Ingestion Log</span>
                 {engineActive && <span className="text-teal-400 animate-pulse">Calculating...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {appLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-300 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'API' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Eventra Ticketing Web Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
              <span className="text-slate-800 text-[10px] font-black uppercase tracking-widest flex items-center">
                Eventra Web Checkout
              </span>
              <span className="text-[10px] font-mono text-teal-600">
                LIVE_INVENTORY
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-50 overflow-hidden pt-16 p-5">
               
               <div className="mb-6">
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">Neon Desert 2026</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">3-Day General Admission</p>
               </div>

               {/* Mock Image */}
               <div className="w-full h-32 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl mb-6 shadow-md relative overflow-hidden flex items-center justify-center">
                 <span className="text-white text-4xl font-black uppercase tracking-widest opacity-20">FESTIVAL</span>
                 {ticketPrice > 260 && (
                   <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest animate-pulse">
                     High Demand
                   </div>
                 )}
               </div>

               {/* Live Price Block */}
               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 relative overflow-hidden transition-all duration-500">
                 
                 {/* Flash effect when price changes rapidly */}
                 {engineActive && Math.abs(ticketPrice - 250) > 10 && (
                   <div className="absolute inset-0 bg-teal-500/10 animate-pulse pointer-events-none"></div>
                 )}

                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Price</p>
                 <div className="flex items-end mb-3">
                   <span className="text-4xl font-black font-mono text-slate-800 leading-none transition-all duration-300">
                     ${ticketPrice.toFixed(2)}
                   </span>
                   <span className="text-xs font-bold text-slate-400 ml-1 pb-1">+ Fees</span>
                 </div>
                 
                 <p className="text-[10px] text-slate-500 italic mb-4">
                   Prices may fluctuate based on live market demand. Secure your ticket now.
                 </p>
                 
                 <button className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-slate-800 transition shadow-md">
                   Add to Cart
                 </button>
               </div>

               {/* Simulation Controls for the Mockup */}
               <div className="mt-auto grid grid-cols-2 gap-2">
                 <button 
                   onClick={simulateViralMoment}
                   disabled={!engineActive}
                   className={`p-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition border ${
                     !engineActive ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                   }`}
                 >
                   Inject Viral Spike
                 </button>
                 <button 
                   onClick={simulateLowDemand}
                   disabled={!engineActive}
                   className={`p-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition border ${
                     !engineActive ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                   }`}
                 >
                   Inject Slump
                 </button>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicSurgePricing;
