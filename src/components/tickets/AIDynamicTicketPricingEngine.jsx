import React, { useState, useEffect } from 'react';

const AIDynamicTicketPricingEngine = () => {
  const [basePrice] = useState(199);
  const [currentPrice, setCurrentPrice] = useState(199);
  const [demandLevel, setDemandLevel] = useState('Medium'); // Low, Medium, High, Surge
  const [velocity, setVelocity] = useState(2.5); // sales per hour

  useEffect(() => {
    // Simulate ML model fluctuating demand and price
    const interval = setInterval(() => {
      const newVelocity = Math.max(0.5, velocity + (Math.random() * 4 - 2)); // fluctuate velocity
      setVelocity(newVelocity);

      let newDemand = 'Medium';
      let multiplier = 1.0;

      if (newVelocity > 10) {
        newDemand = 'Surge';
        multiplier = 1.45;
      } else if (newVelocity > 5) {
        newDemand = 'High';
        multiplier = 1.2;
      } else if (newVelocity < 1.5) {
        newDemand = 'Low';
        multiplier = 0.9;
      }

      setDemandLevel(newDemand);
      setCurrentPrice(Math.round(basePrice * multiplier));
    }, 3000);

    return () => clearInterval(interval);
  }, [basePrice, velocity]);

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-2xl max-w-4xl mx-auto mt-8 border border-slate-700">
      <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-700">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            AI Dynamic Pricing Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time ticket cost adjustment driven by ML demand modeling.</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-sm flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Model Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Pricing Dashboard */}
        <div className="col-span-2 bg-slate-800 border border-slate-600 rounded-xl p-6 relative overflow-hidden">
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Current General Admission Price</h3>
          
          <div className="flex items-end space-x-4 mb-8">
            <span className="text-6xl font-black text-white font-mono">${currentPrice}</span>
            <span className="text-xl text-slate-500 font-medium line-through mb-2">Base: ${basePrice}</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">Sales Velocity</span>
                <span className="text-white">{velocity.toFixed(1)} tix/hour</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${demandLevel === 'Surge' ? 'bg-rose-500' : demandLevel === 'High' ? 'bg-orange-500' : demandLevel === 'Medium' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                  style={{ width: `${Math.min(100, (velocity / 15) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-700">
              <span className="text-sm font-medium text-slate-300">Live Demand Status:</span>
              <span className={`text-sm font-black uppercase px-3 py-1 rounded ${demandLevel === 'Surge' ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50' : demandLevel === 'High' ? 'bg-orange-900/50 text-orange-400 border border-orange-500/50' : demandLevel === 'Medium' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50' : 'bg-blue-900/50 text-blue-400 border border-blue-500/50'}`}>
                {demandLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Price Constraints */}
        <div className="col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-5">
            <h3 className="font-bold text-slate-300 mb-3 text-sm flex items-center">
              <span className="mr-2">⚙️</span> Engine Constraints
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Price Floor</label>
                <div className="bg-slate-900 p-2 rounded border border-slate-700 text-sm font-mono text-slate-300">$175.00</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Price Ceiling</label>
                <div className="bg-slate-900 p-2 rounded border border-slate-700 text-sm font-mono text-slate-300">$299.00</div>
              </div>
              <div className="pt-2">
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded transition border border-slate-500">
                  Edit Constraints
                </button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">Revenue Impact</h4>
            <p className="text-sm text-emerald-100/70 font-medium">
              Dynamic pricing has generated an estimated <span className="font-bold text-emerald-300">+$14,250</span> in marginal revenue compared to static base pricing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIDynamicTicketPricingEngine;
