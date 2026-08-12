import React, { useState } from 'react';

const CarbonFootprintCalculator = () => {
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);

  const calculateFootprint = () => {
    setCalculating(true);
    // Simulate API calculation
    setTimeout(() => {
      setResults({
        totalEmissions: "42.5",
        breakdown: {
          travel: "31.2",
          venue: "8.4",
          catering: "2.9"
        },
        offsetCost: "$637.50"
      });
      setCalculating(false);
    }, 1800);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8 border border-green-100">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">🌱</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Carbon Footprint Calculator</h2>
          <p className="text-sm text-gray-500">Automated ESG reporting and 1-click offsetting.</p>
        </div>
      </div>

      {!results && !calculating ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-600 mb-6">Ready to analyze travel data, venue energy usage, and catering for this event.</p>
          <button 
            onClick={calculateFootprint}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 transition"
          >
            Calculate ESG Metrics
          </button>
        </div>
      ) : calculating ? (
        <div className="py-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Aggregating emission data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b pb-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Estimated Emissions</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black text-gray-900">{results.totalEmissions}</span>
                <span className="text-xl text-gray-500 font-medium">tons CO₂e</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Offset Cost (Verified Projects)</p>
              <span className="text-2xl font-bold text-green-700">{results.offsetCost}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Emissions Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Attendee Travel & Lodging</span>
                  <span className="font-medium">{results.breakdown.travel} t</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Venue Energy Usage</span>
                  <span className="font-medium">{results.breakdown.venue} t</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Catering & Waste</span>
                  <span className="font-medium">{results.breakdown.catering} t</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between items-center mt-6">
            <div>
              <h4 className="font-semibold text-green-900">Make this event Carbon Neutral</h4>
              <p className="text-sm text-green-700 text-sm">Purchase offsets from Gold Standard verified projects.</p>
            </div>
            <button className="px-5 py-2 bg-green-600 text-white font-medium rounded shadow hover:bg-green-700">
              Purchase Offsets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonFootprintCalculator;
