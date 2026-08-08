import React, { useState, useEffect } from 'react';

const DynamicPricingEngine = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [basePrice, setBasePrice] = useState(150.00);
  const [currentPrice, setCurrentPrice] = useState(150.00);
  
  // Algorithmic Factors
  const [inventory, setInventory] = useState(842); // Remaining tickets
  const [socialSentiment, setSocialSentiment] = useState(65); // 0-100 score
  const [weatherIndex, setWeatherIndex] = useState('Clear (Ideal)');
  
  // Sales & Revenue Data
  const [ticketsSoldInLastHour, setTicketsSoldInLastHour] = useState(12);
  const [projectedAdditionalRevenue, setProjectedAdditionalRevenue] = useState(0);

  // Time until doors
  const [hoursToEvent, setHoursToEvent] = useState(48);

  const [priceLog, setPriceLog] = useState([
    { hour: 48, price: 150.00, reason: 'Engine Initialized. Base price set.' }
  ]);

  useEffect(() => {
    let simInterval;
    
    if (engineActive && hoursToEvent > 0) {
      simInterval = setInterval(() => {
        setHoursToEvent(prev => {
          const nextHour = prev - 1;
          
          if (nextHour <= 0) {
            setEngineActive(false);
            return 0;
          }

          // Simulate changing conditions
          const newInventory = inventory - Math.floor(Math.random() * 20) - 5;
          setInventory(Math.max(0, newInventory));
          
          const newSentiment = Math.min(100, Math.max(0, socialSentiment + (Math.random() * 10 - 3)));
          setSocialSentiment(newSentiment);
          
          let newWeather = weatherIndex;
          if (nextHour === 24) newWeather = 'Light Rain (Sub-optimal)';
          if (nextHour === 12) newWeather = 'Clear (Ideal)';
          setWeatherIndex(newWeather);
          
          // Calculate new price based on factors
          let priceMultiplier = 1.0;
          
          // Scarcity factor (Inventory dropping)
          if (newInventory < 500) priceMultiplier += 0.15;
          if (newInventory < 200) priceMultiplier += 0.30;
          if (newInventory < 50) priceMultiplier += 0.50;
          
          // Hype factor (Sentiment rising as event approaches)
          if (newSentiment > 80) priceMultiplier += 0.20;
          
          // Weather factor
          if (newWeather.includes('Rain')) priceMultiplier -= 0.10; // Drop price slightly to maintain sales
          
          // Urgency factor (Time running out)
          if (nextHour < 24) priceMultiplier += 0.10;
          if (nextHour < 6) priceMultiplier += 0.25;

          const calculatedPrice = basePrice * priceMultiplier;
          setCurrentPrice(calculatedPrice);
          
          // Logging the adjustment reason
          let reasonStr = 'Adjusted for: ';
          if (newInventory < 500) reasonStr += 'High Scarcity. ';
          if (newSentiment > 80) reasonStr += 'High Social Hype. ';
          if (newWeather.includes('Rain')) reasonStr += 'Weather Risk. ';
          if (nextHour < 6) reasonStr += 'Extreme Urgency. ';
          
          setPriceLog(prevLog => [{ hour: nextHour, price: calculatedPrice, reason: reasonStr }, ...prevLog].slice(0, 7));
          
          // Revenue projection
          const avgSalesPerHr = 15;
          const revenueIncrease = (calculatedPrice - basePrice) * avgSalesPerHr * nextHour;
          setProjectedAdditionalRevenue(revenueIncrease > 0 ? revenueIncrease : 0);
          
          return nextHour;
        });
      }, 1000); // 1 tick = 1 hour simulation
    }
    
    return () => clearInterval(simInterval);
  }, [engineActive, hoursToEvent, inventory, socialSentiment, weatherIndex, basePrice]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: FinTech Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/50 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Yield Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Algorithmic Dynamic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">Ticket Pricing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Organizers lose out on massive potential revenue by leaving the final 10% of tickets at a static price when demand is sky-high hours before doors open. Eventra implements an airline-style algorithmic pricing engine for the final 48 hours of sales. The algorithm factors in remaining inventory, social media sentiment, and local weather forecasts to perfectly optimize the final yield curve.
          </p>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">⚙️</span> Engine Telemetry
               </h3>
               
               <button 
                 onClick={() => setEngineActive(!engineActive)}
                 disabled={hoursToEvent === 0}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center disabled:opacity-50 ${
                   engineActive ? 'bg-slate-800 text-lime-500 border border-lime-500/50 hover:bg-slate-700' : 'bg-lime-600 hover:bg-lime-500 text-slate-900 shadow-[0_0_15px_rgba(101,163,13,0.4)]'
                 }`}
               >
                 {engineActive && <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mr-2 animate-pulse"></span>}
                 {engineActive ? 'Engine Engaged' : (hoursToEvent === 0 ? 'Doors Open' : 'Start 48Hr Simulation')}
               </button>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Inventory Factor */}
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Inventory</span>
                 <span className={`text-2xl font-black font-mono ${inventory < 200 ? 'text-red-400' : 'text-white'}`}>
                   {inventory}
                 </span>
                 <span className="text-[9px] text-slate-500 mt-1 uppercase">Tickets Left</span>
               </div>

               {/* Sentiment Factor */}
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center text-center relative overflow-hidden">
                 <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                    <div className="h-full bg-lime-500 transition-all" style={{width: `${socialSentiment}%`}}></div>
                 </div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Social Hype</span>
                 <span className="text-2xl font-black text-white font-mono">
                   {socialSentiment.toFixed(0)}<span className="text-sm text-slate-500">/100</span>
                 </span>
               </div>

               {/* Weather Factor */}
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Local Weather</span>
                 <span className="text-sm font-black text-white leading-tight">
                   {weatherIndex}
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-2">
                 <span className="text-slate-500 uppercase font-bold tracking-widest">Algorithmic Adjustment Log</span>
                 <span className="text-lime-500 font-bold text-xs uppercase animate-pulse">
                   T-Minus: {hoursToEvent} Hours
                 </span>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2 flex flex-col">
                 {priceLog.map((log, i) => (
                   <div key={i} className="flex justify-between items-start animate-fade-in-up border-b border-slate-800/50 pb-2">
                     <div>
                       <span className="text-lime-500 font-bold mr-2">[{log.hour}h]</span>
                       <span className="text-white font-bold mr-2">${log.price.toFixed(2)}</span>
                       <span className="text-slate-500">{log.reason}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Organizer Dashboard / Attendee View (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          {/* Organizer Yield View */}
          <div className="w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
             {engineActive && (
               <div className="absolute top-0 right-0 bg-lime-600/20 text-lime-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-l border-b border-lime-500/30 flex items-center">
                 <span className="w-2 h-2 bg-lime-500 rounded-full mr-2 animate-ping"></span> OPTIMIZING YIELD
               </div>
             )}
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Revenue Intelligence</h3>
             
             <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Base Static Price vs. Dynamic Price</p>
                  <div className="flex items-end space-x-4">
                    <span className="text-2xl font-mono text-slate-600 line-through">${basePrice.toFixed(2)}</span>
                    <span className="text-5xl font-black font-mono text-lime-400">${currentPrice.toFixed(2)}</span>
                    <span className="text-sm font-bold text-lime-500 mb-1">
                      (+{(((currentPrice - basePrice) / basePrice) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-lime-500/70 uppercase font-bold tracking-widest mb-2 flex items-center">
                    <span className="text-sm mr-2">💰</span> Projected Additional Revenue Generated
                  </p>
                  <p className="text-3xl font-black font-mono text-white">
                    +${projectedAdditionalRevenue.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-2 uppercase">Due to algorithmic adjustments over the last 48hrs</p>
                </div>
             </div>
          </div>

          {/* Attendee Mobile View Simulator */}
          <div className="w-full bg-white rounded-3xl border-[8px] border-slate-800 shadow-xl flex flex-col h-[250px] overflow-hidden font-sans relative">
             <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
               <div>
                 <h4 className="font-black text-slate-900 leading-tight">Global Tech Summit</h4>
                 <p className="text-xs text-red-600 font-bold uppercase tracking-widest mt-1 animate-pulse">Very High Demand</p>
               </div>
             </div>
             
             <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Current Ticket Price</p>
                <p className="text-4xl font-black text-slate-900 transition-all duration-300 transform scale-110">
                  ${currentPrice.toFixed(2)}
                </p>
                {engineActive && (
                  <p className="text-[10px] text-slate-400 mt-3 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Prices are fluctuating based on demand.
                  </p>
                )}
             </div>
             
             <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button className="w-full bg-black text-white font-black py-3 rounded-xl shadow-lg uppercase tracking-widest text-sm hover:bg-slate-800 transition">
                  Buy Now
                </button>
             </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default DynamicPricingEngine;
