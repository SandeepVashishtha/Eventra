import React, { useState, useEffect } from 'react';

const GamifiedExitDispersal = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45); // minutes until end of event
  
  // Crowd Density at Gates (percentage)
  const [gates, setGates] = useState([
    { id: 'North Gate (Main)', density: 95, status: 'critical', waitTime: 45 },
    { id: 'East Gate', density: 80, status: 'warning', waitTime: 25 },
    { id: 'South Gate (VIP)', density: 30, status: 'clear', waitTime: 5 },
    { id: 'West Gate', density: 15, status: 'clear', waitTime: 2 }
  ]);

  // Flash Sale Offers
  const [activeOffer, setActiveOffer] = useState(null);
  const [couponsRedeemed, setCouponsRedeemed] = useState(1402);
  const [revenueGenerated, setRevenueGenerated] = useState(28040); // USD

  useEffect(() => {
    let simInterval;
    
    if (simulationActive) {
      simInterval = setInterval(() => {
        
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          
          // Trigger algorithm logic based on time
          if (newTime === 30 && !activeOffer) {
            // Event is ending soon, main gates are critically congested
            setActiveOffer({
              title: "🔥 FLATTEN THE CURVE FLASH SALE",
              description: "Wait out the rush! Hang out in the Food Court for 30 minutes and get 50% off all remaining event merch.",
              timer: 1800 // 30 minutes in seconds for UI
            });
          }
          
          return newTime;
        });

        // Simulate crowd dispersing if offer is active
        if (activeOffer) {
          setGates(prev => prev.map(gate => {
            if (gate.id === 'North Gate (Main)') {
              const newDensity = Math.max(40, gate.density - 5);
              return { 
                ...gate, 
                density: newDensity,
                status: newDensity < 60 ? 'warning' : 'critical',
                waitTime: Math.max(10, gate.waitTime - 3)
              };
            }
            if (gate.id === 'East Gate') {
              const newDensity = Math.max(30, gate.density - 3);
              return { 
                ...gate, 
                density: newDensity,
                status: newDensity < 60 ? 'clear' : 'warning',
                waitTime: Math.max(5, gate.waitTime - 2)
              };
            }
            return gate;
          }));
          
          // Increase redemptions and revenue
          setCouponsRedeemed(prev => prev + Math.floor(Math.random() * 50) + 10);
          setRevenueGenerated(prev => prev + Math.floor(Math.random() * 1000) + 200);
        }

      }, 1000); // Fast simulation (1s = 1min)
    }
    
    return () => clearInterval(simInterval);
  }, [simulationActive, activeOffer]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-100 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕹️</span> Crowd Psychology
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Dynamic Exit <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">Gamification Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            At the end of a mega-event, 50,000 people rushing the main gates simultaneously causes dangerous crushes and hour-long delays. Eventra's algorithmic dispersal engine monitors live gate congestion. As the event nears the end, it automatically intercepts attendees via push notification, offering gamified flash-sale digital coupons to incentivize them to stay longer or use alternate exits, flattening the exit curve.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">📊</span> Exit Logistics Dashboard
               </h3>
               
               <button 
                 onClick={() => {
                   setSimulationActive(!simulationActive);
                   if(!simulationActive) {
                     setTimeRemaining(35);
                     setActiveOffer(null);
                     setCouponsRedeemed(1402);
                     setRevenueGenerated(28040);
                     setGates([
                       { id: 'North Gate (Main)', density: 95, status: 'critical', waitTime: 45 },
                       { id: 'East Gate', density: 80, status: 'warning', waitTime: 25 },
                       { id: 'South Gate (VIP)', density: 30, status: 'clear', waitTime: 5 },
                       { id: 'West Gate', density: 15, status: 'clear', waitTime: 2 }
                     ]);
                   }
                 }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   simulationActive ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200' : 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                 }`}
               >
                 {simulationActive && <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2 animate-pulse"></span>}
                 {simulationActive ? 'Simulation Running' : 'Trigger End of Event'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               {/* Event Timer */}
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-white">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Time to Event End</span>
                 <span className={`text-3xl font-black font-mono ${timeRemaining <= 30 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                   T - {timeRemaining}:00
                 </span>
               </div>
               
               {/* Financials generated from the gamification */}
               <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                 <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block mb-1">Flash Sale Revenue (Post-Event)</span>
                 <span className="text-3xl font-black text-emerald-600 font-mono">
                   ${revenueGenerated.toLocaleString()}
                 </span>
                 <span className="text-xs font-bold text-emerald-500 block mt-1">{couponsRedeemed.toLocaleString()} Redeemed</span>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Live Gate Congestion Metrics</span>
               
               {gates.map((gate, idx) => (
                 <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl relative overflow-hidden flex items-center">
                   
                   <div className="w-24">
                     <span className="text-slate-900 font-bold text-xs truncate block">{gate.id}</span>
                   </div>
                   
                   <div className="flex-1 px-4 relative">
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${
                         gate.status === 'critical' ? 'bg-rose-500' :
                         gate.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                       }`} style={{ width: \`\${gate.density}%\` }}></div>
                     </div>
                   </div>

                   <div className="w-20 text-right">
                     <span className={`text-sm font-black font-mono ${
                         gate.status === 'critical' ? 'text-rose-500' :
                         gate.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                       }`}>{gate.waitTime}m</span>
                     <span className="text-[9px] text-slate-400 font-bold block uppercase">Wait</span>
                   </div>

                 </div>
               ))}
             </div>

          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-950 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md bg-gradient-to-b from-black/50 to-transparent">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content Background (Map) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale">
              <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
            </div>

            {/* Mobile Content Foreground */}
            <div className="relative flex-1 flex flex-col p-6 pt-16 z-10">
              
              <div className="mb-6">
                <h2 className="text-3xl font-black text-white">Event Map</h2>
                <p className="text-slate-400 text-sm">Main stage concluding soon.</p>
              </div>

              {/* Simulated Map Markers */}
              <div className="relative flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden backdrop-blur-sm mb-6">
                 {/* Main Gate (Congested) */}
                 <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                   <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse mb-1">
                     <span className="text-white text-xs">🚶</span>
                   </div>
                   <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">45m Wait</span>
                 </div>
                 
                 {/* Alternate Gate (Clear) */}
                 <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                   <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg mb-1">
                     <span className="text-white text-xs">🚶</span>
                   </div>
                   <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">2m Wait</span>
                 </div>
              </div>
              
              {/* Fake push notification overlay */}
              {activeOffer && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                  
                  <div className="bg-white rounded-3xl p-6 shadow-2xl w-full text-center relative overflow-hidden transform transition-transform hover:scale-105">
                    
                    {/* Confetti styling background */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-400 rounded-full filter blur-3xl opacity-20"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-400 rounded-full filter blur-3xl opacity-20"></div>

                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-200">
                      <span className="text-3xl">🎁</span>
                    </div>
                    
                    <h3 className="font-black text-slate-900 text-xl leading-tight mb-2">
                      {activeOffer.title}
                    </h3>
                    
                    <p className="text-slate-600 text-xs mb-6 px-2">
                      {activeOffer.description}
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-6">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Offer Expires In</span>
                       <span className="text-2xl font-black font-mono text-pink-600 animate-pulse">29:59</span>
                    </div>

                    <button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest transition shadow-[0_0_20px_rgba(219,39,119,0.4)]">
                      Claim 50% Off Merch
                    </button>
                    
                    <button className="w-full text-slate-400 text-xs font-bold py-3 mt-2 hover:text-slate-600">
                      No thanks, I'll wait in line
                    </button>
                    
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GamifiedExitDispersal;
