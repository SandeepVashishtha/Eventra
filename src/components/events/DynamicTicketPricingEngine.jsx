import React, { useState, useEffect } from 'react';

const DynamicTicketPricingEngine = () => {
  const [currentPrice, setCurrentPrice] = useState(299);
  const [demandLevel, setDemandLevel] = useState('Stable');
  const [ticketsSold, setTicketsSold] = useState(845);
  const [velocity, setVelocity] = useState(12); // tickets per hour
  const [autoPilot, setAutoPilot] = useState(true);

  // Simulate real-time pricing adjustments
  useEffect(() => {
    if (!autoPilot) return;
    
    const interval = setInterval(() => {
      // Simulate random ticket sales
      const newSales = Math.floor(Math.random() * 3);
      if (newSales > 0) {
        setTicketsSold(prev => prev + newSales);
        
        // Randomly spike velocity to trigger price changes
        setVelocity(prev => {
          const newVel = prev + (Math.random() > 0.7 ? 15 : -2);
          const boundedVel = Math.max(5, Math.min(newVel, 80));
          
          // Adjust price and demand label based on velocity
          if (boundedVel > 40) {
            setDemandLevel('High Surge');
            setCurrentPrice(prevPrice => Math.min(499, prevPrice + 15));
          } else if (boundedVel < 10) {
            setDemandLevel('Cooling');
            setCurrentPrice(prevPrice => Math.max(199, prevPrice - 5));
          } else {
            setDemandLevel('Stable');
          }
          
          return boundedVel;
        });
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [autoPilot]);

  return (
    <div className="p-6 bg-slate-50 min-h-[700px] font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <span className="mr-3 text-indigo-500">📈</span> Dynamic Pricing Engine
            </h1>
            <p className="text-slate-500 font-medium mt-1">AI-driven ticket price optimization based on real-time demand.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-bold text-slate-600 px-2">Autopilot Mode</span>
            <button 
              onClick={() => setAutoPilot(!autoPilot)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${autoPilot ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${autoPilot ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Price Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-700 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Live Ticket Price</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${demandLevel === 'High Surge' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : demandLevel === 'Cooling' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                      {demandLevel}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-6xl font-black">${currentPrice}</span>
                    <span className="text-lg font-medium text-indigo-200">USD</span>
                  </div>
                  <p className="text-xs text-indigo-400 mt-4 font-medium flex items-center">
                    <span className="mr-1">↻</span> Last adjusted 12 seconds ago
                  </p>
                </div>
              </div>

              {/* Metrics Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sales Velocity</p>
                  <div className="flex items-baseline space-x-2 mb-6">
                    <span className="text-3xl font-black text-slate-800">{Math.round(velocity)}</span>
                    <span className="text-sm font-bold text-slate-500">tickets / hour</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sold (GA)</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(ticketsSold / 1500) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-indigo-600">{ticketsSold}</span>
                    <span className="text-slate-400">Cap: 1,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time-Series Chart Simulation */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-64 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Price vs Demand Trajectory (Past 24h)</h3>
              <div className="flex-1 relative border-l-2 border-b-2 border-slate-100 p-2 flex items-end justify-between">
                
                {/* Simulated Chart Bars */}
                {[40, 45, 42, 60, 85, 75, 50, 48, 55, 70, 95, 80].map((height, i) => (
                  <div key={i} className="w-8 relative group">
                    <div className="absolute bottom-0 w-full bg-indigo-100 rounded-t-sm" style={{ height: `${height}%` }}></div>
                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all" style={{ height: `${height * 0.8}%` }}></div>
                    
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                      ${199 + Math.floor(height * 1.5)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Rule Engine */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full">
              <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                <span className="text-xl mr-2">⚙️</span>
                <h2 className="text-lg font-bold text-slate-900">Pricing Rules constraints</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <span>Price Floor (Min)</span>
                    <span className="text-slate-800">$199</span>
                  </label>
                  <input type="range" min="100" max="300" defaultValue="199" className="w-full accent-indigo-600" disabled={autoPilot} />
                </div>
                
                <div>
                  <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <span>Price Ceiling (Max)</span>
                    <span className="text-slate-800">$499</span>
                  </label>
                  <input type="range" min="300" max="600" defaultValue="499" className="w-full accent-indigo-600" disabled={autoPilot} />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Active Triggers</h4>
                  <ul className="space-y-2 text-xs font-medium text-slate-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span> Increase $15 if velocity &gt; 40/hr
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span> Decrease $5 if velocity &lt; 10/hr
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span> Lock ceiling 7 days prior to event
                    </li>
                  </ul>
                </div>
              </div>

              {!autoPilot && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 font-bold flex items-center">
                    <span className="mr-2">⚠️</span> Autopilot Disabled
                  </p>
                  <p className="text-[10px] text-amber-700 mt-1">Prices will not adjust automatically to market demand. You must set prices manually.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DynamicTicketPricingEngine;
