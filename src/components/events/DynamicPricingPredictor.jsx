import React, { useState, useEffect } from 'react';

const DynamicPricingPredictor = () => {
  const [currentPrice, setCurrentPrice] = useState(149);
  const [projectedTurnout, setProjectedTurnout] = useState(850);
  const maxCapacity = 1200;

  // Simulation metrics
  const velocity = 4.2; // tickets per hour
  const competitorProximity = 'Low'; 
  const weatherForecast = 'Sunny (Optimal)';

  // Real-time fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time ML adjustments
      const priceChange = Math.random() > 0.5 ? 1 : -1;
      const turnoutChange = Math.random() > 0.3 ? 2 : -1;
      
      setCurrentPrice(prev => Math.min(299, Math.max(99, prev + priceChange)));
      setProjectedTurnout(prev => Math.min(maxCapacity, Math.max(0, prev + turnoutChange)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const capacityPercentage = (projectedTurnout / maxCapacity) * 100;

  return (
    <div className="p-6 bg-slate-900 min-h-[600px] flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight flex items-center">
              <span className="mr-3 text-white">📈</span> Dynamic Pricing Engine
            </h2>
            <p className="text-slate-400 font-medium mt-1">Real-time ML pricing adjustments to maximize revenue.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-emerald-900/30 border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-lg">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></span>
            ML Pipeline Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Pricing Readout */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Live Optimized Ticket Price</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-slate-500">$</span>
                  <h3 className="text-7xl font-black text-white">{currentPrice}</h3>
                </div>
                <p className="text-xs text-emerald-400 mt-2 font-bold">+14% vs Base Price</p>
              </div>

              <div className="mt-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Projected Revenue</p>
                <p className="text-2xl font-black text-emerald-300">
                  ${(projectedTurnout * currentPrice).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Model Features & Predictions */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Capacity Prediction */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex-1">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h4 className="text-lg font-black text-white">Predicted Final Turnout</h4>
                  <p className="text-sm text-slate-400">Based on current registration velocity.</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-cyan-400">{projectedTurnout}</span>
                  <span className="text-slate-500 font-bold ml-1">/ {maxCapacity}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-4 mb-2 overflow-hidden shadow-inner border border-slate-700">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${capacityPercentage > 90 ? 'bg-red-500' : capacityPercentage > 75 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                  style={{ width: `${capacityPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>0% Sold</span>
                <span>{capacityPercentage.toFixed(1)}% Capacity</span>
                <span>Sold Out</span>
              </div>
            </div>

            {/* External Factors */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex-1">
               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">ML Model Inputs (External Factors)</h4>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xl">🚀</span>
                     <span className="bg-emerald-900/50 text-emerald-400 text-[10px] font-bold uppercase px-2 py-1 rounded">High</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Sales Velocity</p>
                   <p className="font-mono text-white text-sm">{velocity} tix / hr</p>
                 </div>

                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xl">☀️</span>
                     <span className="bg-emerald-900/50 text-emerald-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Positive</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Local Weather</p>
                   <p className="font-mono text-white text-sm">{weatherForecast}</p>
                 </div>

                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xl">📅</span>
                     <span className="bg-blue-900/50 text-blue-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Favorable</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Competing Events</p>
                   <p className="font-mono text-white text-sm">{competitorProximity}</p>
                 </div>

               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricingPredictor;
