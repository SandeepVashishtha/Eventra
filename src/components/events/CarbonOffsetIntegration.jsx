import React, { useState } from 'react';

const CarbonOffsetIntegration = () => {
  const [attendeeCount, setAttendeeCount] = useState(1500);
  const [averageFlightDistance, setAverageFlightDistance] = useState(800); // miles
  const [offsetSelected, setOffsetSelected] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('idle');

  // Simple static calculation for simulation purposes
  const travelEmissions = (attendeeCount * averageFlightDistance * 0.24) / 1000; // metric tons
  const venueEmissions = 12.5;
  const cateringEmissions = 8.2;
  const totalEmissions = travelEmissions + venueEmissions + cateringEmissions;
  
  // Simulated offset cost ($15 per metric ton)
  const offsetCost = Math.round(totalEmissions * 15);

  const handlePurchaseOffset = () => {
    setTransactionStatus('processing');
    setTimeout(() => {
      setTransactionStatus('success');
      setOffsetSelected(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-stone-50 rounded-2xl shadow-xl max-w-4xl mx-auto mt-8 border border-stone-200">
      
      <div className="flex justify-between items-start mb-8 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-3xl font-black text-emerald-900 tracking-tight flex items-center">
            <span className="mr-2">🌱</span> Sustainability & Offsets
          </h2>
          <p className="text-sm text-stone-500 mt-1">Calculate your event's footprint and purchase verified carbon offsets.</p>
        </div>
        {offsetSelected && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold px-4 py-2 rounded-lg flex items-center shadow-sm">
            <span>✅ 100% Carbon Neutral Event</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Calculator Panel */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-800 mb-4 text-lg">Event Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Estimated Attendees</label>
                <input 
                  type="range" 
                  min="50" 
                  max="5000" 
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="text-right text-sm font-bold text-stone-700 mt-1">{attendeeCount.toLocaleString()} pax</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Avg. Flight Distance (Miles)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="3000" 
                  value={averageFlightDistance}
                  onChange={(e) => setAverageFlightDistance(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="text-right text-sm font-bold text-stone-700 mt-1">{averageFlightDistance.toLocaleString()} mi</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Emissions Breakdown</h4>
              <div className="space-y-2 text-sm font-medium text-stone-700">
                <div className="flex justify-between">
                  <span>✈️ Travel</span>
                  <span>{travelEmissions.toFixed(1)} tCO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span>🏢 Venue Energy</span>
                  <span>{venueEmissions.toFixed(1)} tCO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span>🍔 Catering</span>
                  <span>{cateringEmissions.toFixed(1)} tCO₂e</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total & Checkout Panel */}
        <div className="w-full md:w-1/2">
          <div className="bg-emerald-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-700 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="relative z-10">
              <p className="text-emerald-200 font-bold uppercase tracking-widest text-xs mb-1">Total Estimated Footprint</p>
              <div className="flex items-end space-x-2">
                <h3 className="text-5xl font-black">{totalEmissions.toFixed(1)}</h3>
                <span className="text-emerald-300 font-medium mb-1">Metric Tons CO₂e</span>
              </div>
            </div>

            <div className="relative z-10 mt-8">
              {!offsetSelected ? (
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/20">
                  <h4 className="font-bold text-lg mb-2">Offset via Patch API</h4>
                  <p className="text-sm text-emerald-100 mb-4">Invest in verified reforestation and direct air capture projects to neutralize your event's impact.</p>
                  
                  <div className="flex justify-between items-center mb-6 py-3 border-y border-white/20">
                    <span className="font-bold">Total Cost ($15/ton)</span>
                    <span className="text-2xl font-black">${offsetCost.toLocaleString()}</span>
                  </div>

                  {transactionStatus === 'idle' ? (
                    <button 
                      onClick={handlePurchaseOffset}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 rounded-lg shadow-lg transition"
                    >
                      Purchase Verified Offsets
                    </button>
                  ) : (
                    <button disabled className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Processing via Patch...
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white text-emerald-900 p-6 rounded-lg text-center shadow-lg">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    🌍
                  </div>
                  <h4 className="font-black text-xl mb-1">Thank You!</h4>
                  <p className="text-sm text-stone-500 font-medium mb-4">
                    You have successfully neutralized {totalEmissions.toFixed(1)} metric tons of carbon.
                  </p>
                  <a href="#" className="text-xs font-bold text-emerald-600 underline">View Official Certificate</a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarbonOffsetIntegration;
