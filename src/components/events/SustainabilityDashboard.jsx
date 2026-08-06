import React, { useState } from 'react';

const SustainabilityDashboard = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState(null);

  const calculateImpact = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setData({
        total: 145.8,
        travel: 112.4,
        venue: 24.1,
        catering: 9.3,
        offsetPrice: 2187.00 // $15 per ton
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-3xl mx-auto mt-8 border-t-8 border-green-500">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Event Sustainability Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Measure and mitigate your carbon footprint instantly.</p>
        </div>
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl shadow-sm">
          🌍
        </div>
      </div>

      {!data && !analyzing ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-6 font-medium text-lg">Event data loaded. Ready to calculate environmental impact.</p>
          <button 
            onClick={calculateImpact}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition transform hover:-translate-y-1"
          >
            Run Carbon Calculation
          </button>
        </div>
      ) : analyzing ? (
        <div className="py-16 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-bold text-lg animate-pulse">Aggregating travel, venue, and catering data...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Top Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">☁️</div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Carbon Emissions</p>
              <div className="flex items-end space-x-2">
                <span className="text-5xl font-black">{data.total}</span>
                <span className="text-xl text-gray-400 font-medium mb-1">tCO₂e</span>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
              <p className="text-sm text-green-800 font-bold uppercase tracking-wider mb-2">Required Offset Investment</p>
              <span className="text-4xl font-black text-green-700">${data.offsetPrice.toLocaleString()}</span>
              <p className="text-xs text-green-600 mt-2 font-medium">Based on Gold Standard projects @ $15/ton</p>
            </div>
          </div>

          {/* Breakdown Bars */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Emissions Breakdown</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-blue-800 flex items-center"><span className="mr-2">✈️</span> Attendee Travel (Flights/Transit)</span>
                  <span>{data.travel} tCO₂e</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(data.travel / data.total) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-yellow-800 flex items-center"><span className="mr-2">⚡</span> Venue Energy Usage</span>
                  <span>{data.venue} tCO₂e</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                  <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${(data.venue / data.total) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-red-800 flex items-center"><span className="mr-2">🍔</span> Catering & Waste</span>
                  <span>{data.catering} tCO₂e</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                  <div className="bg-red-400 h-3 rounded-full" style={{ width: `${(data.catering / data.total) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="bg-gray-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <h4 className="font-bold text-white text-lg">Achieve Carbon Neutrality</h4>
              <p className="text-gray-400 text-sm mt-1">Instantly purchase verified carbon offsets via our API integration.</p>
            </div>
            <button className="px-6 py-3 bg-green-500 hover:bg-green-400 text-gray-900 font-bold rounded-lg shadow-md transition">
              Purchase Offsets Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityDashboard;
