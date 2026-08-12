import React, { useState } from 'react';

const ESGCarbonTracker = () => {
  const [offsetPurchased, setOffsetPurchased] = useState(false);
  const [processing, setProcessing] = useState(false);

  const footprintData = {
    totalEmissions: 42.5, // Tonnes CO2e
    breakdown: [
      { category: 'Attendee Flights', value: 28.3, color: 'bg-red-400' },
      { category: 'Venue Energy', value: 8.7, color: 'bg-orange-400' },
      { category: 'Catering & Waste', value: 3.5, color: 'bg-yellow-400' },
      { category: 'Local Transit', value: 2.0, color: 'bg-blue-400' }
    ]
  };

  const offsetCostPerTonne = 24.50;
  const totalCost = footprintData.totalEmissions * offsetCostPerTonne;

  const handlePurchase = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setOffsetPurchased(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-stone-50 min-h-screen font-sans text-stone-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-stone-900 flex items-center">
              <span className="mr-3 text-emerald-500">🌱</span> ESG Sustainability Hub
            </h1>
            <p className="text-stone-500 font-medium mt-1">Real-time carbon tracking and verified offset purchasing.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            {offsetPurchased ? (
               <div className="bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-2 rounded-xl border border-emerald-200 flex items-center shadow-sm">
                 <span className="text-emerald-500 mr-2">✓</span> Carbon Neutral Event
               </div>
            ) : (
               <div className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
                 Action Required: Offset Pending
               </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Footprint Readout */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-100 rounded-full -mr-10 -mt-10"></div>
              
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 relative z-10">Total Projected Emissions</h3>
              
              <div className="flex items-end space-x-2 relative z-10">
                <span className="text-6xl font-black text-stone-900">{footprintData.totalEmissions}</span>
                <span className="text-lg font-bold text-stone-400 mb-1">tCO₂e</span>
              </div>
              
              <p className="text-xs text-stone-500 mt-4 leading-relaxed font-medium">
                Calculated dynamically via API based on 1,200 attendee origin zip codes and venue baseline consumption.
              </p>
            </div>

            {/* Offset Action Card */}
            <div className={`rounded-3xl p-6 shadow-sm border transition-colors duration-500 ${offsetPurchased ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'}`}>
              {!offsetPurchased ? (
                <>
                  <h3 className="font-bold text-stone-900 mb-1">Purchase Verified Offsets</h3>
                  <p className="text-xs text-stone-500 mb-6">Invest in Gold Standard certified reforestation projects.</p>
                  
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 mb-6">
                    <div className="flex justify-between text-sm font-medium text-stone-600 mb-2">
                      <span>{footprintData.totalEmissions} Tonnes @ ${offsetCostPerTonne}</span>
                      <span>${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-black text-stone-900 text-lg">
                      <span>Total</span>
                      <span>${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePurchase}
                    disabled={processing}
                    className={`w-full py-3 rounded-xl font-black shadow-lg transition ${processing ? 'bg-stone-300 text-stone-600' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/30'}`}
                  >
                    {processing ? 'Processing Secure Payment...' : 'Offset Now via Stripe'}
                  </button>
                </>
              ) : (
                <div className="text-center py-6 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-200">
                    🌲
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-2">Thank You!</h3>
                  <p className="text-sm font-medium text-emerald-700 mb-6 px-4">
                    42.5 tonnes of CO₂e have been successfully offset via the Amazon Reforestation Initiative.
                  </p>
                  <button className="text-sm font-bold text-stone-500 hover:text-stone-800 underline">
                    Download Certificate (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown & Analytics */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-stone-200 p-8 flex flex-col">
            <h3 className="text-lg font-bold text-stone-900 mb-6">Emissions Breakdown</h3>
            
            {/* Visual Bar Chart */}
            <div className="w-full h-8 flex rounded-xl overflow-hidden mb-8 shadow-inner bg-stone-100">
              {footprintData.breakdown.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`h-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${(item.value / footprintData.totalEmissions) * 100}%` }}
                ></div>
              ))}
            </div>

            {/* Legend / Detailed List */}
            <div className="space-y-4 flex-1">
              {footprintData.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-bold text-stone-700 text-sm">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-stone-900">{item.value}</span>
                    <span className="text-xs text-stone-500 font-bold ml-1">tCO₂e</span>
                    <span className="text-xs text-stone-400 font-medium ml-4 w-12 inline-block">
                      {Math.round((item.value / footprintData.totalEmissions) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-stone-100 flex items-start space-x-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-blue-500 text-lg">💡</span>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Mitigation Insight</h4>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  Attendee flights account for 66% of your footprint. For your next event, consider offering localized hybrid hubs to reduce cross-country air travel, potentially saving 18 tCO₂e.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ESGCarbonTracker;
