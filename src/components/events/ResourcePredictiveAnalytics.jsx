import React, { useState, useEffect } from 'react';

const ResourcePredictiveAnalytics = () => {
  const [modelRunning, setModelRunning] = useState(true);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    // Simulate ML prediction model crunching data
    const timer = setTimeout(() => {
      setPredictions({
        food: { estimated: 720, ordered: 1000, recommendedReduction: 250 },
        coffee: { peakTimes: ['09:30 AM', '02:15 PM'], refillProbability: '94%' },
        seating: { trackA: 450, trackB: 120, overflowRequired: false }
      });
      setModelRunning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-4xl mx-auto mt-8 border-t-8 border-indigo-600">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Predictive Resource Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Dynamic forecasting based on historical data & live check-ins.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${modelRunning ? 'bg-indigo-400' : 'bg-green-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${modelRunning ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {modelRunning ? 'Model Training...' : 'Model Live'}
          </span>
        </div>
      </div>

      {modelRunning ? (
        <div className="bg-gray-50 rounded-xl p-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-bold text-gray-800">Processing Live Data Streams</h3>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
            Correlating early morning check-in rates with historical attrition data to optimize today's resource allocation...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Catering Optimization */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🍔</span> Catering
              </h3>
              <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-1 rounded">Waste Risk</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Current Order</p>
                <p className="text-2xl font-black text-gray-400 line-through">{predictions.food.ordered} meals</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-800 uppercase font-bold">Predicted Need (Based on 15% attrition)</p>
                <p className="text-3xl font-black text-indigo-700">{predictions.food.estimated} meals</p>
              </div>
              <button className="w-full py-2 bg-white border-2 border-red-200 text-red-600 font-bold rounded hover:bg-red-50 text-sm">
                Cancel {predictions.food.recommendedReduction} meals (Save $4,500)
              </button>
            </div>
          </div>

          {/* Coffee Stations */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">☕</span> Coffee Stations
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Predicted Peak Rushes</p>
                <div className="flex space-x-2 mt-1">
                  {predictions.coffee.peakTimes.map(time => (
                    <span key={time} className="bg-orange-100 text-orange-800 font-bold px-2 py-1 rounded text-sm">{time}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold">Refill Probability at 09:30 AM</p>
                <div className="flex items-center mt-1">
                  <div className="flex-grow bg-gray-200 h-2 rounded-full mr-3">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: predictions.coffee.refillProbability }}></div>
                  </div>
                  <span className="font-bold text-orange-600 text-sm">{predictions.coffee.refillProbability}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-tight">Action: Pre-brew 10 additional gallons by 09:15 AM to avoid lines.</p>
            </div>
          </div>

          {/* Seating & Capacity */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🪑</span> Session Seating
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-700">Track A (AI Trends)</span>
                <span className="font-bold text-red-600">{predictions.seating.trackA} expected</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-700">Track B (Compliance)</span>
                <span className="font-bold text-green-600">{predictions.seating.trackB} expected</span>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs font-bold text-yellow-800">⚠️ Capacity Alert: Track A</p>
                <p className="text-xs text-yellow-700 mt-1">Track A room max capacity is 400. Recommend moving 50 chairs from Track B immediately.</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResourcePredictiveAnalytics;
